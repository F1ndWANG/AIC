window.knowledgeTopics ??= [];
window.knowledgeTopics.push({
  "id": "rsi-strategy-selection",
  "title": "RSI 的改进对象与策略选择",
  "subtitle": "从具体输入开始，逐步算到输出。",
  "cards": [
    {
      "color": "cyan",
      "title": "固定错误与选改进对象",
      "visual": {
        "type": "flow",
        "label": "逐步观察",
        "steps": [
          "三次错误都来自漏分页",
          "定位为可复用操作规则缺失",
          "优先验证记忆或工具策略更新"
        ]
      },
      "description": "先确认失败原因，才决定改记忆、Prompt、工具还是模型权重。"
    },
    {
      "color": "purple",
      "title": "Prompt 交叉对照",
      "visual": {
        "type": "flow",
        "label": "逐步观察",
        "steps": [
          "Prompt A 漏掉边界说明，B 加入停止条件",
          "固定模型、工具与推理预算",
          "在开发集挑选，在留出集确认"
        ]
      },
      "description": "持续使用同一测试集选择 Prompt 会污染评估。"
    },
    {
      "color": "amber",
      "title": "工作流策略改写",
      "visual": {
        "type": "flow",
        "label": "逐步观察",
        "steps": [
          "现有流程根据行数猜测是否翻页",
          "改为读取 next_cursor 并按协议终止",
          "比较漏页和重复页"
        ]
      },
      "description": "策略修改可能改变调用次数，需要同时报告成本。"
    },
    {
      "color": "mint",
      "title": "验证器改进",
      "visual": {
        "type": "flow",
        "label": "逐步观察",
        "steps": [
          "原验收只查文件存在",
          "改查文件、唯一行数和必要字段",
          "在人审样本上检查误接收与误拒绝"
        ]
      },
      "description": "验收变严格后，分数下降可能来自测量改善，先区分指标口径。"
    },
    {
      "color": "rose",
      "title": "训练式与非训练式改进",
      "visual": {
        "type": "flow",
        "label": "逐步观察",
        "steps": [
          "两条路线分别更新模型权重或外部记忆策略",
          "在相同任务上控制预算与反馈来源",
          "比较收益、计算成本与回滚代价"
        ]
      },
      "description": "明确每轮持久化变化。不要将不同改进手段统称为权重训练。"
    },
    {
      "color": "blue",
      "title": "停止准则",
      "visual": {
        "type": "flow",
        "label": "逐步观察",
        "steps": [
          "连续两轮开发集提升不足 1 个百分点且成本上升",
          "达到预先规定的预算或增益门槛",
          "停止更新，冻结最佳候选后跑留出验收"
        ]
      },
      "description": "停止条件应由开发指标和预算定义，正式测试保留到冻结后。"
    }
  ],
  "sources": [
    {
      "label": "延伸阅读",
      "url": "https://arxiv.org/abs/2310.02304"
    }
  ]
});
