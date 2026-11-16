window.knowledgeTopics ??= [];
window.knowledgeTopics.push({
  "id": "agent-eval-design",
  "title": "Agent 评估、统计与故障定位",
  "subtitle": "从具体输入开始，逐步算到输出。",
  "cards": [
    {
      "color": "cyan",
      "title": "明确任务成功条件",
      "visual": {
        "type": "flow",
        "label": "逐步观察",
        "steps": [
          "任务要求导出 128 条唯一订单",
          "检查文件、行数及唯一订单 ID",
          "文件存在但只有 80 个唯一 ID 判失败"
        ]
      },
      "description": "把验收条件落实到环境状态，不仅看回复文本。"
    },
    {
      "color": "purple",
      "title": "逐步故障归因",
      "visual": {
        "type": "flow",
        "label": "逐步观察",
        "steps": [
          "任务最终失败",
          "核对计划、工具、参数、观察和验收",
          "标记首次出现可追踪错误的位置"
        ]
      },
      "description": "把同一错误的连锁反应与独立的新错误分开。"
    },
    {
      "color": "amber",
      "title": "配对比较",
      "visual": {
        "type": "flow",
        "label": "逐步观察",
        "steps": [
          "同 40 个任务跑基线和新系统",
          "6 个任务由失败变成功，2 个相反",
          "净增加 4 个，提升 10 个百分点"
        ]
      },
      "description": "配对结果比两个孤立均值更能解释是哪类任务发生变化。"
    },
    {
      "color": "mint",
      "title": "随机性与重复运行",
      "visual": {
        "type": "flow",
        "label": "逐步观察",
        "steps": [
          "同一任务用 5 个预设种子",
          "得到 3 成功、2 失败",
          "报告 60% 及运行次数"
        ]
      },
      "description": "不要用最好的一次代表稳定性。相同任务的多次运行不等于多个独立任务。"
    },
    {
      "color": "rose",
      "title": "按预算比较",
      "visual": {
        "type": "flow",
        "label": "逐步观察",
        "steps": [
          "基线平均 5 次工具调用，方案 B 平均 12 次",
          "固定最多 8 次重新评估",
          "分别记录成功率、时间和超预算比例"
        ]
      },
      "description": "先定义预算约束，再解释性能上涨是否来自额外搜索。"
    },
    {
      "color": "blue",
      "title": "回归与人工校准",
      "visual": {
        "type": "flow",
        "label": "逐步观察",
        "steps": [
          "自动评审误判“文件存在”为完整完成",
          "抽查关键分歧任务",
          "修订规则并回放旧样本"
        ]
      },
      "description": "保留人工判定协议、分歧样本与变更记录。"
    }
  ],
  "sources": [
    {
      "label": "延伸阅读",
      "url": "https://arxiv.org/abs/2310.06770"
    }
  ]
});
