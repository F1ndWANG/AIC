"use strict";

const topics = window.knowledgeTopics ?? [];
const topicSelect = document.querySelector("#topics");
const cards = document.querySelector("#cards");
const steps = document.querySelector("#steps");
const play = document.querySelector("#play");
const status = document.querySelector("#status");
const previous = document.querySelector("#previous");
const next = document.querySelector("#next");
const speed = document.querySelector("#speed");
const progress = document.querySelector("#progress");
const position = document.querySelector("#position");

const defaultCardDuration = 5200;
const visualPlayers = [];
let currentTopic;
let cardIndex = -1;
let timer;
let finished = false;
let remaining = 0;
let startedAt = 0;
let playbackRate = Number(speed.value);

function element(tag, className, content) {
  const node = document.createElement(tag);
  if (className) node.className = className;
  if (content !== undefined) node.textContent = content;
  return node;
}

function renderVisual(visual) {
  const panel = element("div", "visual");
  panel.append(element("p", "visual-label", visual.label));
  const phases = [];
  let showScene;

  switch (visual.type) {
    case "bars":
      for (const row of visual.rows) {
        const line = element("div", "bar-row");
        const track = element("div", "bar-track");
        const fill = element("span", "bar-fill");
        const marker = element("span", "bar-marker");
        track.setAttribute("aria-hidden", "true");
        fill.style.width = row.value + "%";
        marker.style.left = row.before + "%";
        track.append(fill, marker);
        line.append(element("span", "", row.label), track,
          element("span", "bar-value", row.before + "% → " + row.value + "%"));
        panel.append(line);
        phases.push({
          node: line,
          narration: `${row.label}从 ${row.before}% 变为 ${row.value}%`,
          draw(active) {
            fill.style.width = (active ? row.value : row.before) + "%";
          }
        });
      }
      break;
    case "tokens": {
      const list = element("ul", "token-list");
      for (const token of visual.tokens) {
        const item = element("li", token.active ? "active" : "muted");
        item.append(element("span", "token-label", token.label),
          element("small", "", token.active ? "计入" : "忽略"));
        list.append(item);
        phases.push({ node: item, narration: `${token.label}${token.active ? "计入损失" : "不计入损失"}` });
      }
      panel.append(list);
      break;
    }
    case "flow": {
      const list = element("ol", "flow-list");
      for (const [index, step] of visual.steps.entries()) {
        const node = element("li", "", step);
        list.append(node);
        phases.push({ node, narration: visual.narrations?.[index] ?? step });
      }
      panel.append(list);
      if (visual.scenes?.length === visual.steps.length) {
        const stage = element("div", "lesson-stage");
        const layer = element("dl", "lesson-cells");
        stage.append(layer);
        panel.append(stage);
        showScene = (index, previous) => {
          const before = visual.scenes[previous];
          layer.replaceChildren(...visual.scenes[index].map(cell => {
            const old = before?.find(item => item.label === cell.label);
            const changed = before && (!old || old.value !== cell.value || old.meter !== cell.meter || old.slots?.used !== cell.slots?.used || old.slots?.total !== cell.slots?.total);
            const tile = element("div", changed ? "lesson-cell lesson-changed" : "lesson-cell");
            tile.append(element("dt", "", cell.label), element("dd", "", cell.value));
            if (cell.meter !== undefined) {
              const track = element("span", "lesson-track");
              track.setAttribute("aria-hidden", "true");
              const fill = element("span", "lesson-fill");
              fill.style.setProperty("--from", old?.meter !== undefined ? old.meter / 100 : 0);
              fill.style.setProperty("--to", cell.meter / 100);
              track.append(fill);
              tile.append(track);
            }
            if (cell.slots) {
              const slots = element("span", "lesson-slots");
              slots.setAttribute("aria-hidden", "true");
              for (let i = 0; i < cell.slots.total; i++) {
                const state = i >= cell.slots.used ? "empty" : i >= (old?.slots?.used ?? 0) ? "filled new" : "filled";
                slots.append(element("span", "lesson-slot " + state));
              }
              tile.append(slots);
            }
            return tile;
          }));
        };
        showScene(0);
      }
      break;
    }
    case "branches":
      for (const row of visual.rows) {
        const line = element("div", "branch");
        const arrow = element("span", "branch-arrow", "→");
        arrow.setAttribute("aria-hidden", "true");
        line.append(element("span", "branch-condition", row.condition), arrow,
          element("span", "branch-action", row.action));
        panel.append(line);
        phases.push({ node: line, narration: `遇到「${row.condition}」，执行「${row.action}」` });
      }
      break;
    case "pairs":
      for (const row of visual.rows) {
        const line = element("div", row.active ? "pair chosen" : "pair rejected");
        line.append(element("span", "pair-label", row.label), element("span", "", row.value));
        panel.append(line);
        phases.push({ node: line, narration: `${row.label} · ${row.value}` });
      }
      break;
  }

  if (visual.caption) panel.append(element("p", "visual-caption", visual.caption));
  const player = phases.length ? renderPhaseControls(phases, showScene) : null;
  if (player) panel.append(player.controls);
  return { panel, player };
}

