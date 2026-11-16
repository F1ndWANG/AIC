window.knowledgeTopics ??= [];
window.knowledgeTopics.push({
  "id": "rsi-paired-eval",
  "title": "RSI 的配对评估与可信结论",
  "subtitle": "从具体输入开始，逐步算到输出。",
  "cards": [
    {
      "color": "cyan",
      "title": "定义配对单位",
      "visual": {
        "type": "flow",
        "label": "逐步观察",
        "steps": [
          "同 20 个留出任务，基线和 RSI 版本各跑一次",
          "以任务 ID 对齐成功与失败",
          "生成每个任务的前后结果"
        ]
      },
      "description": "两组共用的任务是配对单位。一个任务多次运行也不是多个独立任务。"
    },
    {
      "color": "purple",
      "title": "四格计数",
      "visual": {
        "type": "flow",
        "label": "逐步观察",
        "steps": [
          "8 个都成功，6 个都失败，5 个新增成功，1 个退化",
          "基线成功 9，RSI 成功 13",
          "净改善 (5-1)/20=20 个百分点"
        ]
      },
      "description": "明确分母与两组失败的重叠，避免只给一个平均分。"
    },
    {
      "color": "amber",
      "title": "解读反向变化",
      "visual": {
        "type": "flow",
        "label": "逐步观察",
        "steps": [
          "整体多成功 4 个任务，但有 1 个旧能力退化",
          "单独回放退化轨迹",
          "检查新记忆是否误用到旧接口"
        ]
      },
      "description": "总体收益与局部退化都需要报告。"
    },
    {
      "color": "mint",
      "title": "同预算消融",
      "visual": {
        "type": "flow",
        "label": "逐步观察",
        "steps": [
          "一组冻结旧记忆，另一组冻结新记忆",
          "固定工具、模型、验证器和时间上限",
          "比较成功率以及调用开销"
        ]
      },
      "description": "如果新组享有更多调用预算，就不能直接把收益归到记忆。"
    },
    {
      "color": "rose",
      "title": "配对重采样",
      "visual": {
        "type": "flow",
        "label": "逐步观察",
        "steps": [
          "每次有放回抽取 20 个任务 ID",
          "同一 ID 的两组结果一起抽",
          "重复估计净改善并报告区间"
        ]
      },
      "description": "按独立单位抽样。若实例按模板聚集，应考虑按模板分组抽样。"
    },
    {
      "color": "blue",
      "title": "停止与留出验收",
      "visual": {
        "type": "flow",
        "label": "逐步观察",
        "steps": [
          "开发集用来选记忆版本和停止轮次",
          "冻结版本后运行正式留出",
          "保存每任务结果、成本与版本号"
        ]
      },
      "description": "若每轮都查正式留出结果并调参，该集合不再是独立验收。"
    }
  ],
  "sources": [
    {
      "label": "延伸阅读",
      "url": "https://github.com/AetherLabsAI/RSIAgent"
    }
  ]
});
