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
        "label": "逐步观察",
        "steps": [
          "固定提示，对旧策略采样 4 个回答",
          "验证器给分 0、1、1、2",
          "把这 4 个回答作为同一组"
        ]
      },
      "description": "这里是 DeepSeekMath 的结果监督算例，奖励可以来自不同验证规则。",
      "source": {
        "label": "DeepSeekMath · §4.1.2 / 结果监督",
        "url": "https://arxiv.org/pdf/2402.03300"
      }
    },
    {
      "color": "purple",
      "title": "结果监督的优势",
      "visual": {
        "type": "flow",
        "label": "逐步观察",
        "steps": [
          "组均值 1，教学例用总体标准差 √0.5",
          "标准化得到约 −1.414、0、0、1.414",
          "各响应的生成 Token 使用各自响应的优势"
        ]
      },
      "description": "标准差约定取决于实现。与参考策略的 KL 项是独立约束。",
      "source": {
        "label": "DeepSeekMath · §4.1.2 / 结果监督",
        "url": "https://arxiv.org/pdf/2402.03300"
      }
    },
    {
      "color": "amber",
      "title": "新旧策略比值",
      "visual": {
        "type": "flow",
        "label": "逐步观察",
        "steps": [
          "某已生成 Token 在旧策略下概率 0.2，新策略为 0.3",
          "概率比 r=0.3/0.2=1.5",
          "比较对象是采样时的旧策略"
        ]
      },
      "description": "旧策略用于重要性比值。参考策略用于 KL 约束，二者角色不同。",
      "source": {
        "label": "DeepSeekMath · 式 (3) / 裁剪与 KL",
        "url": "https://arxiv.org/pdf/2402.03300"
      }
    },
    {
      "color": "mint",
      "title": "正优势裁剪",
      "visual": {
        "type": "flow",
        "label": "逐步观察",
        "steps": [
          "设优势 A=1，ε=0.2，r=1.5",
          "min(1.5×1,1.2×1)=1.2",
          "正优势端不再奖励更大的比值"
        ]
      },
      "description": "这里只计算裁剪代理项。尚未包含 KL、Token 及样本归约。",
      "source": {
        "label": "DeepSeekMath · 式 (3) / 裁剪与 KL",
        "url": "https://arxiv.org/pdf/2402.03300"
      }
    },
    {
      "color": "rose",
      "title": "负优势裁剪",
      "visual": {
        "type": "flow",
        "label": "逐步观察",
        "steps": [
          "设 A=−1，ε=0.2，r=0.5",
          "min(−0.5,−0.8)=−0.8",
          "负优势时，需先乘再取 min"
        ]
      },
      "description": "若先取 min(r,clip(r)) 再乘负数，会选错分支。",
      "source": {
        "label": "DeepSeekMath · 式 (3) / 裁剪与 KL",
        "url": "https://arxiv.org/pdf/2402.03300"
      }
    },
    {
      "color": "blue",
      "title": "组内同分",
      "visual": {
        "type": "flow",
        "label": "逐步观察",
        "steps": [
          "假如 4 个回答奖励都为 1，中心化全部为 0",
          "裸除以零标准差没有定义",
          "实现需有限值保护，并监控这种组的比例"
        ]
      },
      "description": "这是标准化的退化情形。不能把“同分”理解为整轮优化没有 KL 等其他信号。",
      "source": {
        "label": "DeepSeekMath · §4.1.2 / 结果监督",
        "url": "https://arxiv.org/pdf/2402.03300"
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