function renderPhaseControls(phases, showScene) {
  const controls = element("div", "phase-controls");
  const explanation = element("p", "phase-explanation");
  explanation.setAttribute("role", "status");
  const back = element("button", "", "上一步");
  const forward = element("button", "", "演示机制");
  back.type = forward.type = "button";
  back.disabled = true;
  controls.append(explanation, back, forward);

  let index = -1;
  function showPhase(next) {
    showScene?.(next, index);
    index = next;
    for (const [position, phase] of phases.entries()) {
      const active = position === index;
      phase.node.classList.toggle("phase-pending", position > index);
      phase.node.classList.toggle("phase-active", active);
      phase.draw?.(position <= index);
    }
    explanation.textContent = `${index + 1} / ${phases.length} · ${phases[index].narration}`;
    back.disabled = index === 0;
    forward.textContent = index === phases.length - 1 ? "从头演示" : "下一步";
  }
  function manualPhase(next) {
    stopPlayback();
    showPhase(next);
    if (visualPlayers[cardIndex] === player) {
      remaining = player.duration(currentTopic.cards[cardIndex].durationMs);
    }
  }

  const player = {
    controls,
    get index() { return index; },
    get length() { return phases.length; },
    show: showPhase,
    duration(cardDuration = defaultCardDuration) {
      const text = phases[index]?.narration ?? "";
      return Math.max(cardDuration / phases.length, 3200, 50 * Array.from(text).length + 1200);
    }
  };
  back.addEventListener("click", () => manualPhase(index - 1));
  forward.addEventListener("click", () => manualPhase((index + 1) % phases.length));
  return player;
}

function selectCard(index) {
  cardIndex = index;
  finished = false;
  const entry = currentTopic.cards[index];
  remaining = entry?.durationMs ?? defaultCardDuration;
  progress.max = currentTopic.cards.length || 1;
  progress.value = index + 1;
  position.textContent = entry ? `${index + 1} / ${currentTopic.cards.length}` : "总览";
  previous.disabled = index < 0;
  next.disabled = index >= currentTopic.cards.length - 1;
  play.textContent = index < 0 ? "播放动效" : "从此处播放";
  cards.classList.toggle("focused", Boolean(entry));
  for (const [cardPosition, card] of Array.from(cards.children).entries()) {
    const active = cardPosition === index;
    card.classList.toggle("highlighted", active);
  }
  for (const [stepPosition, button] of Array.from(steps.children).entries()) {
    if (stepPosition === index) button.setAttribute("aria-current", "step");
    else button.removeAttribute("aria-current");
  }
  if (entry) {
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    cards.children[index].scrollIntoView({
      block: "nearest",
      inline: "nearest",
      behavior: reducedMotion ? "instant" : "smooth"
    });
  }
  status.textContent = entry ? `第 ${index + 1} 步，共 ${currentTopic.cards.length} 步。 ${entry.title}` : "已显示全部检查点";
}

function stopPlayback() {
  if (timer === undefined) return;
  clearTimeout(timer);
  timer = undefined;
  remaining = Math.max(0, remaining - (performance.now() - startedAt) * playbackRate);
  play.textContent = "继续播放";
}

function startPlayback() {
  const fresh = cardIndex < 0 || finished;
  if (fresh) selectCard(0);
  const player = visualPlayers[cardIndex];
  if (player && (fresh || player.index < 0)) {
    player.show(0);
    remaining = player.duration(currentTopic.cards[cardIndex].durationMs);
  }
  play.textContent = "暂停";
  startedAt = performance.now();
  timer = setTimeout(() => {
    timer = undefined;
    if (player && player.index + 1 < player.length) {
      player.show(player.index + 1);
      remaining = player.duration(currentTopic.cards[cardIndex].durationMs);
      startPlayback();
      return;
    }
    const nextIndex = cardIndex + 1;
    if (nextIndex === currentTopic.cards.length) {
      finished = true;
      play.textContent = "重新播放";
      status.textContent = `播放完成，共 ${currentTopic.cards.length} 步`;
      return;
    }
    selectCard(nextIndex);
    const nextPlayer = visualPlayers[nextIndex];
    if (nextPlayer) {
      nextPlayer.show(0);
      remaining = nextPlayer.duration(currentTopic.cards[nextIndex].durationMs);
    }
    startPlayback();
  }, remaining / playbackRate);
}

