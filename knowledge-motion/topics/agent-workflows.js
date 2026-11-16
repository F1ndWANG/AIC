window.knowledgeTopics ??= [];
window.knowledgeTopics.push({
  "id": "agent-workflows",
  "title": "Agent 工作流、恢复与并发",
  "subtitle": "从具体输入开始，逐步算到输出。",
  "cards": [
    {
      "color": "cyan",
      "title": "显式运行状态",
      "visual": {
        "type": "flow",
        "label": "逐步观察",
        "steps": [
          "订单导出任务刚创建",
          "按等待查询、等待导出、等待验收推进",
          "验收完成后标记成功"
        ]
      },
      "description": "为每个状态明确允许的动作和下一状态。"
    },
    {
      "color": "purple",
      "title": "检查点恢复",
      "visual": {
        "type": "flow",
        "label": "逐步观察",
        "steps": [
          "查询已返回 128 条记录，导出前进程中断",
          "重启后读取持久化检查点",
          "从导出继续，复核输入版本"
        ]
      },
      "description": "检查点应包括步骤状态、外部引用和必要的业务键。"
    },
    {
      "color": "amber",
      "title": "重试与补偿",
      "visual": {
        "type": "flow",
        "label": "逐步观察",
        "steps": [
          "导出成功但后续通知失败",
          "区分可重试故障和需要补偿的业务失败",
          "保留已验收文件，只重试通知"
        ]
      },
      "description": "补偿是另外的业务动作，需要单独定义其适用条件与幂等行为。"
    },
    {
      "color": "mint",
      "title": "并行任务和汇合",
      "visual": {
        "type": "flow",
        "label": "逐步观察",
        "steps": [
          "订单数据和汇率可并行读取",
          "收齐两项结果后才计算金额",
          "任一上游失败时按策略取消或等待"
        ]
      },
      "description": "汇合前检查两个结果的时间口径和版本。"
    },
    {
      "color": "rose",
      "title": "重复事件与幂等",
      "visual": {
        "type": "flow",
        "label": "逐步观察",
        "steps": [
          "网络重试让同一完成事件到达两次",
          "按事件 ID 去重并检查当前状态",
          "只推进一次工作流"
        ]
      },
      "description": "事件去重和外部写操作幂等属于不同层，两者都要验证。"
    },
    {
      "color": "blue",
      "title": "人工接管与恢复",
      "visual": {
        "type": "flow",
        "label": "逐步观察",
        "steps": [
          "高风险写入需要审批",
          "暂停保存请求、上下文和审批对象",
          "收到匹配审批后按检查点继续"
        ]
      },
      "description": "不要只存审批布尔值。应绑定动作、参数版本和有效期。"
    }
  ],
  "sources": [
    {
      "label": "延伸阅读",
      "url": "https://docs.temporal.io/"
    }
  ]
});
