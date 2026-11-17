window.knowledgeTopics ??= [];
window.knowledgeTopics.push({
  "id": "dpo-calculations",
  "title": "DPO 损失与偏好信号实算",
  "subtitle": "同一对回答，从偏好标注算到 DPO 损失，再检验标签和长度偏差。",
  "cards": [
    {
      "color": "cyan",
      "title": "同题构造偏好对",
      "visual": {
        "type": "flow",
        "label": "点击「演示机制」逐步观察",
        "steps": [
          "固定题目",
          "标注偏好",
          "确定求和位置"
        ],
        "narrations": [
          "采用一个教学提示“2+2 等于多少？”。A 回答“等于 4”，B 回答“等于 5”。",
          "按正确性把 A 标为 chosen，B 标为 rejected。",
          "提示用于提供条件，求序列 log 概率时只对回答 Token 的条件 log 概率求和。"
        ],
        "scenes": [
          [
            {
              "label": "提示",
              "value": "2+2 等于多少？"
            },
            {
              "label": "A",
              "value": "等于 4"
            },
            {
              "label": "B",
              "value": "等于 5"
            }
          ],
          [
            {
              "label": "提示",
              "value": "2+2 等于多少？"
            },
            {
              "label": "chosen",
              "value": "A"
            },
            {
              "label": "rejected",
              "value": "B"
            }
          ],
          [
            {
              "label": "上下文",
              "value": "同一提示"
            },
            {
              "label": "计分范围",
              "value": "回答 Token"
            }
          ]
        ]
      },
      "description": "",
      "subtitle": "为什么一条偏好样本要固定同一个提示？",
      "checkpoint": {
        "question": "如果两份回答来自不同题目，可以直接用作这一条 DPO 偏好对吗？",
        "answer": "不能。两份回答的概率及偏好比较都应条件化在同一提示上。"
      },
      "source": {
        "label": "DPO 原论文 §4 · 式 (7)",
        "url": "https://arxiv.org/pdf/2305.18290"
      }
    },
    {
      "color": "purple",
      "title": "当前策略差值",
      "visual": {
        "type": "flow",
        "label": "点击「演示机制」逐步观察",
        "steps": [
          "读 Token 分数",
          "分别求和",
          "算偏好差值"
        ],
        "narrations": [
          "为便于手算，将两份回答都简化为两个计分位置。数值是教学设定，不是实际模型输出。",
          "按自回归分解，把每个回答的条件 log 概率相加。每个 Token 以提示和它前面的回答 Token 为条件。",
          "用 chosen 的总分减 rejected 的总分。差值为正，说明当前策略在同题下更偏向 A。"
        ],
        "scenes": [
          [
            {
              "label": "A 的 log 概率",
              "value": "−0.7，−1.3"
            },
            {
              "label": "B 的 log 概率",
              "value": "−1.5，−2.5"
            }
          ],
          [
            {
              "label": "A 的总分",
              "value": "−0.7−1.3=−2"
            },
            {
              "label": "B 的总分",
              "value": "−1.5−2.5=−4"
            }
          ],
          [
            {
              "label": "当前差值",
              "value": "−2−(−4)=+2"
            }
          ]
        ]
      },
      "description": "",
      "subtitle": "怎样把逐 Token 的 log 概率变成回答差值？",
      "checkpoint": {
        "question": "若 B 的总 log 概率从 −4 变为 −3，A 不变，差值是多少？",
        "answer": "变成 +1。当前策略依然更偏向 A，但相对差距减少。"
      },
      "source": {
        "label": "DPO 原论文 §4 · 式 (7)",
        "url": "https://arxiv.org/pdf/2305.18290"
      }
    },
    {
      "color": "amber",
      "title": "参考策略校正",
      "visual": {
        "type": "flow",
        "label": "点击「演示机制」逐步观察",
        "steps": [
          "读取当前差值",
          "算参考差值",
          "减参考并缩放"
        ],
        "narrations": [
          "当前策略在同一个提示下给 A、B 的总 log 概率分别为 −2 和 −4。",
          "冻结的参考模型给同两份回答打分 −3、−4，参考差值为 +1。",
          "先算 2−1，再乘这里取 1 的 β，得到 logit=1。"
        ],
        "scenes": [
          [
            {
              "label": "当前 Δ",
              "value": "+2"
            }
          ],
          [
            {
              "label": "当前 Δ",
              "value": "+2"
            },
            {
              "label": "参考 Δ",
              "value": "+1"
            }
          ],
          [
            {
              "label": "当前 Δ",
              "value": "+2"
            },
            {
              "label": "参考 Δ",
              "value": "+1"
            },
            {
              "label": "DPO logit",
              "value": "+1"
            }
          ]
        ]
      },
      "description": "",
      "subtitle": "为什么还要减去参考模型的偏好差值？",
      "checkpoint": {
        "question": "如果参考模型的差值是 +3，当前仍为 +2，β=1，logit 是多少？",
        "answer": "−1。当前模型仍给 A 更高概率，但比参考模型对 A 的相对偏好弱。"
      },
      "source": {
        "label": "DPO 原论文 §4 · 式 (7)",
        "url": "https://arxiv.org/pdf/2305.18290"
      }
    },
    {
      "color": "mint",
      "title": "Sigmoid 与损失",
      "visual": {
        "type": "flow",
        "label": "点击「演示机制」逐步观察",
        "steps": [
          "输入 logit",
          "映射偏好概率",
          "取负对数"
        ],
        "narrations": [
          "同题偏好对的校正 logit z=1。",
          "按 DPO 目标用 sigmoid(z)=1/(1+exp(−z))，当前标注方向的预测概率约为 0.731。",
          "对这个偏好标签计算 −ln(0.731)，得到约 0.313。这里是单样本损失。"
        ],
        "scenes": [
          [
            {
              "label": "z",
              "value": "+1"
            }
          ],
          [
            {
              "label": "z",
              "value": "+1"
            },
            {
              "label": "偏好概率",
              "value": "约 73.1%",
              "meter": 73.1
            }
          ],
          [
            {
              "label": "偏好概率",
              "value": "约 73.1%",
              "meter": 73.1
            },
            {
              "label": "DPO 损失",
              "value": "约 0.313"
            }
          ]
        ]
      },
      "description": "",
      "subtitle": "logit 为 1 时，单样本损失是多少？",
      "checkpoint": {
        "question": "若校正后的 logit 为 0，损失是多少？",
        "answer": "−ln(0.5)=ln 2≈0.693。"
      },
      "source": {
        "label": "DPO 原论文 §4 · 式 (7)",
        "url": "https://arxiv.org/pdf/2305.18290"
      }
    },
    {
      "color": "rose",
      "title": "偏好写反",
      "visual": {
        "type": "flow",
        "label": "点击「演示机制」逐步观察",
        "steps": [
          "保留原标签",
          "交换标签",
          "比较损失"
        ],
        "narrations": [
          "A 是 chosen，B 是 rejected，训练前先测当前损失。",
          "保持两个模型的概率不变，只交换 chosen 和 rejected。当前差值和参考差值都会反号。",
          "将 −1 代回损失函数，得到约 1.313。差别来自偏好标签的方向。"
        ],
        "scenes": [
          [
            {
              "label": "chosen",
              "value": "A"
            },
            {
              "label": "logit",
              "value": "+1"
            },
            {
              "label": "损失",
              "value": "约 0.313"
            }
          ],
          [
            {
              "label": "chosen",
              "value": "B"
            },
            {
              "label": "logit",
              "value": "−1"
            },
            {
              "label": "偏好概率",
              "value": "约 26.9%",
              "meter": 26.9
            }
          ],
          [
            {
              "label": "chosen",
              "value": "B"
            },
            {
              "label": "logit",
              "value": "−1"
            },
            {
              "label": "损失",
              "value": "约 1.313"
            }
          ]
        ]
      },
      "description": "",
      "subtitle": "交换 chosen 和 rejected 后，损失为什么升高？",
      "checkpoint": {
        "question": "如果原 logit 是 0，交换标签后损失会升高吗？",
        "answer": "不会。交换后还是 0，两种方向的 sigmoid 都是 0.5。"
      },
      "source": {
        "label": "DPO 原论文 §4 · 式 (7)",
        "url": "https://arxiv.org/pdf/2305.18290"
      }
    },
    {
      "color": "blue",
      "title": "长度偏差检查",
      "visual": {
        "type": "flow",
        "label": "点击「演示机制」逐步观察",
        "steps": [
          "发现数据偏差",
          "做匹配对照",
          "分开汇报"
        ],
        "narrations": [
          "另一个教学数据集里，100 对回答有 80 对 chosen 更长。",
          "在留出数据里挑长度相近、题型相同的样本，使用独立质量标注。",
          "分别报告两组表现和样本数。比较差距，排查长度、题型及难度的共同影响。"
        ],
        "scenes": [
          [
            {
              "label": "chosen 更长",
              "value": "80 / 100",
              "meter": 80.0
            },
            {
              "label": "结论",
              "value": "存在相关性"
            }
          ],
          [
            {
              "label": "比较分组",
              "value": "原分布 / 长度匹配"
            },
            {
              "label": "验收标准",
              "value": "独立正确性或质量标注"
            }
          ],
          [
            {
              "label": "检查项",
              "value": "对照质量和样本数"
            },
            {
              "label": "结论",
              "value": "相关性需要控制变量"
            }
          ]
        ]
      },
      "description": "",
      "subtitle": "怎样检查把回答长度当成质量的风险？",
      "checkpoint": {
        "question": "长度匹配后性能下降，就能证明模型只学到了长度吗？",
        "answer": "不能。这个结果提示长度可能是混杂因素，还应核对题型、难度和标注分布。"
      },
      "source": {
        "label": "ACL Findings 2024 · DPO 长度偏差",
        "url": "https://aclanthology.org/2024.findings-acl.297/"
      }
    }
  ],
  "sources": [
    {
      "label": "DPO 原论文 §4 · 式 (7)",
      "url": "https://arxiv.org/pdf/2305.18290"
    }
  ]
});