function navigate(index) {
  if (!currentTopic || index < -1 || index >= currentTopic.cards.length) return;
  stopPlayback();
  selectCard(index);
}


function renderExampleExperiment(experiment) {
  const panel = element("div", "example-experiment");
  const label = element("label", "", experiment.label);
  const slider = element("input");
  Object.assign(slider, { type: "range", min: experiment.min, max: experiment.max, value: experiment.initial });
  const value = element("output", "example-slider-value");
  label.append(slider, value);
  const output = element("dl", "example-data");
  output.setAttribute("aria-live", "polite");
  function update() {
    const input = Number(slider.value);
    value.textContent = [input, experiment.unit].filter(Boolean).join(" ");
    const rows = experiment.compare(input);
    const max = Math.max(1, ...rows.map(([, amount]) => amount));
    output.replaceChildren(...rows.map(([name, amount, detail]) => {
      const tile = element("div", "example-tile");
      const meter = element("div", "example-meter");
      const fill = element("span");
      fill.style.width = `${100 * amount / max}%`;
      meter.setAttribute("aria-hidden", "true");
      meter.append(fill);
      tile.append(element("dt", "", name), element("dd", "example-value", Number(amount.toFixed(2))),
        meter, element("dd", "example-before", detail));
      return tile;
    }));
  }
  slider.addEventListener("input", update);
  panel.append(label, output);
  update();
  return panel;
}

function renderWorkedExample(example) {
  const panel = document.querySelector("#worked-example");
  panel.replaceChildren();
  panel.hidden = !example;
  if (!example) return;

  let frameIndex = 0;
  const heading = element("h2", "example-title", example.title);
  heading.id = "example-title";
  const intro = element("p", "example-intro", example.intro);
  const stageNav = element("nav", "example-stages");
  stageNav.setAttribute("aria-label", "算例阶段");
  const canvas = element("div", "example-canvas");
  canvas.setAttribute("aria-live", "polite");
  const controls = element("div", "example-controls");
  const back = element("button", "", "上一步");
  const forward = element("button", "", "下一步");
  back.type = forward.type = "button";
  controls.append(back, forward);

  const predict = element("div", "example-predict");
  const prompt = element("p", "example-question", example.question);
  const choices = element("div", "example-choices");
  const feedback = element("p", "example-feedback");
  feedback.setAttribute("role", "status");
  for (const [index, choice] of example.choices.entries()) {
    const button = element("button", "", choice);
    button.type = "button";
    button.setAttribute("aria-pressed", "false");
    button.addEventListener("click", () => {
      for (const sibling of choices.children) sibling.setAttribute("aria-pressed", String(sibling === button));
      const correct = index === example.answer;
      feedback.textContent = correct
        ? "答对了。继续逐步查看计算或状态变化。"
        : "再试一次。用算例中的输入和规则逐步核对。";
      feedback.dataset.correct = String(correct);
    });
    choices.append(button);
  }
  predict.append(prompt, choices, feedback);

  function showFrame(index) {
    frameIndex = index;
    const frame = example.frames[index];
    const prior = example.frames[index - 1];
    for (const [position, button] of Array.from(stageNav.children).entries()) {
      if (position === index) button.setAttribute("aria-current", "step");
      else button.removeAttribute("aria-current");
    }
    back.disabled = index === 0;
    forward.textContent = index === example.frames.length - 1 ? "从头再看" : "下一步";
    const transition = element("div", "example-transition");
    const action = element("p", "example-action", frame.action);
    const data = element("dl", "example-data");
    for (const [key, label] of [["state", "当前状态"], ["result", "观察结果"]]) {
      const tile = element("div", "example-tile");
      const value = element("dd", "example-value", frame[key]);
      const changed = prior && prior[key] !== frame[key];
      if (changed) tile.classList.add("example-changed");
      tile.append(element("dt", "", label));
      if (changed) tile.append(element("dd", "example-before", "上一步 · " + prior[key]));
      tile.append(value);
      data.append(tile);
    }
    const reason = element("p", "example-reason", frame.reason);
    transition.append(action, data, reason);
    canvas.replaceChildren(transition);
  }

  for (const [index, frame] of example.frames.entries()) {
    const button = element("button", "", `${index + 1}. ${frame.title}`);
    button.type = "button";
    button.addEventListener("click", () => showFrame(index));
    stageNav.append(button);
  }
  back.addEventListener("click", () => showFrame(frameIndex - 1));
  forward.addEventListener("click", () => showFrame((frameIndex + 1) % example.frames.length));
  panel.append(heading, intro, predict, stageNav, canvas, controls);
  if (example.experiment) panel.append(renderExampleExperiment(example.experiment));
  showFrame(0);
}

