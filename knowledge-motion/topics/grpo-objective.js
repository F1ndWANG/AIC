window.knowledgeTopics ??= [];
window.knowledgeTopics.push({
  "id": "grpo-objective",
  "title": "GRPO：优势、裁剪和参考约束",
  "subtitle": "从具体输入开始，逐步算到输出。",
  "cards": [
    {
      "color": "cyan",
      "title": "同题组内采样",
      "visual": {
        "type": "flow",
        "label": "点击「演示机制」逐步观察",
        "steps": [
          "固定题目",
          "评结果",
          "组内比较"
        ],
        "narrations": [
          "选一个给定提示，让采样时的旧策略独立生成四份候选。",
          "假设结果监督给四份回答打分 0、1、1、2。",
          "接下来用这四个分数的均值和标准差定义相对优势。"
        ],
        "scenes": [
          [
            {
              "label": "提示",
              "value": "同一题"
            },
            {
              "label": "回答",
              "value": "4 份"
            }
          ],
          [
            {
              "label": "奖励",
              "value": "[0, 1, 1, 2]"
            },
            {
              "label": "打分单位",
              "value": "完整回答"
            }
          ],
          [
            {
              "label": "比较范围",
              "value": "本提示内"
            },
            {
              "label": "下一步",
              "value": "标准化"
            }
          ]
        ]
      },
      "description": "",
      "source": {
        "label": "DeepSeekMath · §4.1.2 / 结果监督",
        "url": "https://arxiv.org/pdf/2402.03300"
      },
      "subtitle": "为什么一组回答要来自同一个题目？",
      "checkpoint": {
        "question": "能把不同题目的奖励直接混成同一组吗？",
        "answer": "不能用于这个组内归一化例子。分组依据是同一提示，不同题目的难度和奖励基线可能不同。"
      }
    },
    {
      "color": "purple",
      "title": "结果监督的优势",
      "visual": {
        "type": "flow",
        "label": "点击「演示机制」逐步观察",
        "steps": [
          "算基线",
          "算尺度",
          "分给 Token"
        ],
        "narrations": [
          "四个分数为 0、1、1、2。均值为 1。",
          "本教学例使用总体标准差。平方偏差平均为 0.5，标准差是 √0.5。",
          "把每个回答的标准化奖励分配给该回答的生成 Token。"
        ],
        "scenes": [
          [
            {
              "label": "组均值",
              "value": "1"
            },
            {
              "label": "中心化",
              "value": "[−1, 0, 0, 1]"
            }
          ],
          [
            {
              "label": "标准差",
              "value": "约 0.707"
            },
            {
              "label": "归一化",
              "value": "[−1.414, 0, 0, 1.414]"
            }
          ],
          [
            {
              "label": "奖励 0 的回答",
              "value": "各 Token 用 −1.414"
            },
            {
              "label": "奖励 2 的回答",
              "value": "各 Token 用 +1.414"
            }
          ]
        ]
      },
      "description": "",
      "source": {
        "label": "DeepSeekMath · §4.1.2 / 结果监督",
        "url": "https://arxiv.org/pdf/2402.03300"
      },
      "subtitle": "结果奖励怎样变成每个 Token 的优势？",
      "checkpoint": {
        "question": "奖励为 2 的回答里只有最后一个 Token 获得正优势吗？",
        "answer": "在这个结果监督设置下不会。该回答的生成 Token 共用标准化后的响应级奖励。"
      }
    },
    {
      "color": "amber",
      "title": "新旧策略比值",
      "visual": {
        "type": "flow",
        "label": "点击「演示机制」逐步观察",
        "steps": [
          "找到采样策略",
          "找到当前策略",
          "区分正则"
        ],
        "narrations": [
          "旧策略是产生这批响应时的策略。假设它给某个同前缀 Token 的概率为 0.2。",
          "当前训练策略给相同前缀下同一个 Token 的概率为 0.3。",
          "参考策略用来约束当前策略偏移，不替代采样时的分母。"
        ],
        "scenes": [
          [
            {
              "label": "旧策略",
              "value": "0.2"
            },
            {
              "label": "用途",
              "value": "比值分母"
            }
          ],
          [
            {
              "label": "当前策略",
              "value": "0.3"
            },
            {
              "label": "比值 r",
              "value": "0.3 / 0.2 = 1.5"
            }
          ],
          [
            {
              "label": "当前 / 旧",
              "value": "重要性比值"
            },
            {
              "label": "当前与参考",
              "value": "KL 约束"
            }
          ]
        ]
      },
      "description": "",
      "source": {
        "label": "DeepSeekMath · 式 (3) / 裁剪与 KL",
        "url": "https://arxiv.org/pdf/2402.03300"
      },
      "subtitle": "当前、旧策略与参考策略如何分工？",
      "checkpoint": {
        "question": "用参考策略概率代替旧策略计算 r，可以吗？",
        "answer": "在原目标里不可以。分母对应实际采样策略，参考策略用于计算 KL 约束。"
      }
    },
    {
      "color": "mint",
      "title": "正优势裁剪",
      "visual": {
        "type": "flow",
        "label": "点击「演示机制」逐步观察",
        "steps": [
          "给定条件",
          "并行算两支",
          "取较小值"
        ],
        "narrations": [
          "优势为正 1，比值为 1.5，裁剪区间为 [0.8,1.2]。",
          "原始分支为 1.5×1，裁剪分支为 1.2×1。",
          "最大化的目标使用两个分支的较小值。此处正优势代理项停在 1.2。"
        ],
        "scenes": [
          [
            {
              "label": "A",
              "value": "+1"
            },
            {
              "label": "r",
              "value": "1.5"
            }
          ],
          [
            {
              "label": "原始 rA",
              "value": "1.5"
            },
            {
              "label": "裁剪分支",
              "value": "1.2"
            }
          ],
          [
            {
              "label": "代理项",
              "value": "1.2"
            },
            {
              "label": "范围",
              "value": "仅一个 Token"
            }
          ]
        ]
      },
      "description": "",
      "source": {
        "label": "DeepSeekMath · 式 (3) / 裁剪与 KL",
        "url": "https://arxiv.org/pdf/2402.03300"
      },
      "subtitle": "正优势下，为什么不会一直奖励增大比值？",
      "checkpoint": {
        "question": "当 r=1.1、A=1、ε=0.2 时，代理项是多少？",
        "answer": "1.1。比值仍位于裁剪区间内，两分支相同。"
      }
    },
    {
      "color": "rose",
      "title": "负优势裁剪",
      "visual": {
        "type": "flow",
        "label": "点击「演示机制」逐步观察",
        "steps": [
          "给定条件",
          "并行算两支",
          "取较小值"
        ],
        "narrations": [
          "优势为负 1，比值为 0.5，裁剪值为 0.8。",
          "分别乘负数。数值的大小关系随之反转。",
          "负优势情况下，原目标仍在相乘之后取最小值。"
        ],
        "scenes": [
          [
            {
              "label": "A",
              "value": "−1"
            },
            {
              "label": "r / clip(r)",
              "value": "0.5 / 0.8"
            }
          ],
          [
            {
              "label": "原始 rA",
              "value": "−0.5"
            },
            {
              "label": "裁剪分支",
              "value": "−0.8"
            }
          ],
          [
            {
              "label": "代理项",
              "value": "−0.8"
            },
            {
              "label": "范围",
              "value": "未含 KL 与归约"
            }
          ]
        ]
      },
      "description": "",
      "source": {
        "label": "DeepSeekMath · 式 (3) / 裁剪与 KL",
        "url": "https://arxiv.org/pdf/2402.03300"
      },
      "subtitle": "负优势下，为什么必须乘完再取最小值？",
      "checkpoint": {
        "question": "如果先取 min(0.5,0.8) 再乘 −1，会得到什么？",
        "answer": "会得到 −0.5，选错分支。正确结果是 min(−0.5,−0.8)=−0.8。"
      }
    },
    {
      "color": "blue",
      "title": "组内同分",
      "visual": {
        "type": "flow",
        "label": "点击「演示机制」逐步观察",
        "steps": [
          "全组同分",
          "中心化",
          "区分退化"
        ],
        "narrations": [
          "四份候选都得 1 分。",
          "减去均值后全为零，标准差也为零。",
          "直接计算 0/0 未定义。实现应显式处理，并追踪同分组比例。"
        ],
        "scenes": [
          [
            {
              "label": "奖励",
              "value": "[1, 1, 1, 1]"
            },
            {
              "label": "组均值",
              "value": "1"
            }
          ],
          [
            {
              "label": "中心化",
              "value": "[0, 0, 0, 0]"
            },
            {
              "label": "标准差",
              "value": "0"
            }
          ],
          [
            {
              "label": "裸归一化",
              "value": "未定义"
            },
            {
              "label": "检查项",
              "value": "方差为零与有限值保护"
            }
          ]
        ]
      },
      "description": "",
      "source": {
        "label": "DeepSeekMath · §4.1.2 / 结果监督",
        "url": "https://arxiv.org/pdf/2402.03300"
      },
      "subtitle": "一组全部同分时，奖励还能提供相对优势吗？",
      "checkpoint": {
        "question": "同分组意味着整个训练目标完全没有梯度吗？",
        "answer": "不一定。这个组的相对奖励没有差异，KL 等独立项和其他组仍可提供信号。"
      }
    }
  ],
  "sources": [
    {
      "label": "DeepSeekMath · §4.1.2 / 结果监督",
      "url": "https://arxiv.org/pdf/2402.03300"
    },
    {
      "label": "DeepSeekMath · 式 (3) / 裁剪与 KL",
      "url": "https://arxiv.org/pdf/2402.03300"
    }
  ]
});
