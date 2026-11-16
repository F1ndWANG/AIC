window.knowledgeTopics ??= [];
window.knowledgeTopics.push({
  "id": "sft-peft",
  "title": "指令微调与参数高效适配",
  "subtitle": "六个机制与对应的验证示例",
  "cards": [
    {
      "color": "cyan",
      "title": "指令数据设计",
      "subtitle": "",
      "visual": {
        "type": "flow",
        "label": "处理流程",
        "steps": [
          "定义任务覆盖",
          "编写示例",
          "去重切分"
        ]
      },
      "description": "检查拒答、多轮和工具格式，避免训练只覆盖单轮问答。"
    },
    {
      "color": "purple",
      "title": "监督目标与掩码",
      "subtitle": "",
      "visual": {
        "type": "flow",
        "label": "处理流程",
        "steps": [
          "对话序列",
          "选择监督位置",
          "累积交叉熵"
        ]
      },
      "description": "打印实际 labels，确认用户消息和 padding 的处理。"
    },
    {
      "color": "amber",
      "title": "Chat Template 与 EOS",
      "subtitle": "",
      "visual": {
        "type": "flow",
        "label": "处理流程",
        "steps": [
          "应用模板",
          "插入结束标记",
          "验证推理停止"
        ]
      },
      "description": "使用相同输入检查训练及推理端角色边界。"
    },
    {
      "color": "mint",
      "title": "全量微调与 LoRA",
      "subtitle": "",
      "visual": {
        "type": "flow",
        "label": "处理流程",
        "steps": [
          "选择训练参数",
          "注入低秩更新",
          "保存适配器"
        ]
      },
      "description": "列出可训练参数量，检查适配器与基座版本是否匹配。"
    },
    {
      "color": "rose",
      "title": "QLoRA",
      "subtitle": "",
      "visual": {
        "type": "flow",
        "label": "处理流程",
        "steps": [
          "量化冻结基座",
          "训练低秩参数",
          "验证输出"
        ]
      },
      "description": "对比显存、训练稳定性和下游表现。"
    },
    {
      "color": "blue",
      "title": "训练验收",
      "subtitle": "",
      "visual": {
        "type": "flow",
        "label": "处理流程",
        "steps": [
          "保存检查点",
          "跑能力切片",
          "比较基座"
        ]
      },
      "description": "同时测任务提升、旧任务退化和输出格式遵循。"
    }
  ],
  "sources": [
    {
      "label": "LoRA",
      "url": "https://arxiv.org/abs/2106.09685"
    },
    {
      "label": "QLoRA",
      "url": "https://arxiv.org/abs/2305.14314"
    }
  ]
});
