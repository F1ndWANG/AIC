window.knowledgeTopics ??= [];
window.knowledgeTopics.push({
  "id": "rag",
  "title": "RAG 检索增强生成",
  "subtitle": "用虚构的退款政策库，跟踪同一个问题从文档切分走到引用和缺证据测试。",
  "cards": [
    {
      "color": "cyan",
      "title": "文档切分",
      "subtitle": "怎么切分一份带适用条件的政策？",
      "visual": {
        "type": "flow",
        "label": "点击「演示机制」逐步观察",
        "steps": [
          "读原文",
          "切分条款",
          "保留定位字段"
        ],
        "narrations": [
          "教学库有设备政策 v1、v2 和数字商品政策。v2 自 2025-04-01 生效，未拆封设备签收后 7 天内可申请。",
          "按条款边界切块。把“未拆封设备”“签收后”和“7 天”留在同一块，避免数字脱离条件。",
          "将版本、生效日期和节号随片段一起保存，生成时可以把证据追溯到原文。"
        ],
        "scenes": [
          [
            {
              "label": "设备 v2 §2",
              "value": "未拆封 / 签收起 7 天"
            },
            {
              "label": "数字商品",
              "value": "另见 §4"
            }
          ],
          [
            {
              "label": "片段 A",
              "value": "设备 v2 §2"
            },
            {
              "label": "关联片段",
              "value": "数字商品 §4"
            }
          ],
          [
            {
              "label": "证据 ID",
              "value": "A"
            },
            {
              "label": "版本",
              "value": "设备 v2"
            },
            {
              "label": "生效",
              "value": "2025-04-01"
            },
            {
              "label": "节号",
              "value": "§2"
            }
          ]
        ]
      },
      "description": "",
      "checkpoint": {
        "question": "如果片段只剩“7 天内”，可以回答数字商品也能退款吗？",
        "answer": "不能。这段文字缺少适用对象和例外条件，应该回查邻接段落或原文。"
      },
      "source": {
        "label": "RAG 原论文 · 检索与生成",
        "url": "https://arxiv.org/abs/2005.11401"
      }
    },
    {
      "color": "purple",
      "title": "建立索引",
      "subtitle": "索引存的是怎样的东西？",
      "visual": {
        "type": "flow",
        "label": "点击「演示机制」逐步观察",
        "steps": [
          "取待索引片段",
          "编码",
          "写入并映射"
        ],
        "narrations": [
          "A 是设备 v2，B 是设备 v1，C 是数字商品规则。",
          "用演示用二维向量代替实际编码器输出。用内积举例，数值不代表真实检索系统。",
          "索引用向量排序，文档存储用 ID 找回原文和时效字段。"
        ],
        "scenes": [
          [
            {
              "label": "A",
              "value": "新版设备政策"
            },
            {
              "label": "B",
              "value": "旧版设备政策"
            },
            {
              "label": "C",
              "value": "数字商品政策"
            }
          ],
          [
            {
              "label": "A",
              "value": "[1,1]"
            },
            {
              "label": "B",
              "value": "[2,1]"
            },
            {
              "label": "C",
              "value": "[0,1]"
            }
          ],
          [
            {
              "label": "向量索引",
              "value": "向量 → ID"
            },
            {
              "label": "文档存储",
              "value": "ID → 原文与元数据"
            }
          ]
        ]
      },
      "description": "",
      "checkpoint": {
        "question": "只保存向量而丢掉原文和片段 ID，能生成可回查的引用吗？",
        "answer": "不能。向量可用来找相似项，生成与引用还需要取回可核验原文。"
      },
      "source": {
        "label": "DPR 原论文 · 双编码器与内积检索",
        "url": "https://arxiv.org/abs/2004.04906"
      }
    },
    {
      "color": "amber",
      "title": "候选召回",
      "subtitle": "为什么旧政策可能先被召回？",
      "visual": {
        "type": "flow",
        "label": "点击「演示机制」逐步观察",
        "steps": [
          "编码问题",
          "算内积",
          "取 Top-2"
        ],
        "narrations": [
          "用户问“2025 年 5 月，未拆封设备签收后多久可申请退款？”。用教学查询向量 q=[1,1]。",
          "用 q 和三个文档向量求内积。排序分数只反映本例的相似信号。",
          "按照相似分数取 B、A。尽管 B 排第一，5 月应适用的是新版规则 A。"
        ],
        "scenes": [
          [
            {
              "label": "查询向量",
              "value": "[1,1]"
            },
            {
              "label": "目标证据",
              "value": "设备 v2 §2"
            }
          ],
          [
            {
              "label": "A",
              "value": "1×1+1×1=2"
            },
            {
              "label": "B",
              "value": "1×2+1×1=3"
            },
            {
              "label": "C",
              "value": "1×0+1×1=1"
            }
          ],
          [
            {
              "label": "候选排序",
              "value": "B → A"
            },
            {
              "label": "正确证据 A",
              "value": "已进入候选"
            }
          ]
        ]
      },
      "description": "",
      "checkpoint": {
        "question": "如果只取 Top-1，后面的重排还能选到 A 吗？",
        "answer": "不能。此例 Top-1 只有 B，重排不能凭空补出 A。可扩大召回范围，或在检索阶段加入版本过滤。"
      },
      "source": {
        "label": "DPR 原论文 · 双编码器与内积检索",
        "url": "https://arxiv.org/abs/2004.04906"
      }
    },
    {
      "color": "mint",
      "title": "重排与筛选",
      "subtitle": "相似度最高为什么不等于可作答证据？",
      "visual": {
        "type": "flow",
        "label": "点击「演示机制」逐步观察",
        "steps": [
          "读候选",
          "检查适用性",
          "选证据"
        ],
        "narrations": [
          "B 和 A 都涉及设备退款。B 更相似，但它的规则是旧版 14 天。",
          "对照问询日期和适用对象。教学规则明确 v2 自 4 月 1 日替换 v1。",
          "筛选后只把 A 的相关条款传给生成器。这个例子用显式时效规则，工程上还可接语义重排。"
        ],
        "scenes": [
          [
            {
              "label": "B",
              "value": "旧版，14 天"
            },
            {
              "label": "A",
              "value": "新版，7 天"
            }
          ],
          [
            {
              "label": "B",
              "value": "5 月已失效"
            },
            {
              "label": "A",
              "value": "5 月适用"
            }
          ],
          [
            {
              "label": "可作答证据",
              "value": "A"
            },
            {
              "label": "排除",
              "value": "B"
            }
          ]
        ]
      },
      "description": "",
      "checkpoint": {
        "question": "如果 A 没进入候选，B 能因分数高被保留作当前证据吗？",
        "answer": "不能。要重新检索适用版本，找不到时应说明证据不足。"
      },
      "source": {
        "label": "RAG 原论文 · 检索与生成",
        "url": "https://arxiv.org/abs/2005.11401"
      }
    },
    {
      "color": "rose",
      "title": "生成与引用",
      "subtitle": "怎样写出证据能支持的答案？",
      "visual": {
        "type": "flow",
        "label": "点击「演示机制」逐步观察",
        "steps": [
          "组织输入",
          "生成带范围的结论",
          "核对引用"
        ],
        "narrations": [
          "将问题、A 的原文及定位字段交给生成器。",
          "回答“依据 2025-04-01 起生效的设备政策，未拆封设备可在签收后 7 天内申请退款”。",
          "将关键结论回链到真实使用的片段。核对版本、节号和引用覆盖。"
        ],
        "scenes": [
          [
            {
              "label": "输入",
              "value": "问题 + A 片段"
            },
            {
              "label": "必须保留",
              "value": "未拆封、签收后"
            }
          ],
          [
            {
              "label": "适用对象",
              "value": "未拆封设备"
            },
            {
              "label": "期限",
              "value": "签收后 7 天"
            }
          ],
          [
            {
              "label": "引用",
              "value": "设备政策 v2 §2（A）"
            },
            {
              "label": "核查",
              "value": "期限与条件都在原文"
            }
          ]
        ]
      },
      "description": "",
      "checkpoint": {
        "question": "能把“未拆封设备”省成“所有商品”吗？",
        "answer": "不能。适用对象被扩大了，原文没有支持“所有商品”。"
      },
      "source": {
        "label": "RAG 原论文 · 检索与生成",
        "url": "https://arxiv.org/abs/2005.11401"
      }
    },
    {
      "color": "blue",
      "title": "评估与拒答",
      "subtitle": "证据缺失和答错如何区分？",
      "visual": {
        "type": "flow",
        "label": "点击「演示机制」逐步观察",
        "steps": [
          "查召回",
          "查答案",
          "做缺证据对照"
        ],
        "narrations": [
          "本题有一条标注的有效证据 A。Top-2 为 [B,A]，因此本题 Recall@2=1/1。",
          "复核答案里的日期、商品状态和 7 天是否都能由 A 支持。召回命中与答复忠实分开验收。",
          "从库中移除 A 重跑，用于验证拒答策略。只剩过期 B，就说明无法找到当前规则，可建议补查。"
        ],
        "scenes": [
          [
            {
              "label": "应召回",
              "value": "A"
            },
            {
              "label": "实际召回",
              "value": "B、A"
            },
            {
              "label": "Recall@2",
              "value": "100%",
              "meter": 100.0
            }
          ],
          [
            {
              "label": "检索",
              "value": "A 已命中"
            },
            {
              "label": "答复",
              "value": "分别核验事实和引用"
            }
          ],
          [
            {
              "label": "当前有效证据",
              "value": "无"
            },
            {
              "label": "输出",
              "value": "无法确认当前退款期限"
            }
          ]
        ]
      },
      "description": "",
      "checkpoint": {
        "question": "A 已进入候选，最终答成 14 天。还可以说只是召回失败吗？",
        "answer": "不能。应继续排查筛选、上下文组装与生成是否用了旧证据，不能仅据结果归咎于召回。"
      },
      "source": {
        "label": "ARES · 检索相关性与答案忠实度",
        "url": "https://aclanthology.org/2024.naacl-long.20/"
      }
    }
  ],
  "sources": [
    {
      "label": "RAG 原论文 · 检索与生成",
      "url": "https://arxiv.org/abs/2005.11401"
    },
    {
      "label": "DPR 原论文 · 双编码器与内积检索",
      "url": "https://arxiv.org/abs/2004.04906"
    },
    {
      "label": "ARES · 检索相关性与答案忠实度",
      "url": "https://aclanthology.org/2024.naacl-long.20/"
    }
  ]
});
