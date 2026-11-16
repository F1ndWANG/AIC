window.knowledgeTopics ??= [];
window.knowledgeTopics.push({
  "id": "agent-verification",
  "title": "Agent 验证、评估与安全",
  "subtitle": "六个机制与对应的验证示例",
  "cards": [
    {
      "color": "cyan",
      "title": "过程轨迹",
      "subtitle": "",
      "visual": {
        "type": "flow",
        "label": "处理流程",
        "steps": [
          "记录模型和工具步骤",
          "关联状态",
          "定位失败"
        ]
      },
      "description": "区分模型选错工具、参数错误与工具服务故障。"
    },
    {
      "color": "purple",
      "title": "环境验收",
      "subtitle": "",
      "visual": {
        "type": "flow",
        "label": "处理流程",
        "steps": [
          "读取任务要求",
          "探测真实状态",
          "判定完成"
        ]
      },
      "description": "加入答复称已完成但实际产物不存在的样例。"
    },
    {
      "color": "amber",
      "title": "Verifier 独立性",
      "subtitle": "",
      "visual": {
        "type": "flow",
        "label": "处理流程",
        "steps": [
          "隔离执行者的自评",
          "检查产物",
          "返回可查反馈"
        ]
      },
      "description": "检查验证器是否只凭自然语言成功声明给分。"
    },
    {
      "color": "mint",
      "title": "沙箱和人工介入",
      "subtitle": "",
      "visual": {
        "type": "flow",
        "label": "处理流程",
        "steps": [
          "隔离工具环境",
          "根据动作风险限权",
          "必要时交接"
        ]
      },
      "description": "注入越权和伪造指令，核对权限拦截与接管。"
    },
    {
      "color": "rose",
      "title": "任务基准与预算",
      "subtitle": "",
      "visual": {
        "type": "flow",
        "label": "处理流程",
        "steps": [
          "冻结测试环境",
          "统一工具和预算",
          "重复运行"
        ]
      },
      "description": "报告任务成功率、方差、失败类型和单位成功成本。"
    },
    {
      "color": "blue",
      "title": "回归与停止条件",
      "subtitle": "",
      "visual": {
        "type": "flow",
        "label": "处理流程",
        "steps": [
          "设最大轮数和超时",
          "检查收敛",
          "回归基线"
        ]
      },
      "description": "加入循环重试任务，确认系统能停止并保留现场。"
    }
  ],
  "sources": [
    {
      "label": "SWE-bench",
      "url": "https://arxiv.org/abs/2310.06770"
    }
  ]
});
