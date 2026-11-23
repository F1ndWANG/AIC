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
let stopExperimentPlayback;

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
          title: row.label,
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
        phases.push({ node: item, title: token.label, narration: `${token.label}${token.active ? "计入损失" : "不计入损失"}` });
      }
      panel.append(list);
      break;
    }
    case "flow": {
      const list = element("ol", "flow-list");
      for (const [index, step] of visual.steps.entries()) {
        const node = element("li", "", step);
        list.append(node);
        phases.push({ node, title: step, narration: visual.narrations?.[index] ?? step });
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
            tile.style.setProperty("--arrival", (visual.scenes[index].indexOf(cell) * 75) + "ms");
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
            if (old && old.value !== cell.value) {
              tile.append(element("dd", "lesson-before", "上一帧 · " + old.value));
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
        phases.push({ node: line, title: row.condition, narration: `遇到「${row.condition}」，执行「${row.action}」` });
      }
      break;
    case "pairs":
      for (const row of visual.rows) {
        const line = element("div", row.active ? "pair chosen" : "pair rejected");
        line.append(element("span", "pair-label", row.label), element("span", "", row.value));
        panel.append(line);
        phases.push({ node: line, title: row.label, narration: `${row.label} · ${row.value}` });
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
  const timeline = element("div", "phase-timeline");
  timeline.setAttribute("role", "group");
  timeline.setAttribute("aria-label", "跳转到讲解帧");
  const transcript = element("details", "phase-transcript");
  const transcriptList = element("ol");
  transcript.append(element("summary", "", "查看逐帧讲义"), transcriptList);
  const frameButtons = phases.map((phase, index) => {
    const button = element("button", "phase-jump", String(index + 1) + " · " + phase.title);
    button.type = "button";
    button.setAttribute("aria-label", `第 ${index + 1} 帧 · ${phase.title}`);
    button.title = phase.title;
    button.addEventListener("click", () => manualPhase(index));
    timeline.append(button);
    transcriptList.append(element("li", "", phase.narration));
    return button;
  });
  controls.append(explanation, back, forward, timeline, transcript);

  let index = -1;
  function showPhase(next) {
    showScene?.(next, index);
    index = next;
    for (const [position, phase] of phases.entries()) {
      const active = position === index;
      phase.node.classList.toggle("phase-pending", position > index);
      phase.node.classList.toggle("phase-active", active);
      if (active) frameButtons[position].setAttribute("aria-current", "step");
      else frameButtons[position].removeAttribute("aria-current");
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
      return Math.max(cardDuration / phases.length, 4200, 65 * Array.from(text).length + 1600);
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
  if (experiment.step !== undefined) slider.step = experiment.step;
  const value = element("output", "example-slider-value");
  label.append(slider, value);
  const output = element("dl", "example-data");
  output.setAttribute("aria-live", "polite");
  const diagram = element("div", "experiment-diagram");
  const explanation = element("p", "example-reason");
  const matrixPanel = element("div", "experiment-matrices");
  const cellExplanation = element("p", "matrix-explanation", "点击任意矩阵格，查看它的计算依据。");
  cellExplanation.setAttribute("role", "status");
  const matrixViews = [];
  let selectedCell;
  let activeTerm = 0;
  const tracePanel = element("div", "matrix-trace");
  tracePanel.setAttribute("role", "group");
  tracePanel.setAttribute("aria-label", "分项计算，点击高亮参与计算的矩阵格");
  const sweep = element("button", "", "自动扫参");
  const history = element("div", "experiment-history");
  history.setAttribute("role", "group");
  history.setAttribute("aria-label", "最近六次参数结果，点击回看");
  const snapshots = [];
  sweep.type = "button";
  let sweepTimer;
  function stopSweep() {
    clearTimeout(sweepTimer);
    sweepTimer = undefined;
    sweep.textContent = "自动扫参";
    sweep.setAttribute("aria-pressed", "false");
  }
  stopExperimentPlayback = stopSweep;
  function update(record = true) {
    const input = Number(slider.value);
    value.textContent = [input, experiment.unit].filter(Boolean).join(" ");
    const rows = experiment.compare(input);
    output.hidden = rows.length === 0;
    const magnitude = Math.max(1e-12, ...rows.map(([, amount]) => Math.abs(amount)));
    if (output.children.length !== rows.length) {
      output.replaceChildren(...rows.map(() => {
        const tile = element("div", "example-tile");
        const meter = element("div", "example-meter");
        const fill = element("span");
        meter.setAttribute("aria-hidden", "true");
        meter.append(fill);
        tile.append(element("dt"), element("dd", "example-value"),
          meter, element("dd", "example-before"));
        return tile;
      }));
    }
    rows.forEach(([name, amount, detail], index) => {
      const tile = output.children[index];
      tile.children[0].textContent = name;
      tile.children[1].textContent = Number(amount.toFixed(experiment.precision ?? 2));
      tile.children[2].children[0].style.width = "100%";
      tile.children[2].children[0].style.transform = `scaleX(${Math.abs(amount) / magnitude})`;
      tile.children[3].textContent = detail;
    });
    if (experiment.diagram) {
      const state = experiment.diagram(input);
      if (diagram.children.length !== state.items.length) {
        diagram.replaceChildren(...state.items.map(() => {
          const node = element("div", "experiment-item");
          node.append(element("strong"), element("span"));
          return node;
        }));
      }
      state.items.forEach((item, index) => {
        const node = diagram.children[index];
        node.className = "experiment-item " + item.state;
        node.children[0].textContent = item.label;
        node.children[1].textContent = item.detail;
        node.style.setProperty("--amount", (item.percent ?? 0) + "%");
        node.style.setProperty("--fraction", Math.max(0, Math.min(1, (item.percent ?? 0) / 100)));
      });
      explanation.textContent = state.explanation;
    }
    if (experiment.matrices) {
      const matrices = experiment.matrices(input);
      const selected = matrices[selectedCell?.matrixIndex]?.rows[selectedCell?.rowIndex]?.cells[selectedCell?.columnIndex];
      const trace = selected?.trace ?? [];
      activeTerm = Math.min(activeTerm, Math.max(0, trace.length - 1));
      const references = trace[activeTerm]?.references ?? [];
      cellExplanation.textContent = "点击任意矩阵格，查看它的计算依据。";
      matrices.forEach((matrix, matrixIndex) => {
        let view = matrixViews[matrixIndex];
        const shape = matrix.rows.length + "×" + matrix.columns.length;
        if (!view || view.shape !== shape) {
          const section = element("section", "matrix-section");
          const table = element("table", "calculation-matrix");
          const caption = element("caption", "", matrix.title);
          const head = element("thead");
          const header = element("tr");
          const corner = element("th", "", matrix.corner ?? "");
          corner.setAttribute("scope", "col");
          header.append(corner);
          for (const column of matrix.columns) {
            const th = element("th", "", column);
            th.setAttribute("scope", "col");
            header.append(th);
          }
          head.append(header);
          const body = element("tbody");
          const buttons = matrix.rows.map((row, rowIndex) => {
            const line = element("tr");
            const label = element("th", "", row.label);
            label.setAttribute("scope", "row");
            line.append(label);
            const cells = row.cells.map((_, columnIndex) => {
              const td = element("td");
              const button = element("button", "matrix-cell");
              button.type = "button";
              button.addEventListener("click", () => {
                stopSweep();
                selectedCell = { matrixIndex, rowIndex, columnIndex };
                activeTerm = 0;
                update(false);
              });
              td.append(button);
              line.append(td);
              return button;
            });
            body.append(line);
            return cells;
          });
          table.append(caption, head, body);
          section.append(table);
          view = { shape, section, caption, header, buttons };
          matrixViews[matrixIndex] = view;
        }
        view.caption.textContent = matrix.title;
        matrix.columns.forEach((column, index) => {
          view.header.children[index + 1].textContent = column;
        });
        matrix.rows.forEach((row, rowIndex) => row.cells.forEach((cell, columnIndex) => {
          const button = view.buttons[rowIndex][columnIndex];
          button.textContent = cell.text;
          button.title = cell.detail;
          button.setAttribute("aria-label", row.label + "，" + matrix.columns[columnIndex] + "，" + cell.text);
          const active = selectedCell?.matrixIndex === matrixIndex &&
            selectedCell.rowIndex === rowIndex && selectedCell.columnIndex === columnIndex;
          button.setAttribute("aria-pressed", String(active));
          button.classList.toggle("matrix-dependency", references.some(reference =>
            reference.matrix === matrixIndex && reference.row === rowIndex && reference.column === columnIndex));
          button.style.setProperty("--heat", Math.max(0, Math.min(1, cell.weight ?? 0)));
          if (active) cellExplanation.textContent = cell.detail;
        }));
      });
      const sections = matrixViews.map(view => view.section);
      if (sections.some((section, index) => matrixPanel.children[index] !== section)) {
        matrixPanel.replaceChildren(...sections);
      }
      if (tracePanel.children.length !== trace.length) {
        tracePanel.replaceChildren(...trace.map((_, index) => {
          const button = element("button", "trace-term");
          button.type = "button";
          button.addEventListener("click", () => {
            activeTerm = index;
            update(false);
          });
          return button;
        }));
      }
      trace.forEach((term, index) => {
        const button = tracePanel.children[index];
        button.textContent = term.text;
        button.setAttribute("aria-pressed", String(index === activeTerm));
      });
    }
    if (record && snapshots.at(-1)?.input !== input) {
      snapshots.push({ input, result: rows.map(([name, amount]) =>
        name + " " + Number(amount.toFixed(experiment.precision ?? 2))).join(" · ") });
      if (snapshots.length > 6) snapshots.shift();
    }
    if (history.children.length !== snapshots.length) {
      history.replaceChildren(...snapshots.map((_, index) => {
        const button = element("button", "experiment-snapshot");
        button.type = "button";
        button.append(element("strong"), element("span"));
        button.addEventListener("click", () => {
          stopSweep();
          slider.value = snapshots[index].input;
          update(false);
        });
        return button;
      }));
    }
    snapshots.forEach((snapshot, index) => {
      const button = history.children[index];
      button.children[0].textContent = "参数 " + snapshot.input;
      button.children[1].textContent = snapshot.result || experiment.snapshot?.(snapshot.input) || experiment.diagram(snapshot.input).explanation;
      button.setAttribute("aria-pressed", String(snapshot.input === input));
    });
  }
  slider.addEventListener("input", () => {
    stopSweep();
    update();
  });
  panel.append(label, output);
  if (experiment.diagram) panel.append(diagram, explanation);
  if (experiment.matrices) panel.append(matrixPanel, cellExplanation, tracePanel);
  const controls = element("div", "example-controls");
  for (const [caption, direction] of [["减小参数", -1], ["增大参数", 1], ["重置", 0]]) {
    const button = element("button", "", caption);
    button.type = "button";
    button.addEventListener("click", () => {
      stopSweep();
      const increment = Number(experiment.step ?? 1);
      slider.value = direction
        ? Math.max(experiment.min, Math.min(experiment.max, Number(slider.value) + direction * increment))
        : experiment.initial;
      update();
    });
    controls.append(button);
  }
  function advanceSweep() {
    const value = Number(slider.value);
    if (value >= experiment.max) {
      stopSweep();
      return;
    }
    slider.value = Math.min(experiment.max, value + Number(experiment.step ?? 1));
    update();
    sweepTimer = setTimeout(advanceSweep, 1800);
  }
  sweep.setAttribute("aria-pressed", "false");
  sweep.addEventListener("click", () => {
    if (sweepTimer !== undefined) {
      stopSweep();
      return;
    }
    stopPlayback();
    slider.value = experiment.min;
    update();
    sweep.textContent = "暂停扫参";
    sweep.setAttribute("aria-pressed", "true");
    sweepTimer = setTimeout(advanceSweep, 1800);
  });
  controls.append(sweep);
  panel.append(element("p", "visual-label", "最近六次结果 · 点击回看"), history);
  panel.append(controls);
  update();
  return panel;
}

function renderWorkedExample(example) {
  stopExperimentPlayback?.();
  stopExperimentPlayback = undefined;
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
  if (example.practice?.length) {
    const practice = element("section", "example-predict");
    practice.append(
      element("h3", "example-question", "读日志，定位 RAG 故障"),
      element("p", "example-intro", "四次运行都用了同一个问题。先找 A 第一次丢失的位置，或检查输出是否偏离了 A。再展开解析。")
    );
    for (const { trace, diagnosis } of example.practice) {
      const item = element("details", "card-checks");
      item.append(element("summary", "", trace), element("p", "", diagnosis));
      practice.append(item);
    }
    panel.append(practice);
  }
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
    const reading = window.knowledgeReadingNotes?.[topic.id]?.[index];
    const explanation = typeof reading === "string" ? reading : reading?.explanation;
    if (explanation) card.append(element("p", "card-subtitle card-reading", explanation));
    const { panel, player } = renderVisual(entry.visual);
    visualPlayers.push(player);
    card.append(panel);
    if (entry.description) card.append(element("p", "description", entry.description));
    if (entry.lessonNotes?.length) {
      const details = element("details", "card-checks");
      const list = element("ul");
      for (const note of entry.lessonNotes) {
        const item = element("li");
        item.append(element("strong", "", note.title), document.createTextNode("　" + note.text));
        list.append(item);
      }
      details.append(element("summary", "", "阅读讲义 · 原理与排错"), list);
      card.append(details);
    }
    if (entry.checkpoint) {
      const details = element("details", "card-checks card-checkpoint");
      details.append(
        element("summary", "", "自检 · " + entry.checkpoint.question),
        element("p", "", entry.checkpoint.answer)
      );
      card.append(details);
    }
    if (reading?.question) {
      const practice = element("details", "card-checks card-practice");
      practice.append(
        element("summary", "", "练习 · " + reading.question),
        element("p", "", reading.answer)
      );
      card.append(practice);
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
    } else if (topic.sources?.length) {
      const link = element("a", "card-source", "查看本章参考资料");
      link.href = "#sources";
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
