window.knowledgeTopics ??= [];
window.knowledgeTopics.push({
  "id": "dpo-calculations",
  "title": "DPO 损失与偏好信号实算",
  "subtitle": "从具体输入开始，逐步算到输出。",
  "cards": [
    {
      "color": "cyan",
      "title": "同题构造偏好对",
      "visual": {
        "type": "flow",
        "label": "逐步观察",
        "steps": [
          "同一提示 x 下，A 为 chosen，B 为 rejected",
          "读取同一模型对两段完整回答的 log 概率",
          "逐 Token 对齐回答范围后求和"
        ]
      },
      "description": "输入提示要相同，需按训练配置处理 EOS 和掩码。"
    },
    {
      "color": "purple",
      "title": "当前策略差值",
      "visual": {
        "type": "flow",
        "label": "逐步观察",
        "steps": [
          "当前策略 log π(A)=-2，log π(B)=-4",
          "计算 -2-(-4)=2",
          "当前策略更偏向 A"
        ]
      },
      "description": "这两个数是序列 log 概率，还没有和参考策略比较。"
    },
    {
      "color": "amber",
      "title": "参考策略校正",
      "visual": {
        "type": "flow",
        "label": "逐步观察",
        "steps": [
          "参考差值为 1，当前差值为 2",
          "计算相对差值 Δ=2-1=1",
          "β=1 时 logit 为 1"
        ]
      },
      "description": "DPO logit 使用当前偏好与参考偏好之差，两个方向相同但差距可能不同。"
    },
    {
      "color": "mint",
      "title": "Sigmoid 与损失",
      "visual": {
        "type": "flow",
        "label": "逐步观察",
        "steps": [
          "logit=1",
          "σ(1)≈0.731",
          "单样本损失 -log(0.731)≈0.313"
        ]
      },
      "description": "logit 提高时，按这个偏好标签计算的损失下降。"
    },
    {
      "color": "rose",
      "title": "偏好写反",
      "visual": {
        "type": "flow",
        "label": "逐步观察",
        "steps": [
          "交换 A 与 B",
          "相对差值从 1 变成 -1",
          "损失从约 0.313 变成 1.313"
        ]
      },
      "description": "偏好标注错误会反向训练。抽查同一提示下两段回答的顺序。"
    },
    {
      "color": "blue",
      "title": "长度偏差检查",
      "visual": {
        "type": "flow",
        "label": "逐步观察",
        "steps": [
          "偏好数据里 chosen 典型长度大于 rejected",
          "按长度差、任务类型与标签抽检",
          "在长度相近的留出样本上复验"
        ]
      },
      "description": "避免把“更长即更好”的相关性误读为能力提升。"
    }
  ],
  "sources": [
    {
      "label": "延伸阅读",
      "url": "https://arxiv.org/abs/2305.18290"
    }
  ]
});
