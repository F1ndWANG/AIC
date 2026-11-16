window.knowledgeTopics ??= [];
window.knowledgeTopics.push({
  "id": "reasoning-evaluation",
  "title": "推理方法与模型评估",
  "subtitle": "六个机制与对应的验证示例",
  "cards": [
    {
      "color": "cyan",
      "title": "采样与自一致性",
      "subtitle": "",
      "visual": {
        "type": "flow",
        "label": "处理流程",
        "steps": [
          "同题采样多次",
          "提取候选答案",
          "投票"
        ]
      },
      "description": "固定总预算，对比单次输出与多次采样。"
    },
    {
      "color": "purple",
      "title": "搜索与结果验证",
      "subtitle": "",
      "visual": {
        "type": "flow",
        "label": "处理流程",
        "steps": [
          "提出候选",
          "扩展或剪枝",
          "核验候选"
        ]
      },
      "description": "用可执行测试或已知答案判断增加搜索预算的价值。"
    },
    {
      "color": "amber",
      "title": "结果与过程监督",
      "subtitle": "",
      "visual": {
        "type": "flow",
        "label": "处理流程",
        "steps": [
          "标注最终答案或中间步骤",
          "构造反馈",
          "验证泛化"
        ]
      },
      "description": "加入推理过程有错但结果碰巧正确的样例。"
    },
    {
      "color": "mint",
      "title": "评估集与泄漏",
      "subtitle": "",
      "visual": {
        "type": "flow",
        "label": "处理流程",
        "steps": [
          "固定任务切分",
          "隔离开发与测试",
          "检查重叠"
        ]
      },
      "description": "按难度、域和能力分别报告表现。"
    },
    {
      "color": "rose",
      "title": "自动评审与人工校准",
      "subtitle": "",
      "visual": {
        "type": "flow",
        "label": "处理流程",
        "steps": [
          "定义评分规则",
          "运行自动评审",
          "抽样复核"
        ]
      },
      "description": "交换回答展示顺序，测量评审的顺序偏差。"
    },
    {
      "color": "blue",
      "title": "线上回归与成本",
      "subtitle": "",
      "visual": {
        "type": "flow",
        "label": "处理流程",
        "steps": [
          "固定基线",
          "对比质量与延迟",
          "设上线门槛"
        ]
      },
      "description": "记录成功率、首 Token 延迟和单位成功任务成本。"
    }
  ],
  "sources": [
    {
      "label": "Self-Consistency",
      "url": "https://arxiv.org/abs/2203.11171"
    }
  ]
});
