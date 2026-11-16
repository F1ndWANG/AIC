window.knowledgeTopics ??= [];
window.knowledgeTopics.push({
  "id": "decoding-controls",
  "title": "解码策略与结构化输出",
  "subtitle": "从具体输入开始，逐步算到输出。",
  "cards": [
    {
      "color": "cyan",
      "title": "贪心解码",
      "visual": {
        "type": "flow",
        "label": "逐步观察",
        "steps": [
          "苹果 0.55、香蕉 0.30、梨 0.15",
          "选择概率最高的苹果",
          "把苹果接到前缀再评分"
        ]
      },
      "description": "每步取当前最大值，不能保证得到整段概率最高的序列。"
    },
    {
      "color": "purple",
      "title": "温度缩放",
      "visual": {
        "type": "flow",
        "label": "逐步观察",
        "steps": [
          "两个 logits 为 2 和 0",
          "温度 1：概率约 0.88 和 0.12",
          "温度 2：概率约 0.73 和 0.27"
        ]
      },
      "description": "用 softmax(logits/T) 计算。升高温度会让本例的分布更平缓。"
    },
    {
      "color": "amber",
      "title": "Top-k",
      "visual": {
        "type": "flow",
        "label": "逐步观察",
        "steps": [
          "候选概率 0.50、0.30、0.15、0.05",
          "k=2：只保留前两项",
          "重归一化为 0.625 和 0.375"
        ]
      },
      "description": "Top-k 固定候选数量。排在第 k 之后的项概率归零。"
    },
    {
      "color": "mint",
      "title": "Top-p",
      "visual": {
        "type": "flow",
        "label": "逐步观察",
        "steps": [
          "候选概率 0.50、0.30、0.15、0.05",
          "p=0.70：累计 0.50 不够，0.80 达标",
          "只在前两项重归一化后采样"
        ]
      },
      "description": "选累计概率达到阈值的最短前缀，分布不同会保留不同数量的 Token。"
    },
    {
      "color": "rose",
      "title": "重复惩罚与停止",
      "visual": {
        "type": "flow",
        "label": "逐步观察",
        "steps": [
          "前缀连续出现同一词",
          "调整已出现 Token 的分数",
          "达到 EOS 或长度上限即停止"
        ]
      },
      "description": "重复惩罚改的是下一步分布，停止条件决定何时终止；分别测试避免把两种问题混在一起。"
    },
    {
      "color": "blue",
      "title": "约束生成",
      "visual": {
        "type": "flow",
        "label": "逐步观察",
        "steps": [
          "期望 JSON 对象",
          "用当前语法状态过滤非法后继",
          "生成后继续校验字段值"
        ]
      },
      "description": "语法约束可以保证指定的结构，但字符串内容是否正确仍需验证。"
    }
  ],
  "sources": [
    {
      "label": "延伸阅读",
      "url": "https://arxiv.org/abs/1904.09751"
    }
  ]
});
