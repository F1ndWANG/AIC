window.knowledgeTopics ??= [];
window.knowledgeTopics.push({
  "id": "llm-basics",
  "title": "大语言模型基础",
  "subtitle": "从文本如何进入模型，讲到下一个 Token 如何生成。",
  "cards": [
    {
      "color": "cyan",
      "title": "分词",
      "subtitle": "同样长的两段文字会有同样多的 Token 吗？",
      "visual": {
        "type": "flow",
        "label": "点击「演示机制」，逐步核对",
        "steps": [
          "输入",
          "规则",
          "输出"
        ],
        "narrations": [
          "教学词表含 unf、air、ness，输入 unfairness。",
          "假设该分词器按已学合并规则切成 unf / air / ness。词表为这三项分别分配 ID 17、42、9。",
          "模型接收 [17,42,9]，原字符串 10 个字符、这里是 3 个 Token。ID 仅为教学示意。"
        ]
      },
      "description": "",
      "checkpoint": {
        "question": "换一个词表，可能只产生 2 个 Token 吗？",
        "answer": "可能。例如词表和合并规则允许 unfair / ness。实际切分应运行对应模型的分词器。"
      },
      "source": {
        "label": "原始资料",
        "url": "https://arxiv.org/abs/1508.07909"
      }
    },
    {
      "color": "purple",
      "title": "词嵌入与位置",
      "subtitle": "同一词出现两次，模型如何区分先后？",
      "visual": {
        "type": "flow",
        "label": "点击「演示机制」，逐步核对",
        "steps": [
          "查表",
          "加位置",
          "比较"
        ],
        "narrations": [
          "输入 ID [42,7,42]。第 1 和第 3 个位置都先查同一张表的第 42 行。",
          "以原始 Transformer 的加法位置编码为例，两处分别加 P₁、P₃。",
          "得到 E₄₂+P₁ 和 E₄₂+P₃，同一 Token 可带不同位置信息。"
        ]
      },
      "description": "",
      "checkpoint": {
        "question": "用 RoPE 的模型也一定把位置向量加到词嵌入上吗？",
        "answer": "不一定。RoPE 在注意力里旋转 Q 和 K，这张卡展示的是原论文的加法位置编码。"
      },
      "source": {
        "label": "原始资料",
        "url": "https://arxiv.org/abs/1706.03762"
      }
    },
    {
      "color": "amber",
      "title": "因果自注意力",
      "subtitle": "为什么未来 Token 的高分也不会改变当前输出？",
      "visual": {
        "type": "flow",
        "label": "点击「演示机制」，逐步核对",
        "steps": [
          "准备",
          "掩码",
          "聚合"
        ],
        "narrations": [
          "第 2 个位置对三个键的缩放分数为 [0,0,4]，对应的 V 值简化成 [2,8,20]。",
          "第 3 个位置在未来，把它的分数改为 −∞。Softmax 得到 [0.5,0.5,0]。",
          "输出为 0.5×2+0.5×8+0×20=5。"
        ]
      },
      "description": "",
      "checkpoint": {
        "question": "第三个 V 改为 200，输出是多少？",
        "answer": "仍是 5，因为第三个位置的权重为 0。"
      },
      "source": {
        "label": "原始资料",
        "url": "https://arxiv.org/abs/1706.03762"
      }
    },
    {
      "color": "mint",
      "title": "Transformer 层",
      "subtitle": "注意力、前馈和残差分别做什么？",
      "visual": {
        "type": "flow",
        "label": "点击「演示机制」，逐步核对",
        "steps": [
          "汇聚上下文",
          "逐位置变换",
          "保留输入路径"
        ],
        "narrations": [
          "三条 Token 向量构成 X。自注意力按权重混合可见位置，输出仍有三条向量。",
          "同一套前馈网络独立作用于每一位置，前馈层内部可以先扩维再投回模型维度。",
          "每个子层各有残差路径，把子层结果加回该子层的输入。原论文还在相加后做归一化。"
        ]
      },
      "description": "",
      "checkpoint": {
        "question": "前馈网络会在这一子层直接读取相邻 Token 向量吗？",
        "answer": "不会。跨位置的信息已经可以由注意力传入，前馈变换本身逐位置运行。"
      },
      "source": {
        "label": "原始资料",
        "url": "https://arxiv.org/abs/1706.03762"
      }
    },
    {
      "color": "rose",
      "title": "下一个 Token",
      "subtitle": "词表概率怎样从两个分数算出来？",
      "visual": {
        "type": "flow",
        "label": "点击「演示机制」，逐步核对",
        "steps": [
          "取表示",
          "算分数",
          "归一化"
        ],
        "narrations": [
          "用当前前缀最后位置的隐藏向量，计算下一位置的词表分数。",
          "假设教学小词表只有 A、B，分数分别为 ln 3 和 0。",
          "取指数得 3 和 1，除以总和 4，概率分别为 75% 和 25%。"
        ]
      },
      "description": "",
      "checkpoint": {
        "question": "给两个分数都加 5，概率会改变吗？",
        "answer": "不会。分子和分母都乘同一个 exp(5)，相除后抵消。"
      },
      "source": {
        "label": "原始资料",
        "url": "https://arxiv.org/abs/1706.03762"
      }
    },
    {
      "color": "blue",
      "title": "自回归生成",
      "subtitle": "为什么第二个生成词需要重看新增前缀？",
      "visual": {
        "type": "flow",
        "label": "点击「演示机制」，逐步核对",
        "steps": [
          "第 1 步",
          "第 2 步",
          "停止"
        ],
        "narrations": [
          "前缀为“今天”，解码器选出“下”。文本片段仅用来示意 Token。",
          "前缀更新为“今天下”，使用更新后的条件分布选出“雨”。",
          "前缀变为“今天下雨”。继续生成，直到遇到 EOS 或达到设置的生成上限。"
        ]
      },
      "description": "",
      "checkpoint": {
        "question": "如果第一步选出“晴”，第二步还能直接使用原分布吗？",
        "answer": "不能。前缀变成“今天晴”，下一 Token 分布要以这个新前缀为条件。"
      },
      "source": {
        "label": "原始资料",
        "url": "https://arxiv.org/abs/1706.03762"
      }
    }
  ],
  "sources": [
    {
      "label": "Transformer 原论文",
      "url": "https://arxiv.org/abs/1706.03762"
    }
  ]
});
