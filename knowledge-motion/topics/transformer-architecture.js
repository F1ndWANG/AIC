window.knowledgeTopics ??= [];
window.knowledgeTopics.push({
  "id": "transformer-architecture",
  "title": "Transformer 架构",
  "subtitle": "先手算一个注意力头，再看分组、旋转位置编码与归一化怎样改变计算。",
  "cards": [
    {
      "color": "cyan",
      "title": "Q、K、V 投影",
      "subtitle": "同一个输入怎样得到 Q、K 和 V？",
      "visual": {
        "type": "flow",
        "label": "点击「演示机制」逐步观察",
        "steps": [
          "输入向量",
          "分别投影",
          "区分用途"
        ],
        "narrations": [
          "设某个 Token 的向量是 [2,1]，只演示一个头。",
          "用三套投影参数将同一输入映射到查询、键、值。设 WQ=I，WK 交换两维，WV=2I。",
          "Q 和 K 决定匹配分数，V 是最终按权重相加的内容。"
        ],
        "scenes": [
          [
            {
              "label": "x",
              "value": "[2, 1]"
            },
            {
              "label": "输入维度",
              "value": "2"
            }
          ],
          [
            {
              "label": "Q",
              "value": "[2, 1]"
            },
            {
              "label": "K",
              "value": "[1, 2]"
            },
            {
              "label": "V",
              "value": "[4, 2]"
            }
          ],
          [
            {
              "label": "算权重",
              "value": "Q 与各位置 K"
            },
            {
              "label": "取内容",
              "value": "各位置 V"
            }
          ]
        ]
      },
      "description": "",
      "checkpoint": {
        "question": "如果只替换 V 投影，QKᵀ 的匹配分数会改变吗？",
        "answer": "在当前层、固定输入和 Q/K 投影时，匹配分数不变，汇聚内容会变。"
      },
      "source": {
        "label": "Attention Is All You Need §3",
        "url": "https://arxiv.org/abs/1706.03762"
      }
    },
    {
      "color": "purple",
      "title": "缩放点积注意力",
      "subtitle": "缩放、Softmax 和 V 加权各解决什么？",
      "visual": {
        "type": "flow",
        "label": "点击「演示机制」逐步观察",
        "steps": [
          "算匹配分数",
          "缩放并归一化",
          "汇聚值"
        ],
        "narrations": [
          "给定 q=[2,0]，k₁=[1,0]，k₂=[0,1]。内积分别为 2 和 0。",
          "键维度为 2，除以 √2 后得 [√2,0]。Softmax 后约为 [0.804,0.196]。",
          "为了方便手算，取两个位置的标量值为 10 和 0，结果约 8.04。"
        ],
        "scenes": [
          [
            {
              "label": "q·k₁",
              "value": "2"
            },
            {
              "label": "q·k₂",
              "value": "0"
            }
          ],
          [
            {
              "label": "位置 1",
              "value": "80.4%",
              "meter": 80.4
            },
            {
              "label": "位置 2",
              "value": "19.6%",
              "meter": 19.6
            }
          ],
          [
            {
              "label": "输出",
              "value": "0.804×10 + 0.196×0 ≈ 8.04"
            }
          ]
        ]
      },
      "description": "",
      "checkpoint": {
        "question": "如果两个未掩码分数相同，权重各是多少？",
        "answer": "各为 1/2。Softmax 把相同分数映射成相同的归一化权重。"
      },
      "source": {
        "label": "Attention Is All You Need §3",
        "url": "https://arxiv.org/abs/1706.03762"
      }
    },
    {
      "color": "amber",
      "title": "因果掩码",
      "subtitle": "因果掩码怎样保证第 2 个位置看不到第 3 个？",
      "visual": {
        "type": "flow",
        "label": "点击「演示机制」逐步观察",
        "steps": [
          "读入分数",
          "遮住未来",
          "归一化并聚合"
        ],
        "narrations": [
          "设查询位置是 2，其对三个键的缩放分数分别是 [0,0,4]。",
          "在 Softmax 之前把第 3 个位置的分数置为 −∞。",
          "权重变成 [0.5,0.5,0]。若 V 为 [2,8,20]，输出是 0.5×2+0.5×8=5。"
        ],
        "scenes": [
          [
            {
              "label": "位置 1",
              "value": "0"
            },
            {
              "label": "位置 2",
              "value": "0"
            },
            {
              "label": "位置 3",
              "value": "4"
            }
          ],
          [
            {
              "label": "位置 1",
              "value": "0"
            },
            {
              "label": "位置 2",
              "value": "0"
            },
            {
              "label": "位置 3",
              "value": "−∞"
            }
          ],
          [
            {
              "label": "位置 1",
              "value": "50%",
              "meter": 50.0
            },
            {
              "label": "位置 2",
              "value": "50%",
              "meter": 50.0
            },
            {
              "label": "位置 3",
              "value": "0%",
              "meter": 0.0
            },
            {
              "label": "输出",
              "value": "5"
            }
          ]
        ]
      },
      "description": "",
      "checkpoint": {
        "question": "在这个第 2 个位置，如果未来的 V 从 20 改为 200，输出会变吗？",
        "answer": "不会。未来位置被掩码后权重为零。"
      },
      "source": {
        "label": "Attention Is All You Need §3",
        "url": "https://arxiv.org/abs/1706.03762"
      }
    },
    {
      "color": "mint",
      "title": "多头与 GQA",
      "subtitle": "GQA 共享 KV 后，不同查询头还能关注不同位置吗？",
      "visual": {
        "type": "flow",
        "label": "点击「演示机制」逐步观察",
        "steps": [
          "先看多头",
          "改成分组",
          "区分共享与权重"
        ],
        "narrations": [
          "在教学 MHA 配置中，8 个查询头各对应一个 KV 头。",
          "GQA 用 2 组，每组 4 个查询头共享同组的 K 与 V。",
          "同组查询头各有自己的 Q，因此即使使用相同的 K、V，仍可得到不同的注意力权重。"
        ],
        "scenes": [
          [
            {
              "label": "查询头",
              "value": "8"
            },
            {
              "label": "KV 头",
              "value": "8"
            }
          ],
          [
            {
              "label": "查询头",
              "value": "8"
            },
            {
              "label": "KV 头",
              "value": "2"
            },
            {
              "label": "组内查询头",
              "value": "4"
            }
          ],
          [
            {
              "label": "共享",
              "value": "K 与 V"
            },
            {
              "label": "分别计算",
              "value": "每个 Q 的匹配与权重"
            }
          ]
        ]
      },
      "description": "",
      "checkpoint": {
        "question": "把查询头数固定为 8，KV 头从 8 降为 2，理想 KV 张量载荷是多少？",
        "answer": "原来的 1/4。前提是保存共享后的 2 个 KV 头，且层数、头维、缓存长度与精度相同。"
      },
      "source": {
        "label": "GQA 原论文",
        "url": "https://arxiv.org/abs/2305.13245"
      }
    },
    {
      "color": "rose",
      "title": "位置编码与 RoPE",
      "subtitle": "RoPE 为什么能让内积体现相对位置？",
      "visual": {
        "type": "flow",
        "label": "点击「演示机制」逐步观察",
        "steps": [
          "用二维例子",
          "分开旋转",
          "一起平移"
        ],
        "narrations": [
          "设未旋转的 q=k=[1,0]，为减少计算，教学例设每步旋转 90°。",
          "把 Q 放在位置 0，K 放在位置 1。旋转后分别为 [1,0] 和 [0,1]，内积为 0。",
          "把两者同时后移一格，变成 [0,1] 和 [−1,0]，内积仍为 0。"
        ],
        "scenes": [
          [
            {
              "label": "内容向量",
              "value": "[1, 0]"
            },
            {
              "label": "每步角度",
              "value": "90°"
            }
          ],
          [
            {
              "label": "位置差",
              "value": "1"
            },
            {
              "label": "旋转后内积",
              "value": "0"
            }
          ],
          [
            {
              "label": "位置差",
              "value": "仍为 1"
            },
            {
              "label": "旋转后内积",
              "value": "仍为 0"
            }
          ]
        ]
      },
      "description": "",
      "checkpoint": {
        "question": "如果只把 K 的位置往后移一格，Q 保持不变，内积一定不变吗？",
        "answer": "不一定。相对位置改变，旋转角差也改变。"
      },
      "source": {
        "label": "RoFormer §3.2",
        "url": "https://arxiv.org/abs/2104.09864"
      }
    },
    {
      "color": "blue",
      "title": "残差、归一化与 FFN",
      "subtitle": "Pre-LN 和 Post-LN 到底在哪一步归一化？",
      "visual": {
        "type": "flow",
        "label": "点击「演示机制」逐步观察",
        "steps": [
          "后归一化",
          "前归一化",
          "看差别"
        ],
        "narrations": [
          "以一个子层 f 为例，原始 Transformer 的残差相加后再归一化。",
          "预归一化先给子层输入做 LN，再把子层输出加回原输入。",
          "在 Pre-LN 这个子层里，x 可沿直接相加路径到达子层输出；Post-LN 则对相加结果做 LN。"
        ],
        "scenes": [
          [
            {
              "label": "Post-LN",
              "value": "LN(x + f(x))"
            }
          ],
          [
            {
              "label": "Pre-LN",
              "value": "x + f(LN(x))"
            }
          ],
          [
            {
              "label": "Pre-LN 的 LN 位置",
              "value": "子层输入"
            },
            {
              "label": "Post-LN 的 LN 位置",
              "value": "残差相加之后"
            }
          ]
        ]
      },
      "description": "",
      "checkpoint": {
        "question": "两者的 FFN 都会直接对所有 Token 进行混合吗？",
        "answer": "不会。标准 Transformer 的位置前馈网络分别处理每个位置，跨位置的汇聚由注意力完成。"
      },
      "source": {
        "label": "On Layer Normalization in the Transformer Architecture",
        "url": "https://arxiv.org/abs/2002.04745"
      }
    }
  ],
  "sources": [
    {
      "label": "Attention Is All You Need §3",
      "url": "https://arxiv.org/abs/1706.03762"
    },
    {
      "label": "GQA 原论文",
      "url": "https://arxiv.org/abs/2305.13245"
    },
    {
      "label": "RoFormer §3.2",
      "url": "https://arxiv.org/abs/2104.09864"
    },
    {
      "label": "On Layer Normalization in the Transformer Architecture",
      "url": "https://arxiv.org/abs/2002.04745"
    }
  ]
});
