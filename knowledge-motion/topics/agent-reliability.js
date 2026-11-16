window.knowledgeTopics ??= [];
window.knowledgeTopics.push({
  id: "agent-reliability",
  title: "AI Agent 工具调用与可靠性",
  subtitle: "以数据分析 Agent 为例，从任务路由、工具执行到发布回归。",
  cards: [
    {
      color: "cyan", title: "先确认任务边界", subtitle: "Task Routing",
      visual: { type: "branches", label: "用户问题 → 判定下一步", rows: [
        { condition: "口径和时间明确", action: "进入查询" },
        { condition: "关键口径缺失", action: "补问后再执行" },
        { condition: "请求超出能力", action: "解释可支持范围" }
      ] },
      description: "把需要澄清的条件写进路由规则，避免在信息不足时直接生成 SQL。",
      checks: ["用同一问题的完整版和省略时间版测试，比较是否进入预期分支。"]
    },
    {
      color: "purple", title: "结构化工具入参", subtitle: "Tool Arguments",
      visual: { type: "flow", label: "查询准备", steps: ["工具参数", "结构校验", "业务规则校验", "调用工具"] },
      description: "分别验证字段类型、日期范围和数据权限，向 Agent 返回可定位的错误信息。",
      checks: ["构造参数缺失、开始日期晚于结束日期、无权访问数据源三个样例。"]
    },
    {
      color: "amber", title: "区分错误与重试策略", subtitle: "Failure Recovery",
      visual: { type: "branches", label: "工具失败 → 按原因处理", rows: [
        { condition: "临时超时", action: "在请求预算内有限重试" },
        { condition: "入参校验失败", action: "修正参数或补问" },
        { condition: "权限不足", action: "停止执行并说明原因" }
      ] },
      description: "只读查询适合有限重试。对有副作用的写入，需要由服务端提供幂等保障。",
      checks: ["注入超时和权限错误，检查重试次数及最终返回内容。"]
    },
    {
      color: "mint", title: "保留结果来源", subtitle: "Evidence Grounding",
      visual: { type: "flow", label: "查询结果 → 用户可核验的报告", steps: ["只读查询", "记录筛选条件", "绑定图表数据", "解释结论"] },
      description: "将时间范围、过滤条件和数据口径随结果返回。空结果要和查询失败分别处理。",
      checks: ["将图表中的一个数值与相同过滤条件下的查询结果逐项核对。"]
    },
    {
      color: "rose", title: "用轨迹定位失败", subtitle: "Trace Inspection",
      visual: { type: "flow", label: "单次任务的运行轨迹", steps: ["模型决策", "工具调用", "校验结果", "最终回答"] },
      description: "关联同一请求的模型与工具步骤，记录错误和耗时。保留调试所需字段，对敏感内容作脱敏。",
      checks: ["选取一个查询走错工具的样例，从轨迹定位首次偏离预期的步骤。"]
    },
    {
      color: "blue", title: "把回归拆到任务步骤", subtitle: "Agent Regression Evaluation",
      visual: { type: "bars", label: "通过率 · 基线 → 候选", rows: [
        { label: "路由", before: 84, value: 92 },
        { label: "工具入参", before: 75, value: 88 },
        { label: "最终结果", before: 81, value: 79 }
      ] },
      description: "用固定任务集同时检查轨迹和最终答案。示例中路由与入参改善，最终结果仍需排查。",
      checks: ["固定任务和判分口径，分别统计错误路由、错误工具参数和错误答案。"]
    }
  ],
  note: "案例与通过率为教学示例。评估方法参考下列文档。",
  sources: [
    { label: "OpenAI Agents SDK · Tracing", url: "https://openai.github.io/openai-agents-python/tracing/" },
    { label: "OpenAI · Agent evals", url: "https://developers.openai.com/api/docs/guides/agent-evals" }
  ]
});
