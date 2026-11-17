window.knowledgeTopics ??= [];
window.knowledgeTopics.push({
  "id": "rsi",
  "title": "RSI 递归自我改进",
  "subtitle": "以 RSIAgent 为例，展示固定模型权重时如何通过已验证经验更新记忆。",
  "cards": [
    {
      "color": "cyan",
      "title": "广度探索",
      "subtitle": "为什么一开始要尝试不同类型的任务？",
      "visual": {
        "type": "flow",
        "label": "点击「演示机制」，逐步核对",
        "steps": [
          "起点",
          "覆盖操作",
          "归并经验"
        ],
        "narrations": [
          "教学场景：调查一个新的订单后台。初始记忆 M₀ 为空。",
          "Curriculum 给出筛选、翻页、导出三类任务。并行尝试共享同一初始记忆。",
          "一批任务执行并经验证后，再合并各任务的操作发现。"
        ]
      },
      "description": "",
      "checkpoint": {
        "question": "把同一个筛选任务跑十次，就获得了三类操作经验吗？",
        "answer": "没有。重复可以检验稳定性，但广度主要来自覆盖不同任务或操作。"
      },
      "source": {
        "label": "原始资料",
        "url": "https://github.com/AetherLabsAI/RSIAgent#-method"
      }
    },
    {
      "color": "purple",
      "title": "Actor 执行",
      "subtitle": "Actor 怎样把记忆变成环境中的动作？",
      "visual": {
        "type": "flow",
        "label": "点击「演示机制」，逐步核对",
        "steps": [
          "读取",
          "行动",
          "交付"
        ],
        "narrations": [
          "任务要求导出全部订单。可用经验只提到“先应用筛选”。",
          "Actor 执行筛选与导出，工具返回文件路径。",
          "产生实际 CSV，记录动作与文件。此时还需独立检查内容。"
        ]
      },
      "description": "",
      "checkpoint": {
        "question": "工具返回文件路径，能证明导出了全部订单吗？",
        "answer": "不能。路径只能指向产物，记录数和记录内容仍需验收。"
      },
      "source": {
        "label": "原始资料",
        "url": "https://github.com/AetherLabsAI/RSIAgent#-method"
      }
    },
    {
      "color": "amber",
      "title": "Verifier 独立验证",
      "subtitle": "怎样发现一个成功返回的工具结果其实没有完成任务？",
      "visual": {
        "type": "flow",
        "label": "点击「演示机制」，逐步核对",
        "steps": [
          "验收条件",
          "检查产物",
          "反馈"
        ],
        "narrations": [
          "目标是 128 个唯一订单 ID，不能只验文件存在。",
          "Verifier 读取 CSV，得到 80 个符合条件的唯一 ID，缺少 48 个。",
          "将缺失作为可核验反馈交给 Actor，供后续定位原因。"
        ]
      },
      "description": "",
      "checkpoint": {
        "question": "CSV 有 128 行就一定通过吗？",
        "answer": "不一定。重复 ID 可能让行数达标，仍要检查唯一性和对应的任务条件。"
      },
      "source": {
        "label": "原始资料",
        "url": "https://github.com/AetherLabsAI/RSIAgent#-method"
      }
    },
    {
      "color": "mint",
      "title": "提炼并更新记忆",
      "subtitle": "怎样把一次成功修复变成可复用的记忆？",
      "visual": {
        "type": "flow",
        "label": "点击「演示机制」，逐步核对",
        "steps": [
          "观察",
          "提炼",
          "合并"
        ],
        "narrations": [
          "首次只导出第一页。补齐分页后验收通过，日志显示最后一页没有续页游标。",
          "记录可验证规则：此接口仍有 next_cursor 时继续，游标为空时停止。",
          "写入 M₁ 时附上适用接口和证据，避免把固定页数当成规则。"
        ]
      },
      "description": "",
      "checkpoint": {
        "question": "换用返回 continuation 字段的接口，可以原样执行旧脚本吗？",
        "answer": "不能默认可用。停止原则可尝试迁移，字段与接口契约须重新核对。"
      },
      "source": {
        "label": "原始资料",
        "url": "https://github.com/AetherLabsAI/RSIAgent#-method"
      }
    },
    {
      "color": "rose",
      "title": "深度探索",
      "subtitle": "发现漏页后，该追加什么训练任务？",
      "visual": {
        "type": "flow",
        "label": "点击「演示机制」，逐步核对",
        "steps": [
          "定位缺口",
          "定向练习",
          "回试目标"
        ],
        "narrations": [
          "依据验证反馈，把问题缩小到分页，而不是泛泛地重做报表。",
          "安排 2 页和 5 页的练习，检查停止条件在不同页数下是否成立。",
          "用验证后的分页经验再试目标流程，检查行数与去重。"
        ]
      },
      "description": "",
      "checkpoint": {
        "question": "只有固定 3 页的练习都通过，能证明分页策略泛化吗？",
        "answer": "不能。固定翻三页也会通过，变更页数才能更直接区分两种策略。"
      },
      "source": {
        "label": "原始资料",
        "url": "https://github.com/AetherLabsAI/RSIAgent#-method"
      }
    },
    {
      "color": "blue",
      "title": "冻结记忆评估",
      "subtitle": "怎样判断收益来自记忆而非测试时继续练习？",
      "visual": {
        "type": "flow",
        "label": "点击「演示机制」，逐步核对",
        "steps": [
          "冻结",
          "对照",
          "解释"
        ],
        "narrations": [
          "冻结旧版 M₀ 与新版 M₁，正式测试不启动 Curriculum 或更新记忆。",
          "相同未见任务、模型、工具和预算下分别运行。教学例旧版成功 4/10，新版 7/10。",
          "净变化为 +30 个百分点；同时查看新增成功、原本成功却退化的任务与调用成本。"
        ]
      },
      "description": "",
      "checkpoint": {
        "question": "如果失败后写入测试答案，再重跑算分，有效吗？",
        "answer": "这会失去独立留出的意义。该反馈可用于另建开发集，不应用于同一轮冻结验收。"
      },
      "source": {
        "label": "原始资料",
        "url": "https://github.com/AetherLabsAI/RSIAgent#-method"
      }
    }
  ],
  "sources": [
    {
      "label": "RSIAgent 项目与架构",
      "url": "https://github.com/AetherLabsAI/RSIAgent"
    }
  ]
});
