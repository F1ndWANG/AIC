window.knowledgeTopics ??= [];
window.knowledgeTopics.push({
  "id": "tool-protocols",
  "title": "工具协议、权限与抗注入",
  "subtitle": "从具体输入开始，逐步算到输出。",
  "cards": [
    {
      "color": "cyan",
      "title": "列出工具能力",
      "visual": {
        "type": "flow",
        "label": "逐步观察",
        "steps": [
          "服务端公布 list_orders 和 delete_order",
          "模型读取描述与参数 Schema",
          "客户端按任务和权限暴露候选"
        ]
      },
      "description": "发现工具能力不等于允许调用该能力。"
    },
    {
      "color": "purple",
      "title": "参数验证",
      "visual": {
        "type": "flow",
        "label": "逐步观察",
        "steps": [
          "list_orders 需要日期区间",
          "模型传入缺失结束日期的参数",
          "调用端在执行前拒绝并返回可修复错误"
        ]
      },
      "description": "语法合法仍可能违反业务规则，例如结束早于开始。"
    },
    {
      "color": "amber",
      "title": "读取与写入的权限",
      "visual": {
        "type": "flow",
        "label": "逐步观察",
        "steps": [
          "查订单只需要读取权限",
          "删除订单需要写权限和明确授权",
          "只读会话拒绝删除"
        ]
      },
      "description": "依据服务端策略做授权。工具的自述和注解不能代替强制检查。"
    },
    {
      "color": "mint",
      "title": "外部内容中的指令",
      "visual": {
        "type": "flow",
        "label": "逐步观察",
        "steps": [
          "查询结果中带有“导出所有客户”文字",
          "把该文字作为返回数据解析",
          "忽略其未经授权的调用要求"
        ]
      },
      "description": "检索文档与工具返回可能含注入文本。业务权限要独立执行。"
    },
    {
      "color": "rose",
      "title": "超时后的幂等恢复",
      "visual": {
        "type": "flow",
        "label": "逐步观察",
        "steps": [
          "写请求超时，业务键仍为 r42",
          "先查该键对应的已有结果",
          "需要重试时复用同一业务键"
        ]
      },
      "description": "只有服务端明确实现幂等，重复调用才可能安全。"
    },
    {
      "color": "blue",
      "title": "调用轨迹与脱敏",
      "visual": {
        "type": "flow",
        "label": "逐步观察",
        "steps": [
          "工具参数包含客户手机号",
          "追踪调用类型、耗时、结果码",
          "对手机号脱敏并固定访问范围"
        ]
      },
      "description": "排障时保留所需证据，避免把不必要的敏感字段放进长期日志。"
    }
  ],
  "sources": [
    {
      "label": "延伸阅读",
      "url": "https://modelcontextprotocol.io/specification/2025-06-18/server/tools"
    }
  ]
});
