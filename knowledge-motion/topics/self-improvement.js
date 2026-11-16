window.knowledgeTopics ??= [];
window.knowledgeTopics.push({
  "id": "self-improvement",
  "title": "从反思到自我改进",
  "subtitle": "六个机制与对应的验证示例",
  "cards": [
    {
      "color": "cyan",
      "title": "单次纠错",
      "subtitle": "",
      "visual": {
        "type": "flow",
        "label": "处理流程",
        "steps": [
          "尝试任务",
          "获得反馈",
          "修改当前输出"
        ]
      },
      "description": "检查修改是否纠正错误以及是否引入新错误。"
    },
    {
      "color": "purple",
      "title": "跨任务反思",
      "subtitle": "",
      "visual": {
        "type": "flow",
        "label": "处理流程",
        "steps": [
          "记录失败",
          "提炼可复用经验",
          "在其他任务检索"
        ]
      },
      "description": "区分当次修正与后续任务上的迁移收益。"
    },
    {
      "color": "amber",
      "title": "自生成任务",
      "subtitle": "",
      "visual": {
        "type": "flow",
        "label": "处理流程",
        "steps": [
          "读取能力缺口",
          "产生练习",
          "判定难度和覆盖"
        ]
      },
      "description": "检查生成练习是否重复或集中在容易的题型。"
    },
    {
      "color": "mint",
      "title": "自生成数据与训练",
      "subtitle": "",
      "visual": {
        "type": "flow",
        "label": "处理流程",
        "steps": [
          "生成候选样本",
          "独立过滤",
          "选择性训练"
        ]
      },
      "description": "对比有无过滤的结果，防止错误答案被反复强化。"
    },
    {
      "color": "rose",
      "title": "改进状态",
      "subtitle": "",
      "visual": {
        "type": "flow",
        "label": "处理流程",
        "steps": [
          "明确更新对象",
          "保存版本",
          "下一轮复用"
        ]
      },
      "description": "对比更新记忆、工具流程与更新模型权重各自的成本。"
    },
    {
      "color": "blue",
      "title": "闭环判定",
      "subtitle": "",
      "visual": {
        "type": "flow",
        "label": "处理流程",
        "steps": [
          "前一轮产物进入下一轮",
          "跑多轮",
          "检查留出集收益"
        ]
      },
      "description": "保持预算与评估隔离，检查买来的是额外计算还是可迁移经验。"
    }
  ],
  "sources": [
    {
      "label": "Reflexion",
      "url": "https://arxiv.org/abs/2303.11366"
    },
    {
      "label": "STOP",
      "url": "https://arxiv.org/abs/2310.02304"
    }
  ]
});
