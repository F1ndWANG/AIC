window.knowledgeTopics ??= [];
window.knowledgeTopics.push({
  "id": "agent-memory",
  "title": "Agent 记忆与上下文工程",
  "subtitle": "六个机制与对应的验证示例",
  "cards": [
    {
      "color": "cyan",
      "title": "工作上下文",
      "subtitle": "",
      "visual": {
        "type": "flow",
        "label": "处理流程",
        "steps": [
          "保留当前目标",
          "加载必要状态",
          "管理窗口"
        ]
      },
      "description": "测量长任务中关键信息被截断的比例。"
    },
    {
      "color": "purple",
      "title": "事件与经验",
      "subtitle": "",
      "visual": {
        "type": "flow",
        "label": "处理流程",
        "steps": [
          "记录动作和结果",
          "提炼经验",
          "保留来源"
        ]
      },
      "description": "核对失败经验是否包含触发条件和可复现步骤。"
    },
    {
      "color": "amber",
      "title": "长期记忆检索",
      "subtitle": "",
      "visual": {
        "type": "flow",
        "label": "处理流程",
        "steps": [
          "任务查询",
          "召回相关经验",
          "插入上下文"
        ]
      },
      "description": "用相似但不适用的历史案例测试误召回。"
    },
    {
      "color": "mint",
      "title": "过程性记忆",
      "subtitle": "",
      "visual": {
        "type": "flow",
        "label": "处理流程",
        "steps": [
          "验证一项流程",
          "沉淀操作步骤",
          "在新任务复用"
        ]
      },
      "description": "检查环境变化后旧流程仍适用的条件。"
    },
    {
      "color": "rose",
      "title": "记忆更新与淘汰",
      "subtitle": "",
      "visual": {
        "type": "flow",
        "label": "处理流程",
        "steps": [
          "查找冲突",
          "验证新证据",
          "合并、标记或淘汰"
        ]
      },
      "description": "为过期经验保留版本和原因，避免覆盖仍有效的条件。"
    },
    {
      "color": "blue",
      "title": "记忆消融",
      "subtitle": "",
      "visual": {
        "type": "flow",
        "label": "处理流程",
        "steps": [
          "冻结任务",
          "比较有无记忆",
          "检验跨任务迁移"
        ]
      },
      "description": "固定工具和 Token 预算，衡量复用收益与误导成本。"
    }
  ],
  "sources": [
    {
      "label": "Generative Agents",
      "url": "https://arxiv.org/abs/2304.03442"
    }
  ]
});
