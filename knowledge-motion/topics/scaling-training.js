window.knowledgeTopics ??= [];
window.knowledgeTopics.push({
  "id": "scaling-training",
  "title": "规模化训练与 MoE",
  "subtitle": "六个机制与对应的验证示例",
  "cards": [
    {
      "color": "cyan",
      "title": "训练预算",
      "subtitle": "",
      "visual": {
        "type": "flow",
        "label": "处理流程",
        "steps": [
          "估算参数量和 Token 数",
          "规划算力",
          "设验证点"
        ]
      },
      "description": "固定算力比较不同参数量和数据量组合。"
    },
    {
      "color": "purple",
      "title": "梯度累积",
      "subtitle": "",
      "visual": {
        "type": "flow",
        "label": "处理流程",
        "steps": [
          "处理微批次",
          "累积梯度",
          "更新参数"
        ]
      },
      "description": "对比同一有效批量下的梯度尺度和学习率配置。"
    },
    {
      "color": "amber",
      "title": "数据并行与分片",
      "subtitle": "",
      "visual": {
        "type": "flow",
        "label": "处理流程",
        "steps": [
          "复制计算任务",
          "分配数据",
          "同步或分片状态"
        ]
      },
      "description": "测量峰值显存和通信时间，区分数据并行与状态分片。"
    },
    {
      "color": "mint",
      "title": "张量与流水并行",
      "subtitle": "",
      "visual": {
        "type": "flow",
        "label": "处理流程",
        "steps": [
          "切分层内矩阵或层间模块",
          "调度",
          "汇合结果"
        ]
      },
      "description": "观察一次前向在哪些位置通信和等待。"
    },
    {
      "color": "rose",
      "title": "MoE 路由",
      "subtitle": "",
      "visual": {
        "type": "flow",
        "label": "处理流程",
        "steps": [
          "计算专家分数",
          "选择专家",
          "聚合输出"
        ]
      },
      "description": "观察热门专家负载和被分派的 Token 数。"
    },
    {
      "color": "blue",
      "title": "恢复与复现",
      "subtitle": "",
      "visual": {
        "type": "flow",
        "label": "处理流程",
        "steps": [
          "保存权重和优化器",
          "记录数据位置",
          "恢复训练"
        ]
      },
      "description": "从中断点恢复，核对后续批次编号和损失曲线。"
    }
  ],
  "sources": [
    {
      "label": "Chinchilla",
      "url": "https://arxiv.org/abs/2203.15556"
    },
    {
      "label": "Switch Transformer",
      "url": "https://arxiv.org/abs/2101.03961"
    }
  ]
});
