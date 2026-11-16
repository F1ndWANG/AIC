window.knowledgeTopics ??= [];
window.knowledgeTopics.push({
  "id": "optimization-stability",
  "title": "训练优化与数值稳定性",
  "subtitle": "从具体输入开始，逐步算到输出。",
  "cards": [
    {
      "color": "cyan",
      "title": "交叉熵与置信度",
      "visual": {
        "type": "flow",
        "label": "逐步观察",
        "steps": [
          "目标 Token 的概率从 0.5 降到 0.1",
          "负对数损失从约 0.693 升到 2.303",
          "目标概率越小，损失越大"
        ]
      },
      "description": "固定目标、掩码和归约方式再比较模型输出，否则平均损失不一定可比。"
    },
    {
      "color": "purple",
      "title": "学习率预热",
      "visual": {
        "type": "flow",
        "label": "逐步观察",
        "steps": [
          "设峰值 0.001，预热 100 个更新步",
          "在线性预热的第 50 步达到 0.0005",
          "预热结束后进入既定调度"
        ]
      },
      "description": "以优化器更新步计数，区别于梯度累积中的微批次数。"
    },
    {
      "color": "amber",
      "title": "梯度范数裁剪",
      "visual": {
        "type": "flow",
        "label": "逐步观察",
        "steps": [
          "梯度向量 (3,4)，阈值 2",
          "原范数 sqrt(3²+4²)=5，乘以 2/5",
          "得到 (1.2,1.6)，范数降到 2"
        ]
      },
      "description": "全局裁剪按共同系数缩放，保持向量方向。未超过阈值时不缩放。"
    },
    {
      "color": "mint",
      "title": "AdamW 权重衰减",
      "visual": {
        "type": "flow",
        "label": "逐步观察",
        "steps": [
          "权重 2，学习率 0.1，衰减 0.01",
          "单独算衰减项 0.1×0.01×2=0.002",
          "若梯度更新项为 0，权重变为 1.998"
        ]
      },
      "description": "AdamW 的衰减独立于自适应梯度项。真实实现可能排除偏置和部分归一化参数。"
    },
    {
      "color": "rose",
      "title": "混合精度溢出",
      "visual": {
        "type": "flow",
        "label": "逐步观察",
        "steps": [
          "低精度梯度出现非有限值",
          "检查损失缩放与反缩放后的梯度",
          "在使用动态损失缩放时跳过该更新并调整缩放"
        ]
      },
      "description": "是否使用损失缩放取决于数据类型和训练框架。记录跳步次数帮助定位异常。"
    },
    {
      "color": "blue",
      "title": "恢复和训练诊断",
      "visual": {
        "type": "flow",
        "label": "逐步观察",
        "steps": [
          "续训后验证损失突然跳升",
          "核对优化器状态、调度步数与随机状态",
          "从同一个检查点对比连续训练与恢复训练"
        ]
      },
      "description": "仅加载模型权重并不能重建完整训练状态。"
    }
  ],
  "sources": [
    {
      "label": "延伸阅读",
      "url": "https://arxiv.org/abs/1711.05101"
    }
  ]
});
