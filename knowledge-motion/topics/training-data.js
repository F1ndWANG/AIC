window.knowledgeTopics ??= [];
window.knowledgeTopics.push({
  "id": "training-data",
  "title": "预训练数据工程",
  "subtitle": "六个机制与对应的验证示例",
  "cards": [
    {
      "color": "cyan",
      "title": "语料清单",
      "subtitle": "",
      "visual": {
        "type": "flow",
        "label": "处理流程",
        "steps": [
          "记录来源",
          "标记语言与域",
          "固定版本"
        ]
      },
      "description": "为网页、代码和书籍分别记录可追踪的数据来源。"
    },
    {
      "color": "purple",
      "title": "清洗和质量过滤",
      "subtitle": "",
      "visual": {
        "type": "flow",
        "label": "处理流程",
        "steps": [
          "提取正文",
          "清理噪声",
          "抽查误删"
        ]
      },
      "description": "抽检过滤前后样本，避免把短代码或公式当作垃圾文本。"
    },
    {
      "color": "amber",
      "title": "精确去重",
      "subtitle": "",
      "visual": {
        "type": "flow",
        "label": "处理流程",
        "steps": [
          "规范化文本",
          "计算哈希",
          "合并完全相同样本"
        ]
      },
      "description": "检查镜像页面是否落到同一个重复簇。"
    },
    {
      "color": "mint",
      "title": "近重复检测",
      "subtitle": "",
      "visual": {
        "type": "flow",
        "label": "处理流程",
        "steps": [
          "文本切片",
          "生成指纹",
          "聚类相似文档"
        ]
      },
      "description": "检查模板页和近似转载，并审计阈值造成的误合并。"
    },
    {
      "color": "rose",
      "title": "数据混合与采样",
      "subtitle": "",
      "visual": {
        "type": "flow",
        "label": "处理流程",
        "steps": [
          "按语言和领域分桶",
          "设置权重",
          "记录 Token 占比"
        ]
      },
      "description": "对比配置权重与实际训练流中的 Token 占比。"
    },
    {
      "color": "blue",
      "title": "评估污染检查",
      "subtitle": "",
      "visual": {
        "type": "flow",
        "label": "处理流程",
        "steps": [
          "冻结评估集",
          "搜索重叠",
          "记录命中和处置"
        ]
      },
      "description": "检查复述版题干与原题是否跨训练和评估集合。"
    }
  ],
  "sources": [
    {
      "label": "GPT-3",
      "url": "https://arxiv.org/abs/2005.14165"
    }
  ]
});
