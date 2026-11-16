window.knowledgeTopics ??= [];
window.knowledgeTopics.push({
  "id": "agent-security",
  "title": "Agent 威胁建模与安全验收",
  "subtitle": "从具体输入开始，逐步算到输出。",
  "cards": [
    {
      "color": "cyan",
      "title": "信任边界",
      "visual": {
        "type": "flow",
        "label": "逐步观察",
        "steps": [
          "用户授权读取账单，网页给出删除账单指令",
          "标记网页内容为外部输入",
          "写操作仍由独立权限检查拒绝"
        ]
      },
      "description": "内容的语气和格式不会改变发出者的权限。"
    },
    {
      "color": "purple",
      "title": "间接注入测试",
      "visual": {
        "type": "flow",
        "label": "逐步观察",
        "steps": [
          "在工具返回中放入伪造系统消息",
          "记录模型是否提出越权动作",
          "确认拦截器拒绝后仍能完成原任务"
        ]
      },
      "description": "同时评估攻击成功率和正常任务成功率。"
    },
    {
      "color": "amber",
      "title": "最小权限工具集",
      "visual": {
        "type": "flow",
        "label": "逐步观察",
        "steps": [
          "Agent 当前只做文件汇总",
          "仅暴露指定目录读权限",
          "请求跨目录路径时拒绝并记录"
        ]
      },
      "description": "应在工具执行端强制约束，不能依赖模型遵守文字提示。"
    },
    {
      "color": "mint",
      "title": "敏感字段外流",
      "visual": {
        "type": "flow",
        "label": "逐步观察",
        "steps": [
          "调试日志含客户编号与邮箱",
          "记录动作类别和错误码，遮蔽必要字段",
          "按访问范围核查各日志目的地"
        ]
      },
      "description": "对工具调用、错误追踪和持久化记忆一起审计。"
    },
    {
      "color": "rose",
      "title": "高风险动作绑定",
      "visual": {
        "type": "flow",
        "label": "逐步观察",
        "steps": [
          "用户确认发送报价给甲公司",
          "将审批绑定收件方和内容版本",
          "对象改为乙公司时要求重新确认"
        ]
      },
      "description": "仅保存一个“已批准”标志无法约束实际动作。"
    },
    {
      "color": "blue",
      "title": "联动演练",
      "visual": {
        "type": "flow",
        "label": "逐步观察",
        "steps": [
          "模拟网页注入、写权限越界、数据外流",
          "回放完整工具轨迹",
          "核对业务成功与环境中未发生越权写入"
        ]
      },
      "description": "测试报告区分模型提出越权动作和工具实际执行越权动作。"
    }
  ],
  "sources": [
    {
      "label": "延伸阅读",
      "url": "https://arxiv.org/abs/2406.13352"
    }
  ]
});
