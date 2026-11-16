window.knowledgeTopics ??= [];
window.knowledgeTopics.push({
  "id": "rsi",
  "title": "RSI 递归自我改进",
  "subtitle": "以 RSIAgent 为例，展示固定模型权重时如何通过已验证经验更新记忆。",
  "cards": [
    {
      "color": "cyan",
      "title": "广度探索",
      "subtitle": "Curriculum / 提议多样任务 / 分配探索",
      "visual": {
        "type": "flow",
        "label": "处理流程",
        "steps": [
          "Curriculum",
          "提议多样任务",
          "分配探索"
        ]
      },
      "description": "检查任务是否覆盖多种环境操作，以及失败记录是否保留。"
    },
    {
      "color": "purple",
      "title": "Actor 执行",
      "subtitle": "读取记忆 / 执行工具 / 产生环境变化",
      "visual": {
        "type": "flow",
        "label": "处理流程",
        "steps": [
          "读取记忆",
          "执行工具",
          "产生环境变化"
        ]
      },
      "description": "记录可重放的工具调用和产物。"
    },
    {
      "color": "amber",
      "title": "Verifier 独立验证",
      "subtitle": "读取任务要求 / 检查实际结果 / 反馈",
      "visual": {
        "type": "flow",
        "label": "处理流程",
        "steps": [
          "读取任务要求",
          "检查实际结果",
          "反馈"
        ]
      },
      "description": "用执行成功但产物错误的案例检查验证规则。"
    },
    {
      "color": "mint",
      "title": "提炼并更新记忆",
      "subtitle": "已验证经验 / 提炼流程与教训 / 合并记忆",
      "visual": {
        "type": "flow",
        "label": "处理流程",
        "steps": [
          "已验证经验",
          "提炼流程与教训",
          "合并记忆"
        ]
      },
      "description": "对互相矛盾的经验进行复验，保留适用条件。"
    },
    {
      "color": "rose",
      "title": "深度探索",
      "subtitle": "尝试目标任务 / 发现缺口 / 定向练习",
      "visual": {
        "type": "flow",
        "label": "处理流程",
        "steps": [
          "尝试目标任务",
          "发现缺口",
          "定向练习"
        ]
      },
      "description": "每轮用验证结果调整练习任务。"
    },
    {
      "color": "blue",
      "title": "冻结记忆评估",
      "subtitle": "冻结记忆 / 执行留出任务 / 比较成功率",
      "visual": {
        "type": "flow",
        "label": "处理流程",
        "steps": [
          "冻结记忆",
          "执行留出任务",
          "比较成功率"
        ]
      },
      "description": "在相同预算下比较无记忆、只做广度探索和完整探索。"
    }
  ],
  "sources": [
    {
      "label": "RSIAgent 项目与架构",
      "url": "https://github.com/AetherLabsAI/RSIAgent"
    }
  ]
});
