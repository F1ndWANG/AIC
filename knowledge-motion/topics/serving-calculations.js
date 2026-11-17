window.knowledgeTopics ??= [];
window.knowledgeTopics.push({
  "id": "serving-calculations",
  "title": "推理显存与延迟实算",
  "subtitle": "从一个 Token 的缓存算到并发预算，再区分首 Token、输出间隔和服务延迟。",
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
      "description": "",
      "subtitle": "一个 Token 写进 KV Cache，要存多少字节？",
      "checkpoint": {
        "question": "如果只有 KV 的数据类型从 FP16 改为每元素 1 字节，载荷是多少？",
        "answer": "64 KiB/Token。这里仅算 K、V 张量，比例因子等额外开销另计。"
      },
      "source": {
        "label": "PagedAttention 原论文",
        "url": "https://arxiv.org/abs/2309.06180"
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
          "如果在扣掉权重和工作区后，留给 KV 的预算是 8 GiB，理论载荷占一半。"
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
            }
          ]
        ]
      },
      "description": "",
      "subtitle": "8 GiB 的 KV 预算能容纳多少个长请求？",
      "checkpoint": {
        "question": "8 个并发请求都从 4096 增长到 8192 个已缓存 Token，还在 8 GiB 预算内吗？",
        "answer": "理想载荷刚好 8 GiB。任何额外分页、元数据等开销都可能使实际占用超限。"
      },
      "source": {
        "label": "PagedAttention 原论文",
        "url": "https://arxiv.org/abs/2309.06180"
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
          "总容量是 48 个槽，已用 33 个，末页还有 15 个空槽。"
        ],
        "scenes": [
          [
            {
              "label": "页 1",
              "value": "16 / 16",
              "meter": 100.0
            },
            {
              "label": "页 2",
              "value": "16 / 16",
              "meter": 100.0
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
              "meter": 100.0
            },
            {
              "label": "页 2",
              "value": "16 / 16",
              "meter": 100.0
            },
            {
              "label": "页 3",
              "value": "1 / 16",
              "meter": 6.25
            }
          ],
          [
            {
              "label": "总容量",
              "value": "3 × 16 = 48"
            },
            {
              "label": "已用",
              "value": "33"
            },
            {
              "label": "空余",
              "value": "15"
            }
          ]
        ]
      },
      "description": "",
      "subtitle": "33 个 Token 为什么会占 3 个页？",
      "checkpoint": {
        "question": "长度从 33 增长到 48，页数要增加吗？",
        "answer": "不增加。3 页合计放得下 48 个，到了 49 才需要第四页。"
      },
      "source": {
        "label": "PagedAttention 原论文",
        "url": "https://arxiv.org/abs/2309.06180"
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
          "从第 1 个到第 101 个 Token 中间有 100 个间隔。假设平均 12 ms。",
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
              "label": "总耗时",
              "value": "1550 ms"
            }
          ]
        ]
      },
      "description": "",
      "subtitle": "生成 101 个 Token，为什么只乘 100 个间隔？",
      "checkpoint": {
        "question": "只输出一个 Token 时，端到端生成延迟是多少？",
        "answer": "在本例口径下等于首 Token 延迟 350 ms，后面没有 Token 间隔。"
      },
      "source": {
        "label": "PagedAttention 原论文",
        "url": "https://arxiv.org/abs/2309.06180"
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
              "value": "25%",
              "meter": 25.0
            }
          ]
        ]
      },
      "description": "",
      "subtitle": "GQA 为什么能减少 KV Cache 的张量载荷？",
      "checkpoint": {
        "question": "查询头保持 32，只把 KV 头从 32 改到 16，理想载荷是多少比例？",
        "answer": "是原来的一半。这里固定其他维度和精度，比较的是模型架构。"
      },
      "source": {
        "label": "GQA 原论文",
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
          "教学目标是 p95 端到端延迟不超过 1.5 秒。比较同一负载定义下的两个实测点。",
          "A 虽然每秒完成 60 个请求，但 p95 为 2.0 秒。",
          "B 每秒完成 48 个请求，p95 为 1.1 秒。在给出的两个点里，只有 B 符合延迟门槛。"
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
      "description": "",
      "subtitle": "在延迟约束下，怎样决定哪个部署配置更合适？",
      "checkpoint": {
        "question": "如果 A 的 p95 降到 1.4 秒、吞吐仍为 60 请求/秒，该选谁？",
        "answer": "这两个测点都达标，A 吞吐更高。正式比较仍需用同一请求负载测多个点。"
      },
      "source": {
        "label": "PagedAttention 原论文",
        "url": "https://arxiv.org/abs/2309.06180"
      }
    }
  ],
  "sources": [
    {
      "label": "PagedAttention 原论文",
      "url": "https://arxiv.org/abs/2309.06180"
    },
    {
      "label": "GQA 原论文",
      "url": "https://arxiv.org/abs/2305.13245"
    }
  ]
});
