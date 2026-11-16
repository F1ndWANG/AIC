window.knowledgeTopics ??= [];
window.knowledgeTopics.push({
  "id": "verifiable-reward",
  "title": "可验证奖励与奖励漏洞",
  "subtitle": "从具体输入开始，逐步算到输出。",
  "cards": [
    {
      "color": "cyan",
      "title": "构造可判定任务",
      "visual": {
        "type": "flow",
        "label": "逐步观察",
        "steps": [
          "题目要求整数 42",
          "解析最终答案字段",
          "字段能解析且等于 42 才给 1 分"
        ]
      },
      "description": "先定义输出协议，再定义答案是否正确。"
    },
    {
      "color": "purple",
      "title": "分离格式和正确性",
      "visual": {
        "type": "flow",
        "label": "逐步观察",
        "steps": [
          "A：格式正确但答案错，B：答案对但格式错",
          "分别记录格式和正确性",
          "给两类错误不同诊断"
        ]
      },
      "description": "只看加权总分容易把模型的实际变化掩盖掉。"
    },
    {
      "color": "amber",
      "title": "测试覆盖漏洞",
      "visual": {
        "type": "flow",
        "label": "逐步观察",
        "steps": [
          "代码样例只测试正数",
          "常量解通过已知样例",
          "加入未公开的零值、负数和边界"
        ]
      },
      "description": "把训练可见测试与独立验收测试分开，检查是否发生过拟合。"
    },
    {
      "color": "mint",
      "title": "同组奖励无差异",
      "visual": {
        "type": "flow",
        "label": "逐步观察",
        "steps": [
          "四个回答奖励都是 0",
          "组内减均值仍全为 0",
          "检查任务难度与验证器误拒绝"
        ]
      },
      "description": "组内相对信号便于比较候选，但没有差异就无法区分优劣。"
    },
    {
      "color": "rose",
      "title": "多次采样的预算",
      "visual": {
        "type": "flow",
        "label": "逐步观察",
        "steps": [
          "10 道题，每题采样 8 次",
          "总计 80 次生成",
          "分别报告单次正确率和 8 次中至少一次成功率"
        ]
      },
      "description": "区分一次请求就能完成的能力与允许增加采样预算的能力。"
    },
    {
      "color": "blue",
      "title": "奖励回归",
      "visual": {
        "type": "flow",
        "label": "逐步观察",
        "steps": [
          "训练通过率 70%→90%，独立测试 65%→63%",
          "检查按题型分解的错误",
          "优先排查泄漏或奖励投机"
        ]
      },
      "description": "这里的百分比是教学示例。要用训练外任务检验收益。"
    }
  ],
  "sources": [
    {
      "label": "延伸阅读",
      "url": "https://arxiv.org/abs/2501.12948"
    }
  ]
});
