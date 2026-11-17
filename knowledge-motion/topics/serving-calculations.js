window.knowledgeTopics ??= [];
window.knowledgeTopics.push({
  "id": "serving-calculations",
  "title": "推理显存与延迟实算",
  "subtitle": "从一个 Token 的缓存算到并发预算，再区分首 Token、输出间隔和服务延迟。示例数字为教学设定。",
  "cards": [
    {
      "color": "cyan",
      "title": "KV Cache 每 Token 占用",
      "visual": {
        "type": "flow",
        "label": "点击「演示机制」逐步观察",
        "steps": [
          "一层存什么",
          "换算字节",
          "堆叠所有层"
        ],
        "narrations": [
          "教学配置采用 32 层、8 个 KV 头、每头 128 维。每层为该 Token 存一组 K 和一组 V。",
          "每个 FP16 元素占 2 字节。两份向量合起来，每层占 4096 字节。",
          "32 层都要存。乘完层数再用 1024 换算 KiB。"
        ],
        "scenes": [
          [
            {
              "label": "K 元素",
              "value": "8 × 128 = 1024"
            },
            {
              "label": "V 元素",
              "value": "8 × 128 = 1024"
            }
          ],
          [
            {
              "label": "每层元素",
              "value": "1024 + 1024"
            },
            {
              "label": "每层字节",
              "value": "2048 × 2 = 4096"
            }
          ],
          [
            {
              "label": "全模型每 Token",
              "value": "32 × 4096 字节"
            },
            {
              "label": "KV 载荷",
              "value": "131072 字节 = 128 KiB"
            }
          ]
        ]
      },
      "description": "适用于各层 KV 规格相同、完整缓存所有已保留 Token 的简化模型。结果是全模型 K/V 张量载荷，未包含显存分片、页填充与实现开销。",
      "subtitle": "一个 Token 写进 KV Cache，要存多少字节？",
      "checkpoint": {
        "question": "如果只有 KV 的数据类型从 FP16 改为每元素 1 字节，载荷是多少？",
        "answer": "64 KiB/Token。这里仅算 K、V 张量，比例因子等额外开销另计。"
      },
      "source": {
        "label": "PagedAttention §2 · 自回归解码与 KV Cache",
        "url": "https://arxiv.org/pdf/2309.06180#page=3"
      }
    },
    {
      "color": "purple",
      "title": "并发显存预算",
      "visual": {
        "type": "flow",
        "label": "点击「演示机制」逐步观察",
        "steps": [
          "算单请求",
          "算并发",
          "对照预算"
        ],
        "narrations": [
          "沿用 128 KiB/Token，设每条请求当前已有 4096 个缓存 Token，不共享前缀。",
          "8 条同长度请求同时还在缓存中。因此乘以 8。",
          "扣除权重和工作区后，假设只给 KV 留 8 GiB。8 条请求的载荷占一半，按同样长度粗算，载荷上限是 16 条。"
        ],
        "scenes": [
          [
            {
              "label": "已缓存",
              "value": "4096 Token"
            },
            {
              "label": "单请求",
              "value": "4096 × 128 KiB = 512 MiB"
            }
          ],
          [
            {
              "label": "活跃请求",
              "value": "8"
            },
            {
              "label": "总载荷",
              "value": "8 × 512 MiB = 4 GiB"
            }
          ],
          [
            {
              "label": "KV 预算",
              "value": "8 GiB"
            },
            {
              "label": "已用比例",
              "value": "4 / 8 = 50%",
              "meter": 50.0
            },
            {
              "label": "仅按 KV 载荷估算",
              "value": "8 GiB ÷ 512 MiB = 16 条"
            }
          ]
        ]
      },
      "description": "",
      "subtitle": "8 GiB 的 KV 预算能容纳多少个长请求？",
      "checkpoint": {
        "question": "8 个并发请求都从 4096 增长到 8192 个已缓存 Token，还在 8 GiB 预算内吗？",
        "answer": "仅 K/V 张量载荷恰好 8 GiB。实际能否放下需检查块容量、保留余量等。8192 若可被块长度整除，这些请求不会因此产生尾块空槽。"
      },
      "source": {
        "label": "PagedAttention §2 · 自回归解码与 KV Cache",
        "url": "https://arxiv.org/pdf/2309.06180#page=3"
      }
    },
    {
      "color": "amber",
      "title": "页内碎片",
      "visual": {
        "type": "flow",
        "label": "点击「演示机制」逐步观察",
        "steps": [
          "前两页",
          "分配末页",
          "算最后的浪费"
        ],
        "narrations": [
          "假设每页能放 16 个 Token。先装满前两页，计 32 个。",
          "第 33 个必须新增一页。于是第三页只填了 1 个槽。",
          "三块共有 48 个槽位；填了 33 个，末块剩余 15 个。后续 Token 可以继续填这些槽。"
        ],
        "scenes": [
          [
            {
              "label": "页 1",
              "value": "16 / 16",
              "slots": {
                "used": 16,
                "total": 16
              }
            },
            {
              "label": "页 2",
              "value": "16 / 16",
              "slots": {
                "used": 16,
                "total": 16
              }
            },
            {
              "label": "剩余",
              "value": "1 个"
            }
          ],
          [
            {
              "label": "页 1",
              "value": "16 / 16",
              "slots": {
                "used": 16,
                "total": 16
              }
            },
            {
              "label": "页 2",
              "value": "16 / 16",
              "slots": {
                "used": 16,
                "total": 16
              }
            },
            {
              "label": "页 3",
              "value": "1 / 16",
              "slots": {
                "used": 1,
                "total": 16
              }
            }
          ],
          [
            {
              "label": "页 1",
              "value": "16 / 16",
              "slots": {
                "used": 16,
                "total": 16
              }
            },
            {
              "label": "页 2",
              "value": "16 / 16",
              "slots": {
                "used": 16,
                "total": 16
              }
            },
            {
              "label": "页 3",
              "value": "1 / 16",
              "slots": {
                "used": 1,
                "total": 16
              }
            },
            {
              "label": "未用槽位",
              "value": "48 − 33 = 15"
            }
          ]
        ]
      },
      "description": "这里的一页指固定容量的 KV 块，16 是教学设定。空槽仍可供同一序列后续生成使用。",
      "subtitle": "33 个 Token 为什么会占 3 个页？",
      "checkpoint": {
        "question": "长度从 33 增长到 48，页数要增加吗？",
        "answer": "不增加。3 页合计放得下 48 个，到了 49 才需要第四页。"
      },
      "source": {
        "label": "PagedAttention §4.2–4.3 · 分块与按需分配",
        "url": "https://arxiv.org/pdf/2309.06180#page=5"
      }
    },
    {
      "color": "mint",
      "title": "首 Token 与输出间隔",
      "visual": {
        "type": "flow",
        "label": "点击「演示机制」逐步观察",
        "steps": [
          "标出首个",
          "数相邻间隔",
          "到最后一个"
        ],
        "narrations": [
          "从请求发出到收到第 1 个 Token 是 350 ms，包含排队及首 Token 的生成和传输。",
          "同一条请求从第 1 到第 101 个 Token 有 100 个间隔。这里假设这条请求的后续平均间隔为 12 ms。",
          "把首 Token 延迟与后续所有间隔相加，得到从请求到收到最后一个 Token 的时间。"
        ],
        "scenes": [
          [
            {
              "label": "时间起点",
              "value": "请求发出"
            },
            {
              "label": "第 1 个 Token",
              "value": "350 ms"
            }
          ],
          [
            {
              "label": "间隔数",
              "value": "101 − 1 = 100"
            },
            {
              "label": "首 Token 后",
              "value": "100 × 12 = 1200 ms"
            }
          ],
          [
            {
              "label": "首 Token",
              "value": "350 ms"
            },
            {
              "label": "后续",
              "value": "1200 ms"
            },
            {
              "label": "到最后一个 Token",
              "value": "1550 ms"
            }
          ]
        ]
      },
      "description": "同一请求的到末 Token 时间 = TTFT + (输出 Token 数 − 1) × 该请求的平均后续间隔。不能把各自跨请求统计的 p95 直接代入等式求总耗时 p95。",
      "subtitle": "生成 101 个 Token，为什么只乘 100 个间隔？",
      "checkpoint": {
        "question": "只输出一个 Token 时，从发出请求到收到最后一个 Token 的耗时是多少？",
        "answer": "在本例口径下等于首 Token 延迟 350 ms，后面没有 Token 间隔。"
      },
      "source": {
        "label": "DistServe §2 · TTFT、TPOT 与 SLO",
        "url": "https://arxiv.org/abs/2401.09670"
      }
    },
    {
      "color": "rose",
      "title": "KV 头数与 GQA",
      "visual": {
        "type": "flow",
        "label": "点击「演示机制」逐步观察",
        "steps": [
          "设定对照",
          "按组共享",
          "比较载荷"
        ],
        "narrations": [
          "MHA 里 32 个查询头分别对应 32 个 KV 头。",
          "对照 GQA 配置保留 32 个查询头，分成 8 组，每组 4 个查询头共享一套 K、V 投影。",
          "在相同层数、头维、精度及序列长度下，载荷和 KV 头数成正比。"
        ],
        "scenes": [
          [
            {
              "label": "查询头",
              "value": "32"
            },
            {
              "label": "KV 头",
              "value": "32"
            },
            {
              "label": "相对 KV 载荷",
              "value": "100%",
              "meter": 100.0
            }
          ],
          [
            {
              "label": "查询头",
              "value": "32"
            },
            {
              "label": "KV 头",
              "value": "8"
            },
            {
              "label": "每组查询头",
              "value": "4"
            },
            {
              "label": "相对 KV 载荷",
              "value": "待计算"
            }
          ],
          [
            {
              "label": "查询头",
              "value": "32"
            },
            {
              "label": "KV 头",
              "value": "8"
            },
            {
              "label": "相对 KV 载荷",
              "value": "8 / 32 = 25%",
              "meter": 25
            }
          ]
        ]
      },
      "description": "这里比较缓存中实际保存共享 KV 头的两种架构，并固定其他维度与精度。25% 仅指 K/V 张量载荷，不能推断峰值显存或延迟。",
      "subtitle": "GQA 为什么能减少 KV Cache 的张量载荷？",
      "checkpoint": {
        "question": "查询头保持 32，只把 KV 头从 32 改到 16，理想载荷是多少比例？",
        "answer": "是原来的一半。这里固定其他维度和精度，比较的是模型架构。"
      },
      "source": {
        "label": "GQA §2 与图 2 · 查询头分组共享 KV",
        "url": "https://arxiv.org/abs/2305.13245"
      }
    },
    {
      "color": "blue",
      "title": "SLO 下测吞吐",
      "visual": {
        "type": "flow",
        "label": "点击「演示机制」逐步观察",
        "steps": [
          "先设门槛",
          "检查 A",
          "检查 B"
        ],
        "narrations": [
          "教学例自定义 SLO：同一种请求组合和到达负载下，p95 到末 Token 延迟不超过 1.5 秒。A、B 是假想测点。",
          "A 虽然每秒完成 60 个请求，但 p95 为 2.0 秒。",
          "在这两个假想测点中，只有 B 满足 p95 延迟门槛。48 请求/秒是它的总完成吞吐。"
        ],
        "scenes": [
          [
            {
              "label": "SLO",
              "value": "p95 ≤ 1.5 秒"
            },
            {
              "label": "吞吐单位",
              "value": "请求 / 秒"
            }
          ],
          [
            {
              "label": "A 吞吐",
              "value": "60"
            },
            {
              "label": "A p95",
              "value": "2.0 秒"
            },
            {
              "label": "判定",
              "value": "超出延迟门槛"
            }
          ],
          [
            {
              "label": "B 吞吐",
              "value": "48"
            },
            {
              "label": "B p95",
              "value": "1.1 秒"
            },
            {
              "label": "判定",
              "value": "达标"
            }
          ]
        ]
      },
      "description": "这个示例用自定义的端到端 p95 门槛筛选测点。DistServe 的 goodput 使用的是论文定义的 TTFT 与 TPOT 服务目标及达标比例。",
      "subtitle": "在延迟约束下，怎样决定哪个部署配置更合适？",
      "checkpoint": {
        "question": "如果 A 的 p95 降到 1.4 秒、吞吐仍为 60 请求/秒，该选谁？",
        "answer": "这两个测点都达标，A 吞吐更高。正式比较仍需用同一请求负载测多个点。"
      },
      "source": {
        "label": "DistServe §2 · TTFT、TPOT 与 SLO",
        "url": "https://arxiv.org/abs/2401.09670"
      }
    }
  ],
  "sources": [
    {
      "label": "PagedAttention §2 · 自回归解码与 KV Cache",
      "url": "https://arxiv.org/pdf/2309.06180#page=3"
    },
    {
      "label": "PagedAttention §4.2–4.3 · 分块与按需分配",
      "url": "https://arxiv.org/pdf/2309.06180#page=5"
    },
    {
      "label": "GQA §2 与图 2 · 查询头分组共享 KV",
      "url": "https://arxiv.org/abs/2305.13245"
    },
    {
      "label": "DistServe §2 · TTFT、TPOT 与 SLO",
      "url": "https://arxiv.org/abs/2401.09670"
    }
  ]
});
