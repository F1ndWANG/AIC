window.knowledgeTopics ??= [];
window.knowledgeTopics.push({
  "id": "inference-search",
  "title": "推理搜索与预算分配",
  "subtitle": "从具体输入开始，逐步算到输出。",
  "cards": [
    {
      "color": "cyan",
      "title": "推理预算",
      "visual": {
        "type": "flow",
        "label": "逐步观察",
        "steps": [
          "每请求最多生成 4000 Token",
          "先为候选与验证划分预算",
          "到达上限时返回已验证的最佳可用结果或说明失败"
        ]
      },
      "description": "要同时报告正确率与预算。更长推理并不总能解决根因。"
    },
    {
      "color": "purple",
      "title": "候选分支",
      "visual": {
        "type": "flow",
        "label": "逐步观察",
        "steps": [
          "问题有两种可行求解路线",
          "同时保留两个中间状态",
          "先验证容易检查的中间约束"
        ]
      },
      "description": "如果分支依赖相同错误假设，增加候选数也未必增加多样性。"
    },
    {
      "color": "amber",
      "title": "展开与剪枝",
      "visual": {
        "type": "flow",
        "label": "逐步观察",
        "steps": [
          "分支 A 违反硬约束，B、C 仍可行",
          "移除 A，继续展开 B 和 C",
          "把剩余预算花在可行路径"
        ]
      },
      "description": "硬约束可用于早停。启发式分数低只说明优先级低。"
    },
    {
      "color": "mint",
      "title": "验证器排序",
      "visual": {
        "type": "flow",
        "label": "逐步观察",
        "steps": [
          "两个候选叙述都合理",
          "运行独立算术、代码单测或环境检查",
          "按证据选择候选，并记录拒绝原因"
        ]
      },
      "description": "验证器覆盖不全时，测试通过不能保证真正正确。"
    },
    {
      "color": "rose",
      "title": "成功即停止",
      "visual": {
        "type": "flow",
        "label": "逐步观察",
        "steps": [
          "上限 8 次，第 3 次出现可独立验收的答案",
          "记录成功证据",
          "在此停止，节省余下 5 次生成"
        ]
      },
      "description": "早停以证据为依据，别把模型的自评分数当独立验收。"
    },
    {
      "color": "blue",
      "title": "搜索增益评估",
      "visual": {
        "type": "flow",
        "label": "逐步观察",
        "steps": [
          "同一批题比较 1 次与 8 次采样",
          "记录成功率、平均 Token 和延迟分位数",
          "按题型分析收益与成本"
        ]
      },
      "description": "需要区分模型能力提升与额外推理预算产生的收益。"
    }
  ],
  "sources": [
    {
      "label": "延伸阅读",
      "url": "https://arxiv.org/abs/2305.10601"
    }
  ]
});
