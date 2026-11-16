window.knowledgeTopics ??= [];
window.knowledgeTopics.push({
  "id": "tokenization",
  "title": "分词与输入编码",
  "subtitle": "六个机制与对应的验证示例",
  "cards": [
    {
      "color": "cyan",
      "title": "语料与字符规范化",
      "subtitle": "",
      "visual": {
        "type": "flow",
        "label": "处理流程",
        "steps": [
          "原始文本",
          "统一处理",
          "保留原文对照"
        ]
      },
      "description": "用全角字符、组合音符和代码缩进检查规范化是否改变含义。"
    },
    {
      "color": "purple",
      "title": "BPE 合并",
      "subtitle": "",
      "visual": {
        "type": "flow",
        "label": "处理流程",
        "steps": [
          "字符或字节",
          "统计相邻对",
          "合并高频对"
        ]
      },
      "description": "在小词表上手算一轮合并，比较合并前后的序列长度。"
    },
    {
      "color": "amber",
      "title": "词表与回退",
      "subtitle": "",
      "visual": {
        "type": "flow",
        "label": "处理流程",
        "steps": [
          "查找词表",
          "拆分罕见片段",
          "生成 ID"
        ]
      },
      "description": "用罕见字和 emoji 检查 tokenizer 的回退行为。"
    },
    {
      "color": "mint",
      "title": "特殊 Token",
      "subtitle": "",
      "visual": {
        "type": "flow",
        "label": "处理流程",
        "steps": [
          "插入角色或边界",
          "区分正常文本",
          "编码"
        ]
      },
      "description": "检查用户文字中的角色标记是否被错误当作控制符。"
    },
    {
      "color": "rose",
      "title": "上下文预算",
      "subtitle": "",
      "visual": {
        "type": "flow",
        "label": "处理流程",
        "steps": [
          "分词计数",
          "保留必要上下文",
          "控制截断"
        ]
      },
      "description": "比较相同字数的中英文和代码，检查输出预算是否被挤占。"
    },
    {
      "color": "blue",
      "title": "编码回环",
      "subtitle": "",
      "visual": {
        "type": "flow",
        "label": "处理流程",
        "steps": [
          "文本",
          "Token ID",
          "解码文本"
        ]
      },
      "description": "检查训练和部署是否使用相同词表与模板，并验证预期的回环差异。"
    }
  ],
  "sources": [
    {
      "label": "Subword Units / BPE",
      "url": "https://arxiv.org/abs/1508.07909"
    }
  ]
});
