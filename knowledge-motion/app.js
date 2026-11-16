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
      }
      break;
    case "tokens": {
      const list = element("ul", "token-list");
      for (const token of visual.tokens) {
        const item = element("li", token.active ? "active" : "muted");
        item.append(element("span", "token-label", token.label),
          element("small", "", token.active ? "计入" : "忽略"));
        list.append(item);
      }
      panel.append(list);
      break;
    }
    case "flow": {
      const list = element("ol", "flow-list");
      for (const step of visual.steps) list.append(element("li", "", step));
      panel.append(list);
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
      }
      break;
    case "pairs":
      for (const row of visual.rows) {
        const line = element("div", row.active ? "pair chosen" : "pair rejected");
        line.append(element("span", "pair-label", row.label), element("span", "", row.value));
        panel.append(line);
      }
      break;
  }

  if (visual.caption) panel.append(element("p", "visual-caption", visual.caption));
  return panel;
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
  if (cardIndex < 0 || finished) selectCard(0);
  play.textContent = "暂停";
  startedAt = performance.now();
  timer = setTimeout(() => {
    timer = undefined;
    const nextIndex = cardIndex + 1;
    if (nextIndex === currentTopic.cards.length) {
      finished = true;
      play.textContent = "重新播放";
      status.textContent = `播放完成，共 ${currentTopic.cards.length} 步`;
      return;
    }
    selectCard(nextIndex);
    startPlayback();
  }, remaining / playbackRate);
}

function navigate(index) {
  if (!currentTopic || index < -1 || index >= currentTopic.cards.length) return;
  stopPlayback();
  selectCard(index);
}

function renderTopic(topic) {
  stopPlayback();
  currentTopic = topic;
  document.title = topic.title + " | 知识动效图谱";
  document.querySelector("#title").textContent = topic.title;
  document.querySelector("#subtitle").textContent = topic.subtitle;
  document.querySelector("#note").textContent = topic.note ?? "";
  steps.replaceChildren();
  cards.replaceChildren();
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
    card.append(headline, element("p", "card-subtitle", entry.subtitle),
      renderVisual(entry.visual), element("p", "description", entry.description));
    if (entry.checks?.length) {
      const details = element("details", "card-checks");
      const list = element("ul");
      for (const check of entry.checks) list.append(element("li", "", check));
      details.append(element("summary", "", "验证方法"), list);
      card.append(details);
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
  renderTopic(topics[0]);
} else {
  document.querySelector("#title").textContent = "暂无主题";
  document.querySelector("#subtitle").textContent = "请在 index.html 中加载至少一个主题脚本。";
  play.disabled = true;
  topicSelect.disabled = true;
}
