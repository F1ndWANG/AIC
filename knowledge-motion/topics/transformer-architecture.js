window.knowledgeTopics ??= [];
window.knowledgeTopics.push({
  "id": "transformer-architecture",
  "title": "Transformer 架构",
  "subtitle": "六个机制与对应的验证示例",
  "cards": [
    {
      "color": "cyan",
      "title": "Q、K、V 投影",
      "subtitle": "",
      "visual": {
        "type": "flow",
        "label": "处理流程",
        "steps": [
          "输入向量",
          "三组线性投影",
          "查询键值"
        ]
      },
      "description": "用两个 Token 手算每个投影的形状，区分检索分数与被聚合内容。"
    },
    {
      "color": "purple",
      "title": "缩放点积注意力",
      "subtitle": "",
      "visual": {
        "type": "flow",
        "label": "处理流程",
        "steps": [
          "QKᵀ",
          "除以维度平方根",
          "softmax 加权 V"
        ]
      },
      "description": "检查相同注意力分数是否产生均匀权重。"
    },
    {
      "color": "amber",
      "title": "因果掩码",
      "subtitle": "",
      "visual": {
        "type": "flow",
        "label": "处理流程",
        "steps": [
          "构造上三角掩码",
          "屏蔽未来",
          "归一化"
        ]
      },
      "description": "修改第三个 Token，检查前两个位置的输出。"
    },
    {
      "color": "mint",
      "title": "多头与 GQA",
      "subtitle": "",
      "visual": {
        "type": "flow",
        "label": "处理流程",
        "steps": [
          "拆分查询头",
          "分组共享 KV",
          "拼接输出"
        ]
      },
      "description": "对比同层 MHA 与 GQA 的 KV 头数和缓存占用。"
    },
    {
      "color": "rose",
      "title": "位置编码与 RoPE",
      "subtitle": "",
      "visual": {
        "type": "flow",
        "label": "处理流程",
        "steps": [
          "生成位置相位",
          "旋转 Q 和 K",
          "计算注意力"
        ]
      },
      "description": "对比相对位移相同的 Token 对，检查位置关系如何影响分数。"
    },
    {
      "color": "blue",
      "title": "残差、归一化与 FFN",
      "subtitle": "",
      "visual": {
        "type": "flow",
        "label": "处理流程",
        "steps": [
          "残差连接",
          "归一化",
          "逐 Token 前馈"
        ]
      },
      "description": "检查注意力混合序列位置，FFN 则逐位置计算。"
    }
  ],
  "sources": [
    {
      "label": "Transformer",
      "url": "https://arxiv.org/abs/1706.03762"
    },
    {
      "label": "RoPE",
      "url": "https://arxiv.org/abs/2104.09864"
    },
    {
      "label": "GQA",
      "url": "https://arxiv.org/abs/2305.13245"
    }
  ]
});
