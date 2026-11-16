window.knowledgeTopics ??= [];
window.knowledgeTopics.push({
  "id": "model-compression",
  "title": "模型压缩与部署验收",
  "subtitle": "从具体输入开始，逐步算到输出。",
  "cards": [
    {
      "color": "cyan",
      "title": "位宽和存储预算",
      "visual": {
        "type": "flow",
        "label": "逐步观察",
        "steps": [
          "10 亿权重，FP16 每个占 2 字节",
          "按 INT4 理论每个占半字节",
          "仅权重载荷从 2 GB 降到 0.5 GB"
        ]
      },
      "description": "比例忽略量化比例因子、填充、未量化参数与 KV Cache。"
    },
    {
      "color": "purple",
      "title": "量化和反量化",
      "visual": {
        "type": "flow",
        "label": "逐步观察",
        "steps": [
          "比例因子 0.2，权重 0.33",
          "round(0.33/0.2)=2",
          "恢复为 2×0.2=0.4"
        ]
      },
      "description": "本例量化误差为 0.07。实际还需检查可表示范围与舍入规则。"
    },
    {
      "color": "amber",
      "title": "分组与离群值",
      "visual": {
        "type": "flow",
        "label": "逐步观察",
        "steps": [
          "同组有许多小权重和一个极大权重",
          "最大值拉大量化间隔",
          "比较逐组缩放与保留敏感权重"
        ]
      },
      "description": "更小分组可能降低误差，但比例因子及元数据开销会增加。"
    },
    {
      "color": "mint",
      "title": "校准数据覆盖",
      "visual": {
        "type": "flow",
        "label": "逐步观察",
        "steps": [
          "校准集只有短文本",
          "长代码任务上的激活范围变化",
          "补充代表性长度和任务再验证"
        ]
      },
      "description": "校准与最终验收应避免共用同一组样本。"
    },
    {
      "color": "rose",
      "title": "蒸馏与质量保留",
      "visual": {
        "type": "flow",
        "label": "逐步观察",
        "steps": [
          "教师给出候选分布或答案",
          "学生学习教师输出",
          "在独立题上比较学生与原基线"
        ]
      },
      "description": "蒸馏会继承教师偏差，需要用真实标签或独立验证器校验。"
    },
    {
      "color": "blue",
      "title": "部署验收",
      "visual": {
        "type": "flow",
        "label": "逐步观察",
        "steps": [
          "质量达标，但目标硬件缺少对应低位算子",
          "检查反量化、访存和批大小",
          "实测首 Token、吞吐、显存和质量"
        ]
      },
      "description": "文件更小只说明存储压缩，速度需要端到端验证。"
    }
  ],
  "sources": [
    {
      "label": "延伸阅读",
      "url": "https://arxiv.org/abs/2210.17323"
    }
  ]
});
