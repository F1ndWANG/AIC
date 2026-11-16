window.knowledgeTopics ??= [];
window.knowledgeTopics.push({
  "id": "rsi-evaluation",
  "title": "RSI 实验设计与失效分析",
  "subtitle": "六个机制与对应的验证示例",
  "cards": [
    {
      "color": "cyan",
      "title": "冻结基线与任务",
      "subtitle": "",
      "visual": {
        "type": "flow",
        "label": "处理流程",
        "steps": [
          "选定基座和工具",
          "固定预算",
          "封存留出任务"
        ]
      },
      "description": "让无记忆、固定记忆和递归更新组使用相同计算预算。"
    },
    {
      "color": "purple",
      "title": "广度探索消融",
      "subtitle": "",
      "visual": {
        "type": "flow",
        "label": "处理流程",
        "steps": [
          "改变探索覆盖",
          "记录成功与失败",
          "比较迁移结果"
        ]
      },
      "description": "检查广度探索的收益是否来自覆盖新操作。"
    },
    {
      "color": "amber",
      "title": "深度探索消融",
      "subtitle": "",
      "visual": {
        "type": "flow",
        "label": "处理流程",
        "steps": [
          "从目标失败定位缺口",
          "定向练习",
          "检查迁移"
        ]
      },
      "description": "与相同练习次数的随机练习对照。"
    },
    {
      "color": "mint",
      "title": "Verifier 错误诊断",
      "subtitle": "",
      "visual": {
        "type": "flow",
        "label": "处理流程",
        "steps": [
          "采样验证分歧",
          "人工核验环境",
          "统计误接收与误拒绝"
        ]
      },
      "description": "检查误接收是否把错误流程写入长期记忆。"
    },
    {
      "color": "rose",
      "title": "记忆泄漏与回滚",
      "subtitle": "",
      "visual": {
        "type": "flow",
        "label": "处理流程",
        "steps": [
          "审计记忆来源",
          "隔离测试信息",
          "版本回滚"
        ]
      },
      "description": "模拟一条错误经验污染后，测试能否定位并撤销。"
    },
    {
      "color": "blue",
      "title": "评估稳定性",
      "subtitle": "",
      "visual": {
        "type": "flow",
        "label": "处理流程",
        "steps": [
          "冻结记忆",
          "多环境独立运行",
          "报告质量和成本"
        ]
      },
      "description": "同时报告成功率区间、最差域表现与每成功任务成本。"
    }
  ],
  "sources": [
    {
      "label": "RSIAgent",
      "url": "https://github.com/AetherLabsAI/RSIAgent"
    }
  ]
});
