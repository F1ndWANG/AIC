window.knowledgeTopics ??= [];
window.knowledgeTopics.push({
  "id": "rrf-ranking",
  "title": "RRF 实算：两路召回到一个排序",
  "subtitle": "从具体输入开始，逐步算到输出。",
  "cards": [
    {
      "color": "cyan",
      "title": "为什么先看排名",
      "visual": {
        "type": "flow",
        "label": "点击「演示机制」逐步观察",
        "steps": [
          "看原分数",
          "各路排序",
          "传给融合"
        ],
        "narrations": [
          "词法分数和向量分数来自不同计算，12 和 0.82 无法直接比较。",
          "在每路内部按分数降序得到排名。",
          "后续只需要文档 ID 和路内名次。"
        ],
        "scenes": [
          [
            {
              "label": "词法",
              "value": "A: 12，B: 8"
            },
            {
              "label": "向量",
              "value": "B: 0.82，C: 0.70"
            }
          ],
          [
            {
              "label": "词法",
              "value": "① A　② B"
            },
            {
              "label": "向量",
              "value": "① B　② C"
            }
          ],
          [
            {
              "label": "融合输入",
              "value": "两路名次"
            },
            {
              "label": "不使用",
              "value": "跨系统的原始分数大小"
            }
          ]
        ]
      },
      "description": "",
      "source": {
        "label": "Cormack 等 · §2 / RRF 公式",
        "url": "https://cormack.uwaterloo.ca/cormack/cormacksigir09-rrf.pdf"
      },
      "subtitle": "词法与向量分数的刻度不同，怎样对齐？",
      "checkpoint": {
        "question": "把向量分数都乘 100，RRF 会变化吗？",
        "answer": "如果排序及同分规则保持不变，RRF 不变，因为它只读排名。"
      }
    },
    {
      "color": "purple",
      "title": "单路贡献",
      "visual": {
        "type": "flow",
        "label": "点击「演示机制」逐步观察",
        "steps": [
          "输入名次",
          "代入第一名",
          "代入第二名"
        ],
        "narrations": [
          "RRF 把排名 r 变成贡献 1/(k+r)。本例取 k=60。",
          "第一名的分母为 61。",
          "第二名的分母为 62，贡献略小。"
        ],
        "scenes": [
          [
            {
              "label": "r",
              "value": "1 或 2"
            },
            {
              "label": "k",
              "value": "60"
            }
          ],
          [
            {
              "label": "第 1 名",
              "value": "1 / 61"
            },
            {
              "label": "贡献",
              "value": "约 0.01639"
            }
          ],
          [
            {
              "label": "第 2 名",
              "value": "1 / 62"
            },
            {
              "label": "贡献",
              "value": "约 0.01613"
            }
          ]
        ]
      },
      "description": "",
      "source": {
        "label": "Cormack 等 · §3 / 实验与 k 的取值",
        "url": "https://cormack.uwaterloo.ca/cormack/cormacksigir09-rrf.pdf"
      },
      "subtitle": "一路第 1 名和第 2 名分别贡献多少？",
      "checkpoint": {
        "question": "k=60 时，第 3 名的贡献是多少？",
        "answer": "1/63，约 0.01587。名次从 1 开始。"
      }
    },
    {
      "color": "amber",
      "title": "两路贡献求和",
      "visual": {
        "type": "flow",
        "label": "点击「演示机制」逐步观察",
        "steps": [
          "对齐文档",
          "逐路加分",
          "合并排序"
        ],
        "narrations": [
          "词法返回 A、B；向量返回 B、C。缺席某路的文档在本截断列表例中不计该路。",
          "A 只有 1/61，C 只有 1/62。B 同时得到 1/62 和 1/61。",
          "B 的两项加总最大，因此排首位。"
        ],
        "scenes": [
          [
            {
              "label": "词法",
              "value": "① A　② B"
            },
            {
              "label": "向量",
              "value": "① B　② C"
            }
          ],
          [
            {
              "label": "A",
              "value": "约 0.01639"
            },
            {
              "label": "B",
              "value": "约 0.03252"
            },
            {
              "label": "C",
              "value": "约 0.01613"
            }
          ],
          [
            {
              "label": "最终排序",
              "value": "B → A → C"
            },
            {
              "label": "假设",
              "value": "缺席路记 0"
            }
          ]
        ]
      },
      "description": "",
      "source": {
        "label": "Cormack 等 · §2 / RRF 公式",
        "url": "https://cormack.uwaterloo.ca/cormack/cormacksigir09-rrf.pdf"
      },
      "subtitle": "为什么 B 能超过两路各自的单路高分项？",
      "checkpoint": {
        "question": "若 B 只留在词法第 2 名，它还能排在 A 前面吗？",
        "answer": "本例不能。只剩 1/62，小于 A 的 1/61。"
      }
    },
    {
      "color": "mint",
      "title": "k 如何改变差距",
      "visual": {
        "type": "flow",
        "label": "点击「演示机制」逐步观察",
        "steps": [
          "比较小 k",
          "比较大 k",
          "解释作用"
        ],
        "narrations": [
          "取 k=1 时，第一名 1/2，第二名 1/3。",
          "取 k=60 时，第一名 1/61，第二名 1/62。",
          "同一路的排名位置差异变小。跨路重复出现的文档可能更容易受益。"
        ],
        "scenes": [
          [
            {
              "label": "第 1 / 第 2",
              "value": "0.500 / 0.333"
            },
            {
              "label": "绝对差",
              "value": "约 0.167"
            }
          ],
          [
            {
              "label": "第 1 / 第 2",
              "value": "0.01639 / 0.01613"
            },
            {
              "label": "绝对差",
              "value": "约 0.00026"
            }
          ],
          [
            {
              "label": "第 1 对第 2 的比例",
              "value": "1.5 → 约 1.016"
            },
            {
              "label": "质量判断",
              "value": "用任务数据验证"
            }
          ]
        ]
      },
      "description": "",
      "source": {
        "label": "Cormack 等 · §3 / 实验与 k 的取值",
        "url": "https://cormack.uwaterloo.ca/cormack/cormacksigir09-rrf.pdf"
      },
      "subtitle": "k 变大后，名次差异为什么没那么明显？",
      "checkpoint": {
        "question": "增大 k 能保证检索质量变好吗？",
        "answer": "不能。它调节相邻名次贡献差异，需要在开发集上验证检索质量。"
      }
    },
    {
      "color": "rose",
      "title": "召回窗口的边界",
      "visual": {
        "type": "flow",
        "label": "点击「演示机制」逐步观察",
        "steps": [
          "看路内结果",
          "截断",
          "扩大窗口"
        ],
        "narrations": [
          "向量检索前三为 B、C、D。假设 D 在另一路也未出现。",
          "融合仅看到 B 和 C。D 没有任何已返回贡献。",
          "窗口扩大到 3 后，D 才获向量路的 1/(k+3)。"
        ],
        "scenes": [
          [
            {
              "label": "路内候选",
              "value": "① B　② C　③ D"
            },
            {
              "label": "当前窗口",
              "value": "2"
            }
          ],
          [
            {
              "label": "进入融合",
              "value": "B、C"
            },
            {
              "label": "D",
              "value": "未纳入"
            }
          ],
          [
            {
              "label": "进入融合",
              "value": "B、C、D"
            },
            {
              "label": "D 的贡献",
              "value": "1 / 63（k=60）"
            }
          ]
        ]
      },
      "description": "",
      "source": {
        "label": "Cormack 等 · §2 / RRF 公式",
        "url": "https://cormack.uwaterloo.ca/cormack/cormacksigir09-rrf.pdf"
      },
      "subtitle": "为什么扩大召回窗口会改变融合候选？",
      "checkpoint": {
        "question": "把最终展示的条数从 2 改为 3，就一定能找回 D 吗？",
        "answer": "不一定。若召回窗口仍为 2，D 没进入融合输入，增加展示条数也找不回来。"
      }
    },
    {
      "color": "blue",
      "title": "融合、重排和证据",
      "visual": {
        "type": "flow",
        "label": "点击「演示机制」逐步观察",
        "steps": [
          "获得候选",
          "核查适用",
          "形成答复"
        ],
        "narrations": [
          "B 排在第一，但它是历史政策。",
          "用户问当前规则，必须验证日期和适用对象。",
          "从合格候选里引用当前有效条款。如果没有，说明证据不足。"
        ],
        "scenes": [
          [
            {
              "label": "融合排序",
              "value": "B 第一"
            },
            {
              "label": "政策状态",
              "value": "过期"
            }
          ],
          [
            {
              "label": "问题",
              "value": "今天适用哪条？"
            },
            {
              "label": "B",
              "value": "不符合时效"
            }
          ],
          [
            {
              "label": "可用证据",
              "value": "需符合生效条件"
            },
            {
              "label": "验收",
              "value": "原文支持答复"
            }
          ]
        ]
      },
      "description": "",
      "source": {
        "label": "Cormack 等 · §2 / RRF 公式",
        "url": "https://cormack.uwaterloo.ca/cormack/cormacksigir09-rrf.pdf"
      },
      "subtitle": "融合第一为什么仍需要查证据？",
      "checkpoint": {
        "question": "“RRF 第一”能直接当作回答正确的证据吗？",
        "answer": "不能。排序信号与事实支持是两件事，还应核对时效、范围和原文。"
      }
    }
  ],
  "sources": [
    {
      "label": "Cormack 等 · §2 / RRF 公式",
      "url": "https://cormack.uwaterloo.ca/cormack/cormacksigir09-rrf.pdf"
    },
    {
      "label": "Cormack 等 · §3 / 实验与 k 的取值",
      "url": "https://cormack.uwaterloo.ca/cormack/cormacksigir09-rrf.pdf"
    }
  ]
});
