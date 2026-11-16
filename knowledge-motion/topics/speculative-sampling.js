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
        "label": "逐步观察",
        "steps": [
          "草稿 q(A,B)=(0.8,0.2)，目标 p=(0.6,0.4)",
          "草稿提出 A，目标也给 A 非零概率",
          "使用 p(A)/q(A)，不能只看最大项是否一致"
        ]
      },
      "description": "p 和 q 是二者在同一个已接受前缀上的实际采样分布。",
      "source": {
        "label": "Leviathan 等 · 算法 1 与 §2.3",
        "url": "https://arxiv.org/pdf/2211.17192"
      }
    },
    {
      "color": "purple",
      "title": "验收概率",
      "visual": {
        "type": "flow",
        "label": "逐步观察",
        "steps": [
          "A 的验收率 min(1,0.6/0.8)",
          "得到 0.75",
          "若随机数 u=0.9，拒绝 A"
        ]
      },
      "description": "按顺序检查草稿；第一次拒绝后，后续草稿不再沿该前缀有效。",
      "source": {
        "label": "Leviathan 等 · 算法 1 与 §2.3",
        "url": "https://arxiv.org/pdf/2211.17192"
      }
    },
    {
      "color": "amber",
      "title": "拒绝后补分布",
      "visual": {
        "type": "flow",
        "label": "逐步观察",
        "steps": [
          "p−q=(-0.2,+0.2)",
          "取正部 (0,0.2)，归一化",
          "拒绝时从 (0,1) 采样，所以输出 B"
        ]
      },
      "description": "不能直接重采目标分布，否则会把验收阶段已经覆盖的概率质量再次计入。",
      "source": {
        "label": "Leviathan 等 · 算法 1 与 §2.3",
        "url": "https://arxiv.org/pdf/2211.17192"
      }
    },
    {
      "color": "mint",
      "title": "检查输出分布",
      "visual": {
        "type": "flow",
        "label": "逐步观察",
        "steps": [
          "接受 A 的质量 0.8×0.75=0.6",
          "接受 B 的质量 0.2，加上拒绝修正的 0.2",
          "最终 (A,B)=(0.6,0.4)，匹配目标 p"
        ]
      },
      "description": "这是两 Token 教学例；原论文给出一般分布的正确性证明。",
      "source": {
        "label": "Leviathan 等 · 算法 1 与 §2.3",
        "url": "https://arxiv.org/pdf/2211.17192"
      }
    },
    {
      "color": "rose",
      "title": "草稿全通过",
      "visual": {
        "type": "flow",
        "label": "逐步观察",
        "steps": [
          "草稿长度 γ=3，三个候选均验收",
          "目标模型已有下一位置的条件分布",
          "无停止条件时再采一个目标 Token，本轮得到 4 个"
        ]
      },
      "description": "发生提前 EOS 或达到生成上限时按服务规则结束。",
      "source": {
        "label": "Leviathan 等 · 算法 1 与 §2.3",
        "url": "https://arxiv.org/pdf/2211.17192"
      }
    },
    {
      "color": "blue",
      "title": "加速条件",
      "visual": {
        "type": "flow",
        "label": "逐步观察",
        "steps": [
          "草稿成本为目标单步的 0.2，γ=3，近似常数验收率 0.8",
          "模型化期望产出 1+0.8+0.64+0.512=2.952",
          "若目标并行验证仍花 1 个单步，则模型化加速为 2.952/1.6≈1.85"
        ]
      },
      "description": "推导假设验收率独立同分布、验证成本近似恒定。此数是教学计算，真实服务应测延迟和吞吐。",
      "source": {
        "label": "Leviathan 等 · 式 (1) 与定理 3.8",
        "url": "https://arxiv.org/pdf/2211.17192"
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
