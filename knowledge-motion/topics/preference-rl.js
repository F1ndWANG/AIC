window.knowledgeTopics ??= [];
window.knowledgeTopics.push({
  "id": "preference-rl",
  "title": "偏好对齐与强化学习",
  "subtitle": "六个机制与对应的验证示例",
  "cards": [
    {
      "color": "cyan",
      "title": "偏好对",
      "subtitle": "",
      "visual": {
        "type": "flow",
        "label": "处理流程",
        "steps": [
          "固定 Prompt",
          "收集两个回答",
          "标记偏好"
        ]
      },
      "description": "检查长度、模板风格等是否意外替代真实质量判断。"
    },
    {
      "color": "purple",
      "title": "奖励模型",
      "subtitle": "",
      "visual": {
        "type": "flow",
        "label": "处理流程",
        "steps": [
          "输入回答对",
          "预测偏好排序",
          "验证泛化"
        ]
      },
      "description": "用分布外和对抗样本检查奖励是否被投机。"
    },
    {
      "color": "amber",
      "title": "DPO",
      "subtitle": "",
      "visual": {
        "type": "flow",
        "label": "处理流程",
        "steps": [
          "读取成对回答",
          "比较策略与参考的对数概率",
          "更新策略"
        ]
      },
      "description": "检查参考模型和对数概率掩码是否正确。"
    },
    {
      "color": "mint",
      "title": "PPO",
      "subtitle": "",
      "visual": {
        "type": "flow",
        "label": "处理流程",
        "steps": [
          "采样回答",
          "估计优势",
          "限制策略更新"
        ]
      },
      "description": "分别观测奖励、KL 和独立评估得分。"
    },
    {
      "color": "rose",
      "title": "GRPO",
      "subtitle": "",
      "visual": {
        "type": "flow",
        "label": "处理流程",
        "steps": [
          "同题生成一组回答",
          "构造相对优势",
          "更新策略"
        ]
      },
      "description": "观察同组奖励全相等时提供的学习信号。"
    },
    {
      "color": "blue",
      "title": "可验证奖励",
      "subtitle": "",
      "visual": {
        "type": "flow",
        "label": "处理流程",
        "steps": [
          "生成答案",
          "运行判题或测试",
          "检查奖励漏洞"
        ]
      },
      "description": "对比脚本通过率与真实正确率，保留独立留出集。"
    }
  ],
  "sources": [
    {
      "label": "DPO",
      "url": "https://arxiv.org/abs/2305.18290"
    },
    {
      "label": "DeepSeekMath / GRPO",
      "url": "https://arxiv.org/abs/2402.03300"
    },
    {
      "label": "PPO",
      "url": "https://arxiv.org/abs/1707.06347"
    }
  ]
});
