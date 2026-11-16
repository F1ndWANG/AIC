window.knowledgeTopics ??= [];
window.knowledgeTopics.push({
  "id": "rsi-memory-control",
  "title": "RSI 记忆演化、隔离与回滚",
  "subtitle": "从具体输入开始，逐步算到输出。",
  "cards": [
    {
      "color": "cyan",
      "title": "持久化状态边界",
      "visual": {
        "type": "flow",
        "label": "逐步观察",
        "steps": [
          "基础模型和工具固定，记忆为 M0",
          "执行任务并验证产物",
          "将可复用经验写入 M1"
        ]
      },
      "description": "先明确定义什么会跨任务更新，什么属于临时工作状态。"
    },
    {
      "color": "purple",
      "title": "广度探索后的合并",
      "visual": {
        "type": "flow",
        "label": "逐步观察",
        "steps": [
          "并行两任务都读 M0",
          "任务 A 学到字段选择，B 学到分页",
          "合并成 M1，记录各自证据"
        ]
      },
      "description": "并行尝试避免互相串扰，合并时检查重复、冲突与适用条件。"
    },
    {
      "color": "amber",
      "title": "深度探索的触发条件",
      "visual": {
        "type": "flow",
        "label": "逐步观察",
        "steps": [
          "目标任务导出 80 条而非 128 条",
          "Verifier 定位遗漏分页",
          "Curriculum 增加有分页陷阱的练习"
        ]
      },
      "description": "关注具有迁移价值的失败，不把正式留出测试答案写进训练记忆。"
    },
    {
      "color": "mint",
      "title": "经验泛化与反例",
      "visual": {
        "type": "flow",
        "label": "逐步观察",
        "steps": [
          "经验写成“总是翻到第三页”",
          "反例只有两页或超过三页",
          "修正为“游标为空即结束”"
        ]
      },
      "description": "优先保存可验证的条件与操作规则，避免记录任务特定答案。"
    },
    {
      "color": "rose",
      "title": "冻结记忆与测试隔离",
      "visual": {
        "type": "flow",
        "label": "逐步观察",
        "steps": [
          "冻结 M0、M1，清空任务临时状态",
          "在相同未见任务和预算下执行",
          "评估期间禁止写回长期记忆"
        ]
      },
      "description": "对照组、实验组使用同样的评测规则，避免测试反馈改变被测系统。"
    },
    {
      "color": "blue",
      "title": "污染检测和回滚",
      "visual": {
        "type": "flow",
        "label": "逐步观察",
        "steps": [
          "新经验导致旧任务回归",
          "按来源定位 M1 中的错误规则",
          "回退规则并重跑新旧任务"
        ]
      },
      "description": "记忆也需要可追踪版本和回滚记录。确认修复没有抹掉其他有效经验。"
    }
  ],
  "sources": [
    {
      "label": "延伸阅读",
      "url": "https://github.com/AetherLabsAI/RSIAgent"
    }
  ]
});