function renderTopic(topic) {
  stopPlayback();
  currentTopic = topic;
  renderWorkedExample(window.workedExamples?.[topic.id]);
  document.title = topic.title + " | 知识动效图谱";
  document.querySelector("#title").textContent = topic.title;
  document.querySelector("#subtitle").textContent = topic.subtitle;
  document.querySelector("#note").textContent = topic.note ?? "";
  steps.replaceChildren();
  cards.replaceChildren();
  visualPlayers.length = 0;
  for (const [index, entry] of topic.cards.entries()) {
    const button = element("button", "step", `${index + 1}. ${entry.title}`);
    button.type = "button";
    button.addEventListener("click", () => navigate(index));
    steps.append(button);

    const card = element("article", "card");
    card.dataset.color = entry.color;
    const headline = element("h2");
    const number = element("span", "card-number", String(index + 1).padStart(2, "0"));
    number.setAttribute("aria-hidden", "true");
    headline.append(number, document.createTextNode(entry.title));
    card.append(headline);
    if (entry.subtitle) card.append(element("p", "card-subtitle", entry.subtitle));
    const { panel, player } = renderVisual(entry.visual);
    visualPlayers.push(player);
    card.append(panel);
    if (entry.description) card.append(element("p", "description", entry.description));
    if (entry.checkpoint) {
      const details = element("details", "card-checks card-checkpoint");
      details.append(
        element("summary", "", "自检 · " + entry.checkpoint.question),
        element("p", "", entry.checkpoint.answer)
      );
      card.append(details);
    }
    if (entry.checks?.length) {
      const details = element("details", "card-checks");
      const list = element("ul");
      for (const check of entry.checks) list.append(element("li", "", check));
      details.append(element("summary", "", "验证方法"), list);
      card.append(details);
    }
    if (entry.source) {
      const link = element("a", "card-source", entry.source.label);
      link.href = entry.source.url;
      card.append(link);
    }
    cards.append(card);
  }
  const sources = document.querySelector("#sources");
  sources.replaceChildren();
  for (const source of topic.sources ?? []) {
    const item = element("li");
    const link = element("a", "", source.label);
    link.href = source.url;
    item.append(link);
    sources.append(item);
  }
  document.querySelector("#transport").hidden = !topic.cards.length;
  play.disabled = !topic.cards.length;
  selectCard(-1);
}

for (const topic of topics) {
  const option = element("option", "", topic.title);
  option.value = topic.id;
  topicSelect.append(option);
}
topicSelect.addEventListener("change", () => {
  const topic = topics.find(({ id }) => id === topicSelect.value);
  if (topic) renderTopic(topic);
});
play.addEventListener("click", () => {
  if (timer !== undefined) {
    stopPlayback();
    return;
  }
  startPlayback();
});
previous.addEventListener("click", () => navigate(cardIndex - 1));
next.addEventListener("click", () => navigate(cardIndex + 1));
speed.addEventListener("change", () => {
  const playing = timer !== undefined;
  stopPlayback();
  playbackRate = Number(speed.value);
  if (playing) startPlayback();
});
document.querySelector("#overview").addEventListener("click", () => navigate(-1));
document.addEventListener("keydown", (event) => {
  if (event.defaultPrevented || event.altKey || event.ctrlKey || event.metaKey ||
      event.target.closest("button, select, input, summary, a, textarea, [contenteditable]")) return;

  switch (event.key) {
    case "ArrowLeft":
      event.preventDefault();
      navigate(cardIndex - 1);
      break;
    case "ArrowRight":
      event.preventDefault();
      navigate(cardIndex + 1);
      break;
    case "Escape":
      navigate(-1);
      break;
  }
});
document.querySelector("#print").addEventListener("click", () => window.print());
if (topics.length) {
  const params = new URLSearchParams(window.location.search);
  const requestedTopic = topics.find(({ id }) => id === params.get("topic"));
  const initialTopic = requestedTopic ?? topics[0];
  topicSelect.value = initialTopic.id;
  renderTopic(initialTopic);
  const step = Number(params.get("step"));
  if (requestedTopic && Number.isInteger(step) && step >= 1) navigate(step - 1);
} else {
  document.querySelector("#title").textContent = "暂无主题";
  document.querySelector("#subtitle").textContent = "请在 index.html 中加载至少一个主题脚本。";
  play.disabled = true;
  topicSelect.disabled = true;
}
