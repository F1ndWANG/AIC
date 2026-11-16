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
        "label": "逐步观察",
        "steps": [
          "词法分数 A=12、B=8；向量分数 B=0.82、C=0.7",
          "两路分数刻度不同",
          "各自在本路变成第 1、2 名再融合"
        ]
      },
      "description": "RRF 的输入是排名。这避免直接把两路原始分数相加。",
      "source": {
        "label": "Cormack 等 · §2 / RRF 公式",
        "url": "https://cormack.uwaterloo.ca/cormack/cormacksigir09-rrf.pdf"
      }
    },
    {
      "color": "purple",
      "title": "单路贡献",
      "visual": {
        "type": "flow",
        "label": "逐步观察",
        "steps": [
          "取 k=60，排名从 1 开始",
          "第 1 名得 1/61，第 2 名得 1/62",
          "先产生每路贡献，再按文档 ID 汇总"
        ]
      },
      "description": "原论文的 60 是实验选定的常数；迁移到新系统应在开发集核验。",
      "source": {
        "label": "Cormack 等 · §3 / 实验与 k 的取值",
        "url": "https://cormack.uwaterloo.ca/cormack/cormacksigir09-rrf.pdf"
      }
    },
    {
      "color": "amber",
      "title": "两路贡献求和",
      "visual": {
        "type": "flow",
        "label": "逐步观察",
        "steps": [
          "词法 [A,B]；向量 [B,C]",
          "A≈0.01639；B≈0.03252；C≈0.01613",
          "排序为 B、A、C"
        ]
      },
      "description": "本例是截断列表的工程用法，只合并返回的文档，缺席路不加分。",
      "source": {
        "label": "Cormack 等 · §2 / RRF 公式",
        "url": "https://cormack.uwaterloo.ca/cormack/cormacksigir09-rrf.pdf"
      }
    },
    {
      "color": "mint",
      "title": "k 如何改变差距",
      "visual": {
        "type": "flow",
        "label": "逐步观察",
        "steps": [
          "比较第 1 名与第 2 名的贡献",
          "k=1 时分别为 0.5、0.333；k=60 时约 0.01639、0.01613",
          "k 变大时，同一路的相邻名次贡献更接近"
        ]
      },
      "description": "多个列表反复出现的文档可能受益，不能保证第一名永远相同。",
      "source": {
        "label": "Cormack 等 · §3 / 实验与 k 的取值",
        "url": "https://cormack.uwaterloo.ca/cormack/cormacksigir09-rrf.pdf"
      }
    },
    {
      "color": "rose",
      "title": "召回窗口的边界",
      "visual": {
        "type": "flow",
        "label": "逐步观察",
        "steps": [
          "在向量第 3 名还有 D",
          "若只取前两名，D 无这一项贡献",
          "扩大窗口后才可能纳入 D"
        ]
      },
      "description": "窗口扩大增加候选和计算。应同时记录窗口、去重逻辑与延迟。",
      "source": {
        "label": "Cormack 等 · §2 / RRF 公式",
        "url": "https://cormack.uwaterloo.ca/cormack/cormacksigir09-rrf.pdf"
      }
    },
    {
      "color": "blue",
      "title": "融合、重排和证据",
      "visual": {
        "type": "flow",
        "label": "逐步观察",
        "steps": [
          "RRF 把 B 排第一，但 B 是过期政策",
          "重排按问题条件核对适用性",
          "最终答复仍需引用当前有效条款"
        ]
      },
      "description": "排名指标和答案证据质量各自评估，避免只验证融合名次。",
      "source": {
        "label": "Cormack 等 · §2 / RRF 公式",
        "url": "https://cormack.uwaterloo.ca/cormack/cormacksigir09-rrf.pdf"
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
