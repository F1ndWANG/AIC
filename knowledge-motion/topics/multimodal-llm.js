window.knowledgeTopics ??= [];
window.knowledgeTopics.push({
  "id": "multimodal-llm",
  "title": "多模态大语言模型",
  "subtitle": "六个机制与对应的验证示例",
  "cards": [
    {
      "color": "cyan",
      "title": "视觉编码",
      "subtitle": "",
      "visual": {
        "type": "flow",
        "label": "处理流程",
        "steps": [
          "图像切块",
          "视觉编码",
          "提取视觉表示"
        ]
      },
      "description": "改变分辨率，检查文字或小目标是否仍能被识别。"
    },
    {
      "color": "purple",
      "title": "视觉语言连接",
      "subtitle": "",
      "visual": {
        "type": "flow",
        "label": "处理流程",
        "steps": [
          "视觉表示",
          "映射到模型空间",
          "与文本融合"
        ]
      },
      "description": "对比删除图像前后的回答，检查模型是否确实使用视觉信息。"
    },
    {
      "color": "amber",
      "title": "多模态指令训练",
      "subtitle": "",
      "visual": {
        "type": "flow",
        "label": "处理流程",
        "steps": [
          "图文配对",
          "构造问答",
          "监督生成"
        ]
      },
      "description": "分别覆盖描述、读字、定位与跨区域推理。"
    },
    {
      "color": "mint",
      "title": "视频采样",
      "subtitle": "",
      "visual": {
        "type": "flow",
        "label": "处理流程",
        "steps": [
          "按时间抽帧",
          "保留顺序信息",
          "输入模型"
        ]
      },
      "description": "用短暂事件测试稀疏采样的漏检率。"
    },
    {
      "color": "rose",
      "title": "视觉证据与定位",
      "subtitle": "",
      "visual": {
        "type": "flow",
        "label": "处理流程",
        "steps": [
          "提问",
          "定位区域或片段",
          "输出有据的回答"
        ]
      },
      "description": "遮挡证据区域，观察对应判断是否有预期变化。"
    },
    {
      "color": "blue",
      "title": "多模态评估",
      "subtitle": "",
      "visual": {
        "type": "flow",
        "label": "处理流程",
        "steps": [
          "划分视觉能力",
          "对照文本捷径",
          "检查幻觉"
        ]
      },
      "description": "加入无目标图像、同类干扰图像和时间顺序反转样本。"
    }
  ],
  "sources": [
    {
      "label": "LLaVA",
      "url": "https://arxiv.org/abs/2304.08485"
    }
  ]
});
