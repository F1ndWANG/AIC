window.knowledgeTopics ??= [];
window.knowledgeTopics.push({
  "id": "evidence-reliability",
  "title": "长上下文中的证据可靠性",
  "subtitle": "从具体输入开始，逐步算到输出。",
  "cards": [
    {
      "color": "cyan",
      "title": "证据位置对照",
      "visual": {
        "type": "flow",
        "label": "逐步观察",
        "steps": [
          "固定问题与总 Token 数",
          "同一条证据分别放开头、中间、结尾",
          "按证据位置比较正确率"
        ]
      },
      "description": "只改变位置更容易区分位置影响与上下文内容差异。"
    },
    {
      "color": "purple",
      "title": "截断前后审计",
      "visual": {
        "type": "flow",
        "label": "逐步观察",
        "steps": [
          "输入含关键订单号与系统约束",
          "运行实际分词、模板和裁剪",
          "比较模型最终收到的序列"
        ]
      },
      "description": "应用发出的原文不一定等于模型最终接收的序列。"
    },
    {
      "color": "amber",
      "title": "干扰项测试",
      "visual": {
        "type": "flow",
        "label": "逐步观察",
        "steps": [
          "正确条款与措辞相近的无关条款同时出现",
          "添加同义但不适用的干扰项",
          "检查回答是否选中适用条款"
        ]
      },
      "description": "对比有无干扰项可以测试模型是否过度依赖表面相似度。"
    },
    {
      "color": "mint",
      "title": "多段证据合并",
      "visual": {
        "type": "flow",
        "label": "逐步观察",
        "steps": [
          "A 段给出退款期限，B 段给出例外条件",
          "检索后保留两段并分别引用",
          "根据例外条件修正最终结论"
        ]
      },
      "description": "只找对其中一段仍可能答错，需要测整组证据覆盖。"
    },
    {
      "color": "rose",
      "title": "移除证据实验",
      "visual": {
        "type": "flow",
        "label": "逐步观察",
        "steps": [
          "原输入足以回答退款期限",
          "删除唯一有效条款并重试",
          "检查是否明确表示证据不足"
        ]
      },
      "description": "如果仍给出同一答案，排查其他证据、模型先验或缓存。"
    },
    {
      "color": "blue",
      "title": "证据分层报告",
      "visual": {
        "type": "flow",
        "label": "逐步观察",
        "steps": [
          "同一问题集包括单段、多段和无答案",
          "按类别记录召回和最终答复",
          "定位退化来自找不到证据或没有使用证据"
        ]
      },
      "description": "只汇报平均准确率可能掩盖无答案场景中的编造。"
    }
  ],
  "sources": [
    {
      "label": "延伸阅读",
      "url": "https://arxiv.org/abs/2307.03172"
    }
  ]
});
