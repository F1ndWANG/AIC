window.knowledgeTopics ??= [];
window.knowledgeTopics.push({
  "id": "rsi-transfer",
  "title": "RSI 的迁移、遗忘与长期收益",
  "subtitle": "从具体输入开始，逐步算到输出。",
  "cards": [
    {
      "color": "cyan",
      "title": "独立任务划分",
      "visual": {
        "type": "flow",
        "label": "逐步观察",
        "steps": [
          "探索任务见过两页和三页报表",
          "留出五页、无分页与另一个工具接口",
          "在冻结记忆后独立评估"
        ]
      },
      "description": "把近重复实例按任务模板归组，减少探索集与留出集泄漏。"
    },
    {
      "color": "purple",
      "title": "近迁移与远迁移",
      "visual": {
        "type": "flow",
        "label": "逐步观察",
        "steps": [
          "旧系统返回 next_cursor，新系统返回 continuation",
          "分别测试同接口与新接口",
          "按环境分别报告收益"
        ]
      },
      "description": "保留动作原则可以迁移，照搬字段名可能失败。"
    },
    {
      "color": "amber",
      "title": "遗忘与负迁移",
      "visual": {
        "type": "flow",
        "label": "逐步观察",
        "steps": [
          "分页经验使新任务提升",
          "固定重跑旧版单页任务和旧接口",
          "检查是否新增了不必要调用或失败"
        ]
      },
      "description": "改进评估应同时覆盖目标能力和受影响的旧能力。"
    },
    {
      "color": "mint",
      "title": "经验消融",
      "visual": {
        "type": "flow",
        "label": "逐步观察",
        "steps": [
          "完整记忆包括规则、反例和来源",
          "依次删除一类内容并重测",
          "比较任务成功率与调用成本"
        ]
      },
      "description": "消融时固定模型、验证器、任务和预算。"
    },
    {
      "color": "rose",
      "title": "持续成本回收",
      "visual": {
        "type": "flow",
        "label": "逐步观察",
        "steps": [
          "探索投入 120 次调用，每次任务平均节省 3 次",
          "用 120÷3 计算回收点",
          "在教学假设下第 40 个任务达到等成本"
        ]
      },
      "description": "探索与上线推理的单位成本和任务分布需要可比。"
    },
    {
      "color": "blue",
      "title": "结果可信度",
      "visual": {
        "type": "flow",
        "label": "逐步观察",
        "steps": [
          "同一批任务有新增成功也有回归",
          "记录逐任务变化并按环境汇总",
          "报告成功率、成本及不确定性"
        ]
      },
      "description": "正式留出集只用于冻结后的验收，开发迭代需要独立反馈。"
    }
  ],
  "sources": [
    {
      "label": "延伸阅读",
      "url": "https://github.com/AetherLabsAI/RSIAgent"
    }
  ]
});
