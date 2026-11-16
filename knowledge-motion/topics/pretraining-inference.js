window.knowledgeTopics ??= [];
window.knowledgeTopics.push({
  "id": "pretraining-inference",
  "title": "预训练与推理",
  "subtitle": "用因果语言建模学习，再用两阶段推理生成输出。",
  "cards": [
    {
      "color": "cyan",
      "title": "构造训练数据",
      "subtitle": "语料清洗 / 分词 / 序列切分",
      "visual": {
        "type": "flow",
        "label": "处理流程",
        "steps": [
          "语料清洗",
          "分词",
          "序列切分"
        ]
      },
      "description": "按文档拆分训练与评估集，检查重复和版本。"
    },
    {
      "color": "purple",
      "title": "因果语言建模",
      "subtitle": "输入序列 / 预测右移目标 / 交叉熵",
      "visual": {
        "type": "flow",
        "label": "处理流程",
        "steps": [
          "输入序列",
          "预测右移目标",
          "交叉熵"
        ]
      },
      "description": "用短序列手工核对预测位置与目标 Token。"
    },
    {
      "color": "amber",
      "title": "参数优化",
      "subtitle": "前向 / 反向 / 更新权重",
      "visual": {
        "type": "flow",
        "label": "处理流程",
        "steps": [
          "前向",
          "反向",
          "更新权重"
        ]
      },
      "description": "同时追踪训练和验证损失，定位过拟合。"
    },
    {
      "color": "mint",
      "title": "预填充",
      "subtitle": "输入 Prompt / 并行处理上下文 / 保存 KV",
      "visual": {
        "type": "flow",
        "label": "处理流程",
        "steps": [
          "输入 Prompt",
          "并行处理上下文",
          "保存 KV"
        ]
      },
      "description": "按 Prompt 长度分别测量首 Token 延迟。"
    },
    {
      "color": "rose",
      "title": "逐步解码",
      "subtitle": "读取已缓存 KV / 生成 Token / 更新 KV",
      "visual": {
        "type": "flow",
        "label": "处理流程",
        "steps": [
          "读取已缓存 KV",
          "生成 Token",
          "更新 KV"
        ]
      },
      "description": "固定模型比较启用缓存前后的解码延迟和显存。"
    },
    {
      "color": "blue",
      "title": "生成策略",
      "subtitle": "调整温度 / 筛选候选 / 贪心或采样",
      "visual": {
        "type": "flow",
        "label": "处理流程",
        "steps": [
          "调整温度",
          "筛选候选",
          "贪心或采样"
        ]
      },
      "description": "固定 Prompt 对比输出稳定性和多样性。"
    }
  ],
  "sources": [
    {
      "label": "GPT-3 论文",
      "url": "https://arxiv.org/abs/2005.14165"
    }
  ]
});
