window.knowledgeTopics ??= [];
window.knowledgeTopics.push({
  "id": "rag",
  "title": "RAG 检索增强生成",
  "subtitle": "以知识库问答为例，展示从建索引到回答验证的过程。",
  "cards": [
    {
      "color": "cyan",
      "title": "文档切分",
      "subtitle": "文档 / 文本块 / 保存来源",
      "visual": {
        "type": "flow",
        "label": "处理流程",
        "steps": [
          "文档",
          "文本块",
          "保存来源"
        ]
      },
      "description": "用跨段问题检查切分是否切断关键语义。"
    },
    {
      "color": "purple",
      "title": "建立索引",
      "subtitle": "文本块 / 表示编码 / 建立可检索索引",
      "visual": {
        "type": "flow",
        "label": "处理流程",
        "steps": [
          "文本块",
          "表示编码",
          "建立可检索索引"
        ]
      },
      "description": "确认分块可映射回原文、版本和位置。"
    },
    {
      "color": "amber",
      "title": "候选召回",
      "subtitle": "用户问题 / 检索 / 返回候选块",
      "visual": {
        "type": "flow",
        "label": "处理流程",
        "steps": [
          "用户问题",
          "检索",
          "返回候选块"
        ]
      },
      "description": "用已知证据位置的问题测量 Recall@K。"
    },
    {
      "color": "mint",
      "title": "重排与筛选",
      "subtitle": "候选块 / 相关性打分 / 保留高相关证据",
      "visual": {
        "type": "flow",
        "label": "处理流程",
        "steps": [
          "候选块",
          "相关性打分",
          "保留高相关证据"
        ]
      },
      "description": "检查重排前后关键证据的名次。"
    },
    {
      "color": "rose",
      "title": "生成与引用",
      "subtitle": "问题和证据 / 生成回答 / 附上来源",
      "visual": {
        "type": "flow",
        "label": "处理流程",
        "steps": [
          "问题和证据",
          "生成回答",
          "附上来源"
        ]
      },
      "description": "检查每个关键断言是否能在引用段落找到支持。"
    },
    {
      "color": "blue",
      "title": "评估与拒答",
      "subtitle": "核对检索命中 / 检查回答 / 证据不足时拒答",
      "visual": {
        "type": "flow",
        "label": "处理流程",
        "steps": [
          "核对检索命中",
          "检查回答",
          "证据不足时拒答"
        ]
      },
      "description": "分别测试无答案、冲突文档和过期文档。"
    }
  ],
  "sources": [
    {
      "label": "RAG 原论文",
      "url": "https://arxiv.org/abs/2005.11401"
    }
  ]
});
