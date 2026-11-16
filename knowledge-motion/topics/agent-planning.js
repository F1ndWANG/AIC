window.knowledgeTopics ??= [];
window.knowledgeTopics.push({
  "id": "agent-planning",
  "title": "Agent 规划、工具与执行",
  "subtitle": "六个机制与对应的验证示例",
  "cards": [
    {
      "color": "cyan",
      "title": "任务与环境状态",
      "subtitle": "",
      "visual": {
        "type": "flow",
        "label": "处理流程",
        "steps": [
          "解析目标",
          "读取状态",
          "选择下一步"
        ]
      },
      "description": "用同一指令配不同起始状态，检查动作是否改变。"
    },
    {
      "color": "purple",
      "title": "计划与重规划",
      "subtitle": "",
      "visual": {
        "type": "flow",
        "label": "处理流程",
        "steps": [
          "拆出子目标",
          "执行一步",
          "根据反馈改计划"
        ]
      },
      "description": "模拟前置条件失败，查看是否重规划而非盲目继续。"
    },
    {
      "color": "amber",
      "title": "ReAct 循环",
      "subtitle": "",
      "visual": {
        "type": "flow",
        "label": "处理流程",
        "steps": [
          "决定动作",
          "调用工具",
          "读取观察"
        ]
      },
      "description": "在工具返回和预期不同时，检查下一动作是否调整。"
    },
    {
      "color": "mint",
      "title": "工具 Schema",
      "subtitle": "",
      "visual": {
        "type": "flow",
        "label": "处理流程",
        "steps": [
          "声明参数",
          "校验输入",
          "传回结构化结果"
        ]
      },
      "description": "构造无效日期、缺字段和未知工具名。"
    },
    {
      "color": "rose",
      "title": "权限、幂等与恢复",
      "subtitle": "",
      "visual": {
        "type": "flow",
        "label": "处理流程",
        "steps": [
          "检查授权",
          "执行动作",
          "根据错误恢复"
        ]
      },
      "description": "模拟写操作超时，验证重试不会重复写入。"
    },
    {
      "color": "blue",
      "title": "多 Agent 分工",
      "subtitle": "",
      "visual": {
        "type": "flow",
        "label": "处理流程",
        "steps": [
          "定义角色与共享状态",
          "交接",
          "验收"
        ]
      },
      "description": "检查任务移交是否带上目标、证据与未解决事项。"
    }
  ],
  "sources": [
    {
      "label": "ReAct",
      "url": "https://arxiv.org/abs/2210.03629"
    }
  ]
});
