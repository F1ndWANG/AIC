window.knowledgeTopics ??= [];
window.knowledgeTopics.push({
  "id": "efficient-serving",
  "title": "高效推理与服务",
  "subtitle": "六个机制与对应的验证示例",
  "cards": [
    {
      "color": "cyan",
      "title": "TTFT 与 TPOT",
      "subtitle": "",
      "visual": {
        "type": "flow",
        "label": "处理流程",
        "steps": [
          "接收请求",
          "统计首 Token",
          "统计后续 Token"
        ]
      },
      "description": "区分排队慢、长 Prompt 慢和逐 Token 生成慢。"
    },
    {
      "color": "purple",
      "title": "KV 缓存与分页",
      "subtitle": "",
      "visual": {
        "type": "flow",
        "label": "处理流程",
        "steps": [
          "保存历史 K/V",
          "分块管理",
          "回收已结束请求"
        ]
      },
      "description": "对比长短请求混合时的显存占用与吞吐。"
    },
    {
      "color": "amber",
      "title": "连续批处理",
      "subtitle": "",
      "visual": {
        "type": "flow",
        "label": "处理流程",
        "steps": [
          "排队",
          "按迭代插入新请求",
          "移除完成请求"
        ]
      },
      "description": "比较静态批处理和连续批处理的长尾延迟。"
    },
    {
      "color": "mint",
      "title": "FlashAttention",
      "subtitle": "",
      "visual": {
        "type": "flow",
        "label": "处理流程",
        "steps": [
          "分块读取 Q/K/V",
          "在线归一化",
          "合并输出"
        ]
      },
      "description": "在相同精度和序列长度下比较时间和显存。"
    },
    {
      "color": "rose",
      "title": "量化",
      "subtitle": "",
      "visual": {
        "type": "flow",
        "label": "处理流程",
        "steps": [
          "选择权重或激活精度",
          "校准",
          "验证误差"
        ]
      },
      "description": "同时比较质量基准、吞吐和显存，记录硬件。"
    },
    {
      "color": "blue",
      "title": "投机解码",
      "subtitle": "",
      "visual": {
        "type": "flow",
        "label": "处理流程",
        "steps": [
          "草稿提出多个 Token",
          "目标模型验证",
          "接受或修正"
        ]
      },
      "description": "按任务统计接受率，并比较吞吐是否实际改善。"
    }
  ],
  "sources": [
    {
      "label": "PagedAttention",
      "url": "https://arxiv.org/abs/2309.06180"
    },
    {
      "label": "FlashAttention",
      "url": "https://arxiv.org/abs/2205.14135"
    },
    {
      "label": "Speculative Decoding",
      "url": "https://arxiv.org/abs/2211.17192"
    }
  ]
});
