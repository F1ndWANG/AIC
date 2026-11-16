window.knowledgeTopics ??= [];
window.knowledgeTopics.push({
  "id": "context-engineering",
  "title": "长上下文与上下文工程",
  "subtitle": "从具体输入开始，逐步算到输出。",
  "cards": [
    {
      "color": "cyan",
      "title": "输入输出预算",
      "visual": {
        "type": "flow",
        "label": "逐步观察",
        "steps": [
          "上下文窗口 8192，预留输出 1024",
          "输入最多 7168 Token",
          "原输入 7600，减少至少 432"
        ]
      },
      "description": "先计入系统消息、工具描述和模板开销，再决定删哪些内容。"
    },
    {
      "color": "purple",
      "title": "证据位置敏感性",
      "visual": {
        "type": "flow",
        "label": "逐步观察",
        "steps": [
          "同一段条款分别放开头、中部、结尾",
          "固定总长度、问题和其他文本",
          "按位置比较正确率"
        ]
      },
      "description": "单独控制证据位置，才容易判断下降来自位置还是输入内容变化。"
    },
    {
      "color": "amber",
      "title": "检索式上下文",
      "visual": {
        "type": "flow",
        "label": "逐步观察",
        "steps": [
          "20 段候选，每段 180 Token",
          "选 4 段高相关证据",
          "证据正文从 3600 降到 720 Token"
        ]
      },
      "description": "除了节省预算，还需测召回率。删掉唯一证据会使压缩适得其反。"
    },
    {
      "color": "mint",
      "title": "摘要与精确保留",
      "visual": {
        "type": "flow",
        "label": "逐步观察",
        "steps": [
          "旧轮次含订单编号 00042",
          "摘要将编号归为订单 42",
          "提取字段原样保存，摘要只写背景"
        ]
      },
      "description": "编号、数值、日期和权限约束需要保留原文或结构化字段。"
    },
    {
      "color": "rose",
      "title": "相同前缀复用",
      "visual": {
        "type": "flow",
        "label": "逐步观察",
        "steps": [
          "两个请求共享完全相同的长前缀",
          "复用受支持的已计算前缀 KV",
          "分别处理各自不同的后缀"
        ]
      },
      "description": "改变前缀中的一个 Token 后，应按系统规则重算变化点以后的状态。"
    },
    {
      "color": "blue",
      "title": "上下文回归测试",
      "visual": {
        "type": "flow",
        "label": "逐步观察",
        "steps": [
          "规定 12 道题与 3 种位置",
          "固定输入长度，移动证据",
          "对比证据命中、答案和延迟"
        ]
      },
      "description": "不要仅报告模型声明的最大窗口。长上下文可用性需要独立测量。"
    }
  ],
  "sources": [
    {
      "label": "延伸阅读",
      "url": "https://arxiv.org/abs/2307.03172"
    }
  ]
});
