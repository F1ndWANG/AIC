window.knowledgeTopics ??= [];
window.knowledgeTopics.push({
  "id": "speculative-sampling",
  "title": "投机解码：验收、补分布与加速",
  "subtitle": "从具体输入开始，逐步算到输出。",
  "cards": [
    {
      "color": "cyan",
      "title": "同前缀比较分布",
      "visual": {
        "type": "flow",
        "label": "点击「演示机制」逐步观察",
        "steps": [
          "读草稿",
          "读目标",
          "对齐候选"
        ],
        "narrations": [
          "教学词表只有 A 和 B。给定同一前缀，草稿把 80% 给 A，20% 给 B。",
          "用完全相同的前缀评估目标模型。它把 60% 给 A，40% 给 B。",
          "草稿提出 A，就对齐两个模型的 A 项。80% 是提出 A 的概率，60% 是目标输出 A 的概率。"
        ],
        "scenes": [
          [
            {
              "label": "草稿 A",
              "value": "80%",
              "meter": 80
            },
            {
              "label": "草稿 B",
              "value": "20%",
              "meter": 20
            }
          ],
          [
            {
              "label": "目标 A",
              "value": "60%",
              "meter": 60
            },
            {
              "label": "目标 B",
              "value": "40%",
              "meter": 40
            }
          ],
          [
            {
              "label": "草稿 A",
              "value": "80%",
              "meter": 80
            },
            {
              "label": "目标 A",
              "value": "60%",
              "meter": 60
            }
          ]
        ]
      },
      "description": "",
      "source": {
        "label": "Leviathan 等 · 算法 1 与 §2.3",
        "url": "https://arxiv.org/pdf/2211.17192"
      },
      "subtitle": "为什么要在同一个前缀上比较概率？",
      "checkpoint": {
        "question": "前缀变了，旧概率还能直接沿用吗？",
        "answer": "不能。每个概率都以相应前缀为条件，必须按新前缀重新计算。"
      }
    },
    {
      "color": "purple",
      "title": "验收概率",
      "visual": {
        "type": "flow",
        "label": "点击「演示机制」逐步观察",
        "steps": [
          "取概率",
          "算阈值",
          "比较随机数"
        ],
        "narrations": [
          "同一前缀下，草稿提出 A。记目标概率为 p，草稿概率为 q。",
          "接受率是 min(1,p/q)。A 在草稿里过多，只接受其中 75%。",
          "若均匀随机数为 0.9，超过 0.75，因此拒绝 A。后续草稿基于未接受的前缀，也要丢弃。"
        ],
        "scenes": [
          [
            {
              "label": "目标 p(A)",
              "value": "0.6"
            },
            {
              "label": "草稿 q(A)",
              "value": "0.8"
            }
          ],
          [
            {
              "label": "概率比",
              "value": "0.6 / 0.8"
            },
            {
              "label": "接受率",
              "value": "75%",
              "meter": 75
            }
          ],
          [
            {
              "label": "随机数",
              "value": "0.90"
            },
            {
              "label": "判断",
              "value": "拒绝 A"
            }
          ]
        ]
      },
      "description": "",
      "source": {
        "label": "Leviathan 等 · 算法 1 与 §2.3",
        "url": "https://arxiv.org/pdf/2211.17192"
      },
      "subtitle": "草稿提出 A 后，怎样决定接受还是拒绝？",
      "checkpoint": {
        "question": "如果提议 B，它的接受率是多少？",
        "answer": "100%。p(B)/q(B)=0.4/0.2=2，取 min(1,2)。"
      }
    },
    {
      "color": "amber",
      "title": "拒绝后补分布",
      "visual": {
        "type": "flow",
        "label": "点击「演示机制」逐步观察",
        "steps": [
          "求差",
          "只补不足",
          "归一化"
        ],
        "narrations": [
          "A 在草稿里多了 0.2，B 在草稿里少了 0.2。",
          "把负值置零，留下还需要补的概率质量。",
          "条件是“已拒绝”，把剩余正部除以总和 0.2，结果只会取到 B。"
        ],
        "scenes": [
          [
            {
              "label": "A 的 p−q",
              "value": "−0.2"
            },
            {
              "label": "B 的 p−q",
              "value": "+0.2"
            }
          ],
          [
            {
              "label": "A 的正部",
              "value": "0"
            },
            {
              "label": "B 的正部",
              "value": "0.2"
            }
          ],
          [
            {
              "label": "修正抽 A",
              "value": "0%",
              "meter": 0
            },
            {
              "label": "修正抽 B",
              "value": "100%",
              "meter": 100
            }
          ]
        ]
      },
      "description": "",
      "source": {
        "label": "Leviathan 等 · 算法 1 与 §2.3",
        "url": "https://arxiv.org/pdf/2211.17192"
      },
      "subtitle": "拒绝后为什么要从差值的正部采样？",
      "checkpoint": {
        "question": "拒绝后直接用 p 再采一次会怎样？",
        "answer": "A 已在验收路径贡献 0.6，另有 0.2×0.6 从重采路径流入，总计变成 0.72，超过目标 0.6。"
      }
    },
    {
      "color": "mint",
      "title": "检查输出分布",
      "visual": {
        "type": "flow",
        "label": "点击「演示机制」逐步观察",
        "steps": [
          "验收 A",
          "验收 B",
          "并入修正"
        ],
        "narrations": [
          "以 0.8 的概率提出 A，再以 0.75 接受，验收路径给 A 分配 0.6。",
          "B 被提出的概率为 0.2，且总能接受。两个验收事件合计占 0.8。",
          "剩下 0.2 的拒绝质量全部补给 B。最终 A=0.6，B=0.4。"
        ],
        "scenes": [
          [
            {
              "label": "验收分配给 A",
              "value": "60%",
              "meter": 60
            },
            {
              "label": "验收分配给 B",
              "value": "待算"
            }
          ],
          [
            {
              "label": "验收分配给 A",
              "value": "60%",
              "meter": 60
            },
            {
              "label": "验收分配给 B",
              "value": "20%",
              "meter": 20
            }
          ],
          [
            {
              "label": "最终 A",
              "value": "60%",
              "meter": 60
            },
            {
              "label": "最终 B",
              "value": "40%",
              "meter": 40
            }
          ]
        ]
      },
      "description": "",
      "source": {
        "label": "Leviathan 等 · 算法 1 与 §2.3",
        "url": "https://arxiv.org/pdf/2211.17192"
      },
      "subtitle": "验收和修正怎样加成目标分布？",
      "checkpoint": {
        "question": "某次采样的文本必须与直接解码相同吗？",
        "answer": "不必。这里保证输出分布一致，单次随机采样可以走不同路径。"
      }
    },
    {
      "color": "rose",
      "title": "草稿全通过",
      "visual": {
        "type": "flow",
        "label": "点击「演示机制」逐步观察",
        "steps": [
          "先提出",
          "顺序验收",
          "采额外项"
        ],
        "narrations": [
          "草稿从当前前缀提出三个 Token，顺序为 a、b、c。",
          "目标模型同时得到用于验证的条件分布，再按顺序验收。假设三个都通过且未触发停止。",
          "目标分布也给出了 a、b、c 后下一个位置的概率，因此本轮还能采出 d。"
        ],
        "scenes": [
          [
            {
              "label": "草稿候选",
              "value": "a / b / c"
            },
            {
              "label": "已输出",
              "value": "无"
            }
          ],
          [
            {
              "label": "验收结果",
              "value": "✓ a　✓ b　✓ c"
            },
            {
              "label": "已输出",
              "value": "a / b / c"
            }
          ],
          [
            {
              "label": "额外 Token",
              "value": "d"
            },
            {
              "label": "已输出",
              "value": "4 个"
            }
          ]
        ]
      },
      "description": "",
      "source": {
        "label": "Leviathan 等 · 算法 1 与 §2.3",
        "url": "https://arxiv.org/pdf/2211.17192"
      },
      "subtitle": "三个草稿都通过时，为什么本轮能输出四个 Token？",
      "checkpoint": {
        "question": "如果第二个草稿已经触发 EOS，还会补新 Token 吗？",
        "answer": "不会。EOS 或长度上限生效时，按停止规则结束。"
      }
    },
    {
      "color": "blue",
      "title": "加速条件",
      "visual": {
        "type": "flow",
        "label": "点击「演示机制」逐步观察",
        "steps": [
          "算产出",
          "算时间",
          "对比吞吐"
        ],
        "narrations": [
          "假设各次验收独立且概率恒为 0.8，草稿长度为 3。期望产出是 1+0.8+0.64+0.512。",
          "设目标并行验证仍花 1 个基准单步，三个草稿各花 0.2。",
          "每 1.6 个单步时间产出约 2.952 个 Token，简化加速为 2.952÷1.6。"
        ],
        "scenes": [
          [
            {
              "label": "每轮期望",
              "value": "2.952 Token"
            },
            {
              "label": "基准",
              "value": "1 Token / 单步"
            }
          ],
          [
            {
              "label": "草稿成本",
              "value": "3 × 0.2"
            },
            {
              "label": "每轮成本",
              "value": "1.6 单步"
            }
          ],
          [
            {
              "label": "理论比值",
              "value": "约 1.85 倍"
            },
            {
              "label": "适用范围",
              "value": "教学估算"
            }
          ]
        ]
      },
      "description": "",
      "source": {
        "label": "Leviathan 等 · 式 (1) 与定理 3.8",
        "url": "https://arxiv.org/pdf/2211.17192"
      },
      "subtitle": "理论加速怎样估算，哪些假设影响结论？",
      "checkpoint": {
        "question": "实际测出来一定有 1.85 倍吗？",
        "answer": "不一定。公式使用简化成本与验收模型，服务中的批量、硬件与目标验证成本可能不同。"
      }
    }
  ],
  "sources": [
    {
      "label": "Leviathan 等 · 算法 1 与 §2.3",
      "url": "https://arxiv.org/pdf/2211.17192"
    },
    {
      "label": "Leviathan 等 · 式 (1) 与定理 3.8",
      "url": "https://arxiv.org/pdf/2211.17192"
    }
  ]
});
