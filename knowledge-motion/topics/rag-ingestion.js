window.knowledgeTopics ??= [];
window.knowledgeTopics.push({
  "id": "rag-ingestion",
  "title": "知识库构建与索引更新",
  "subtitle": "从具体输入开始，逐步算到输出。",
  "cards": [
    {
      "color": "cyan",
      "title": "文档解析",
      "visual": {
        "type": "flow",
        "label": "逐步观察",
        "steps": [
          "PDF 包含两列文本和跨页表格",
          "保留页码、标题和表格结构",
          "核对“费用”是否对齐到正确行"
        ]
      },
      "description": "识别错误会被下游检索和引用放大。"
    },
    {
      "color": "purple",
      "title": "分块与上下文保留",
      "visual": {
        "type": "flow",
        "label": "逐步观察",
        "steps": [
          "标题“会员退款”与条款正文分开",
          "把标题一起写入文本块",
          "搜索“会员”时能召回正文"
        ]
      },
      "description": "重复携带的标题与重叠内容也消耗索引容量和上下文预算。"
    },
    {
      "color": "amber",
      "title": "父子块检索",
      "visual": {
        "type": "flow",
        "label": "逐步观察",
        "steps": [
          "子块只包含期限数字 7 天",
          "先召回短子块，再展开同一父节",
          "返回完整适用条件和出处"
        ]
      },
      "description": "短块便于精确匹配，父节补充上下文。不要跨到无关章节。"
    },
    {
      "color": "mint",
      "title": "删除与版本替换",
      "visual": {
        "type": "flow",
        "label": "逐步观察",
        "steps": [
          "旧政策 30 天被 7 天版本替换",
          "写入新版本并撤下失效版本",
          "用同一个查询断言旧条款不再可用"
        ]
      },
      "description": "索引、缓存与引用链接的版本需要一致。"
    },
    {
      "color": "rose",
      "title": "权限与过滤",
      "visual": {
        "type": "flow",
        "label": "逐步观察",
        "steps": [
          "同关键词命中公开资料和私有资料",
          "先限制可访问集合",
          "只向生成模型提供被授权的候选"
        ]
      },
      "description": "权限不能靠模型读完后再决定。还需检查日志与缓存隔离。"
    },
    {
      "color": "blue",
      "title": "索引可观测性",
      "visual": {
        "type": "flow",
        "label": "逐步观察",
        "steps": [
          "来源包含 100 份文档",
          "解析 99 份，索引 98 份",
          "定位 1 次解析失败和 1 次索引失败"
        ]
      },
      "description": "区分更新滞后、解析失败和召回质量，避免统一归为“RAG 效果差”。"
    }
  ],
  "sources": [
    {
      "label": "延伸阅读",
      "url": "https://arxiv.org/abs/2005.11401"
    }
  ]
});
