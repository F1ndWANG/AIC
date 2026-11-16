window.knowledgeTopics ??= [];
window.knowledgeTopics.push({
  "id": "retrieval-ranking",
  "title": "检索融合与证据重排",
  "subtitle": "从具体输入开始，逐步算到输出。",
  "cards": [
    {
      "color": "cyan",
      "title": "词法检索",
      "visual": {
        "type": "flow",
        "label": "逐步观察",
        "steps": [
          "问题包含型号 XG-42",
          "按词项匹配召回型号文档",
          "检查完整型号是否排在前列"
        ]
      },
      "description": "词法信号容易抓住罕见精确标识。分别测试精确名称与同义表达。"
    },
    {
      "color": "purple",
      "title": "稠密检索",
      "visual": {
        "type": "flow",
        "label": "逐步观察",
        "steps": [
          "问题写的是“撤单”，文档写的是“取消订单”",
          "编码查询和文档",
          "以向量相似度召回同义条款"
        ]
      },
      "description": "语义相近的表述可能被召回，但相似度高不代表条款适用。"
    },
    {
      "color": "amber",
      "title": "倒数排名融合",
      "visual": {
        "type": "flow",
        "label": "逐步观察",
        "steps": [
          "词法 A、B；向量 B、C",
          "取 k=60，A 得 1/61，B 得 1/62+1/61",
          "融合后 B 排在 A 前"
        ]
      },
      "description": "RRF 使用各路排名，避免直接相加尺度不同的原始分数。"
    },
    {
      "color": "mint",
      "title": "交叉编码器重排",
      "visual": {
        "type": "flow",
        "label": "逐步观察",
        "steps": [
          "候选含旧政策和新政策",
          "逐对读取问题与候选文本",
          "按相关性重排后检查生效条件"
        ]
      },
      "description": "重排只处理召回集合。正确文档未被召回时，重排无法找回它。"
    },
    {
      "color": "rose",
      "title": "Recall@K 与 MRR",
      "visual": {
        "type": "flow",
        "label": "逐步观察",
        "steps": [
          "两个已知相关结果位于第 2 和第 5",
          "Recall@3=1/2",
          "首个相关结果在第 2 位，倒数排名=1/2"
        ]
      },
      "description": "前者关注前 K 找到多少；MRR 是对多条查询的首个相关结果倒数排名取平均。"
    },
    {
      "color": "blue",
      "title": "引用与因果复验",
      "visual": {
        "type": "flow",
        "label": "逐步观察",
        "steps": [
          "回答中引用了新条款",
          "移除该条款，重新运行",
          "检查回答是否承认证据不足"
        ]
      },
      "description": "验证回答是否依赖正确证据。若答案仍成立，继续检查其他有效来源或模型是否在猜测。"
    }
  ],
  "sources": [
    {
      "label": "延伸阅读",
      "url": "https://arxiv.org/abs/2005.11401"
    },
    {
      "label": "RRF",
      "url": "https://doi.org/10.1145/1571941.1572114"
    }
  ]
});
