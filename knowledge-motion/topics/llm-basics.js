window.knowledgeTopics ??= [];
window.knowledgeTopics.push({
  "id": "llm-basics",
  "title": "大语言模型基础",
  "subtitle": "从文本如何进入模型，讲到下一个 Token 如何生成。",
  "cards": [
    {
      "color": "cyan",
      "title": "分词",
      "subtitle": "文本 / 子词 / Token ID",
      "visual": {
        "type": "flow",
        "label": "处理流程",
        "steps": [
          "文本",
          "子词",
          "Token ID"
        ]
      },
      "description": "比较同一句中文和英文的 Token 数，观察分词长度差异。"
    },
    {
      "color": "purple",
      "title": "词嵌入与位置",
      "subtitle": "Token ID / 向量 / 位置信息",
      "visual": {
        "type": "flow",
        "label": "处理流程",
        "steps": [
          "Token ID",
          "向量",
          "位置信息"
        ]
      },
      "description": "对比同一 Token 出现在不同位置时，模型如何区分顺序。"
    },
    {
      "color": "amber",
      "title": "因果自注意力",
      "subtitle": "计算注意力 / 屏蔽未来 / 聚合上下文",
      "visual": {
        "type": "flow",
        "label": "处理流程",
        "steps": [
          "计算注意力",
          "屏蔽未来",
          "聚合上下文"
        ]
      },
      "description": "固定前缀并修改后续 Token，检查前缀位置的输出是否保持一致。"
    },
    {
      "color": "mint",
      "title": "Transformer 层",
      "subtitle": "注意力混合 / 前馈变换 / 残差叠加",
      "visual": {
        "type": "flow",
        "label": "处理流程",
        "steps": [
          "注意力混合",
          "前馈变换",
          "残差叠加"
        ]
      },
      "description": "分别检查注意力和前馈模块对序列维度的处理。"
    },
    {
      "color": "rose",
      "title": "下一个 Token",
      "subtitle": "最后位置隐藏向量 / 词表分数 / 概率",
      "visual": {
        "type": "flow",
        "label": "处理流程",
        "steps": [
          "最后位置隐藏向量",
          "词表分数",
          "概率"
        ]
      },
      "description": "检查不同上下文如何改变同一位置的候选 Token。"
    },
    {
      "color": "blue",
      "title": "自回归生成",
      "subtitle": "选取 Token / 追加上下文 / 直到停止",
      "visual": {
        "type": "flow",
        "label": "处理流程",
        "steps": [
          "选取 Token",
          "追加上下文",
          "直到停止"
        ]
      },
      "description": "分别设置 EOS 和生成长度上限，观察两个停止条件。"
    }
  ],
  "sources": [
    {
      "label": "Transformer 原论文",
      "url": "https://arxiv.org/abs/1706.03762"
    }
  ]
});
