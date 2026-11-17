window.knowledgeTopics ??= [];
window.knowledgeTopics.push({
  "id": "sft-peft",
  "title": "指令微调与参数高效适配",
  "subtitle": "沿着一条指令样本跟踪训练信号、参数更新和上线验收。",
  "cards": [
    {
      "color": "cyan",
      "title": "指令数据设计",
      "subtitle": "示范数据怎样告诉模型“这类指令该怎么答”？",
      "visual": {
        "type": "flow",
        "label": "点击「演示机制」逐步观察",
        "steps": [
          "读指令",
          "写示范",
          "检查覆盖"
        ],
        "narrations": [
          "教学样本要求“从文字中提取订单号并输出 JSON”。",
          "将符合要求的字符串作为助理回答，保留指令和回答之间的角色边界。",
          "把缺订单号、多个编号和无效格式等情形加入数据审查。"
        ],
        "scenes": [
          [
            {
              "label": "输入",
              "value": "订单号 A123"
            },
            {
              "label": "格式",
              "value": "JSON"
            }
          ],
          [
            {
              "label": "目标回答",
              "value": "{\"order_id\":\"A123\"}"
            },
            {
              "label": "训练信号",
              "value": "目标回答 Token"
            }
          ],
          [
            {
              "label": "新增情形",
              "value": "缺失 / 多个 / 格式错误"
            },
            {
              "label": "验收",
              "value": "示范行为与规范一致"
            }
          ]
        ]
      },
      "description": "",
      "checkpoint": {
        "question": "只保留题目、删掉示范回答，还是同一种 SFT 样本吗？",
        "answer": "不是。这里的 SFT 需要提供目标回答，训练模型在指令条件下预测它。"
      },
      "source": {
        "label": "InstructGPT §3 · 示范与监督微调",
        "url": "https://arxiv.org/abs/2203.02155"
      }
    },
    {
      "color": "purple",
      "title": "监督目标与掩码",
      "subtitle": "只训练助理回答时，提示还参与计算吗？",
      "visual": {
        "type": "flow",
        "label": "点击「演示机制」逐步观察",
        "steps": [
          "组织序列",
          "标记标签",
          "看移位"
        ],
        "narrations": [
          "用一个教学例：[用户标记，问题，助理标记，答案，EOS]。假定只监督答案和这条结束符。",
          "在未移位目标标签中，将前 3 个位置置为 −100。具体模板是否纳入 EOS 由配置决定。",
          "预测答案的是前一个位置的输出，随后用答案位置预测 EOS。"
        ],
        "scenes": [
          [
            {
              "label": "输入序列",
              "value": "用户 / 问题 / 助理 / 答案 / EOS"
            },
            {
              "label": "监督策略",
              "value": "示例只算回答与 EOS"
            }
          ],
          [
            {
              "label": "前 3 个目标",
              "value": "−100，忽略"
            },
            {
              "label": "后 2 个目标",
              "value": "答案、EOS"
            }
          ],
          [
            {
              "label": "助理标记位置",
              "value": "预测答案"
            },
            {
              "label": "答案位置",
              "value": "预测 EOS"
            }
          ]
        ]
      },
      "description": "",
      "checkpoint": {
        "question": "提示 Token 的标签是 −100，模型还能看到提示吗？",
        "answer": "能。此处 −100 是交叉熵忽略索引，不是注意力掩码，回答仍以可见提示为条件。"
      },
      "source": {
        "label": "TRL · SFT 的 assistant-only loss",
        "url": "https://huggingface.co/docs/trl/sft_trainer"
      }
    },
    {
      "color": "amber",
      "title": "Chat Template 与 EOS",
      "subtitle": "Chat Template 和 EOS 分别控制什么？",
      "visual": {
        "type": "flow",
        "label": "点击「演示机制」逐步观察",
        "steps": [
          "组织角色",
          "追加生成提示",
          "对照停止"
        ],
        "narrations": [
          "同一条用户消息可以被不同模型的模板转换成不同控制标记。",
          "推理时按模型约定序列化历史，并准备助理开始的标记。",
          "检查模型实际生成的是哪一个结束 ID，并与服务端配置对齐。"
        ],
        "scenes": [
          [
            {
              "label": "输入消息",
              "value": "role: user"
            },
            {
              "label": "训练序列",
              "value": "由 tokenizer 模板生成"
            }
          ],
          [
            {
              "label": "推理输入",
              "value": "历史消息 + 生成提示"
            },
            {
              "label": "下一步",
              "value": "生成回答"
            }
          ],
          [
            {
              "label": "停止依据",
              "value": "EOS 或长度上限"
            },
            {
              "label": "检查",
              "value": "实际停止原因"
            }
          ]
        ]
      },
      "description": "",
      "checkpoint": {
        "question": "调用生成接口到了最大生成长度，但未产生 EOS，还会继续吗？",
        "answer": "不会。长度上限可以独立触发停止。诊断时应区分命中 EOS 和触及长度上限。"
      },
      "source": {
        "label": "Transformers · Chat Templating",
        "url": "https://huggingface.co/docs/transformers/chat_templating"
      }
    },
    {
      "color": "mint",
      "title": "全量微调与 LoRA",
      "subtitle": "LoRA 怎样把大矩阵更新换成两个小矩阵？",
      "visual": {
        "type": "flow",
        "label": "点击「演示机制」逐步观察",
        "steps": [
          "原矩阵",
          "低秩分解",
          "数训练参数"
        ],
        "narrations": [
          "选一个 8 输入、8 输出的线性映射。W 有 64 个参数。",
          "冻结 W，设秩 r=2。新增 A 为 2×8，B 为 8×2，BA 的形状仍是 8×8。",
          "只训练 A 与 B，则学习参数数目为 16+16=32；前向使用 W 与缩放后的 BA。"
        ],
        "scenes": [
          [
            {
              "label": "W 形状",
              "value": "8 × 8"
            },
            {
              "label": "原矩阵",
              "value": "64 个参数"
            }
          ],
          [
            {
              "label": "A",
              "value": "2 × 8"
            },
            {
              "label": "B",
              "value": "8 × 2"
            },
            {
              "label": "BA",
              "value": "8 × 8"
            }
          ],
          [
            {
              "label": "训练参数",
              "value": "32"
            },
            {
              "label": "冻结参数",
              "value": "64"
            }
          ]
        ]
      },
      "description": "",
      "checkpoint": {
        "question": "8×8 层取 r=1，只训练 A 和 B 时有多少参数？",
        "answer": "16 个。A 有 1×8，B 有 8×1。这个计数未包含偏置或其他可训练模块。"
      },
      "source": {
        "label": "LoRA 原论文 §4.1",
        "url": "https://arxiv.org/abs/2106.09685"
      }
    },
    {
      "color": "rose",
      "title": "QLoRA",
      "subtitle": "QLoRA 的 4-bit 指哪些权重？",
      "visual": {
        "type": "flow",
        "label": "点击「演示机制」逐步观察",
        "steps": [
          "量化基座",
          "前向计算",
          "更新适配器"
        ],
        "narrations": [
          "QLoRA 将冻结基座以 4-bit 方式保存。",
          "计算时按实现解量化，用计算精度执行矩阵乘法并加入 LoRA 分支。",
          "梯度通过冻结基座参与的计算流向可训练适配器；基座权重不更新。"
        ],
        "scenes": [
          [
            {
              "label": "基座参数",
              "value": "冻结"
            },
            {
              "label": "存储",
              "value": "4-bit NF4（论文配置）"
            }
          ],
          [
            {
              "label": "权重存储",
              "value": "低比特"
            },
            {
              "label": "计算精度",
              "value": "另行配置"
            }
          ],
          [
            {
              "label": "本例更新",
              "value": "LoRA 参数"
            },
            {
              "label": "基座更新",
              "value": "无"
            }
          ]
        ]
      },
      "description": "",
      "checkpoint": {
        "question": "“基座 4-bit”是否意味着所有中间激活、梯度及优化器状态也都只有 4 位？",
        "answer": "不意味着。各张量表示精度需要分别检查。"
      },
      "source": {
        "label": "QLoRA 原论文 §3",
        "url": "https://arxiv.org/abs/2305.14314"
      }
    },
    {
      "color": "blue",
      "title": "训练验收",
      "subtitle": "训练损失下降后，还要怎样验收？",
      "visual": {
        "type": "flow",
        "label": "点击「演示机制」逐步观察",
        "steps": [
          "固定对照",
          "分任务测量",
          "按阈值验收"
        ],
        "narrations": [
          "用相同提示、解码条件和留出集，对比基座与适配后模型。",
          "假想结果：目标任务从 70% 到 80%，旧任务从 90% 到 87%。",
          "如果事先要求旧任务降幅不超过 2 个百分点，这版未达标。"
        ],
        "scenes": [
          [
            {
              "label": "对照对象",
              "value": "同一基座"
            },
            {
              "label": "数据",
              "value": "固定留出集"
            }
          ],
          [
            {
              "label": "目标任务",
              "value": "70% → 80%"
            },
            {
              "label": "旧任务",
              "value": "90% → 87%"
            }
          ],
          [
            {
              "label": "目标变化",
              "value": "+10 个百分点"
            },
            {
              "label": "旧任务变化",
              "value": "−3 个百分点"
            },
            {
              "label": "判定",
              "value": "旧任务未达标"
            }
          ]
        ]
      },
      "description": "",
      "checkpoint": {
        "question": "目标任务提升 10 个百分点，旧任务下降 3 个百分点，可以只汇报前一个数字吗？",
        "answer": "应同时展示两项变化，再按预先设定的验收标准决定是否使用这版模型。"
      },
      "source": {
        "label": "InstructGPT §3 · 示范与监督微调",
        "url": "https://arxiv.org/abs/2203.02155"
      }
    }
  ],
  "sources": [
    {
      "label": "InstructGPT §3 · 示范与监督微调",
      "url": "https://arxiv.org/abs/2203.02155"
    },
    {
      "label": "TRL · SFT 的 assistant-only loss",
      "url": "https://huggingface.co/docs/trl/sft_trainer"
    },
    {
      "label": "Transformers · Chat Templating",
      "url": "https://huggingface.co/docs/transformers/chat_templating"
    },
    {
      "label": "LoRA 原论文 §4.1",
      "url": "https://arxiv.org/abs/2106.09685"
    },
    {
      "label": "QLoRA 原论文 §3",
      "url": "https://arxiv.org/abs/2305.14314"
    }
  ]
});
