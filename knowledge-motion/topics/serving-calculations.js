window.knowledgeTopics ??= [];
window.knowledgeTopics.push({
  "id": "serving-calculations",
  "title": "推理显存与延迟实算",
  "subtitle": "从具体输入开始，逐步算到输出。",
  "cards": [
    {
      "color": "cyan",
      "title": "KV Cache 每 Token 占用",
      "visual": {
        "type": "flow",
        "label": "逐步观察",
        "steps": [
          "32 层，每层 8 个 KV 头，每头 128 维，FP16",
          "2（K/V）×32×8×128×2 字节",
          "每 Token 131072 字节，也就是 128 KiB"
        ]
      },
      "description": "只算缓存张量载荷。实际还要考虑分页、分片、缓存精度和实现开销。"
    },
    {
      "color": "purple",
      "title": "并发显存预算",
      "visual": {
        "type": "flow",
        "label": "逐步观察",
        "steps": [
          "每请求缓存 4096 Token，每 Token 128 KiB",
          "单请求 512 MiB",
          "8 个同长度请求共约 4 GiB KV 载荷"
        ]
      },
      "description": "并发预算还要扣除模型权重和临时工作空间。此处假设无前缀共享。"
    },
    {
      "color": "amber",
      "title": "页内碎片",
      "visual": {
        "type": "flow",
        "label": "逐步观察",
        "steps": [
          "一页 16 个 Token，当前请求有 33 个",
          "分配 ceil(33/16)=3 页",
          "容量 48，空出 15 个槽位"
        ]
      },
      "description": "分页降低了为整个最大序列连续预留的需求，仍会有页内浪费。"
    },
    {
      "color": "mint",
      "title": "首 Token 与输出间隔",
      "visual": {
        "type": "flow",
        "label": "逐步观察",
        "steps": [
          "首 Token 350 ms，生成 101 个 Token",
          "之后 100 个间隔，每个平均 12 ms",
          "总时间约 350+100×12=1550 ms"
        ]
      },
      "description": "本例首 Token 延迟含排队。长输入和慢解码需要分别定位。"
    },
    {
      "color": "rose",
      "title": "KV 头数与 GQA",
      "visual": {
        "type": "flow",
        "label": "逐步观察",
        "steps": [
          "将 KV 头从 32 降到 8，其他参数固定",
          "缓存载荷变成原来的 1/4",
          "用目标负载量实际显存并检查质量"
        ]
      },
      "description": "比较的是不同注意力结构的配置，不是上线时随意少保存缓存头。"
    },
    {
      "color": "blue",
      "title": "SLO 下测吞吐",
      "visual": {
        "type": "flow",
        "label": "逐步观察",
        "steps": [
          "配置 A 每秒 60 请求、p95 2.0 秒；B 每秒 48、p95 1.1 秒",
          "延迟 SLO 要求 p95≤1.5 秒",
          "本例只 B 同时满足给定条件"
        ]
      },
      "description": "实际应在多个负载点扫并发，比较满足 SLO 的最高吞吐。"
    }
  ],
  "sources": [
    {
      "label": "延伸阅读",
      "url": "https://arxiv.org/abs/2309.06180"
    }
  ]
});
