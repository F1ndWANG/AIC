window.knowledgeTopics ??= [];
window.knowledgeTopics.push({
  id: "llm-post-training",
  title: "LLM 后训练关键检查点",
  subtitle: "从训练数据到生成行为，再用回归评估检验旧能力。",
  cards: [
    {
      color: "cyan", title: "去重与采样", subtitle: "Deduplication / Sampling",
      visual: { type: "bars", label: "样本占比 · 去重前 → 去重后", rows: [
        { label: "退款", before: 60, value: 40 },
        { label: "发票", before: 25, value: 35 },
        { label: "退货", before: 15, value: 25 }
      ] },
      description: "按近重复簇抽样检查主流与长尾意图，核对拆分后训练集与评估集的重复率。",
      checks: ["按近重复簇分组后再切分，抽检跨 split 的高相似样本。"]
    },
    {
      color: "purple", title: "监督范围", subtitle: "SFT Loss Masking",
      visual: { type: "tokens", label: "逐位置检查 labels", tokens: [
        { label: "用户", active: false }, { label: "1+1", active: false },
        { label: "助手", active: false }, { label: "2", active: true },
        { label: "EOS", active: true }
      ], caption: "mask：0 0 0 1 1 · 0 表示忽略" },
      description: "若采用 assistant-only loss，解码一批真实训练样本，核对助手回复跨度与忽略标记。",
      checks: ["把一个真实 batch 的 tokens 和 labels 对齐打印，检查被忽略位置与结束标记。"]
    },
    {
      color: "amber", title: "对话模板与停止", subtitle: "Chat Template / EOS",
      visual: { type: "flow", label: "角色标记与停止条件", steps: ["用户消息", "助手回复", "结束标记"],
        caption: "检查 tokenizer 模板、标签与推理 stop 配置" },
      description: "用相同对话跑一遍训练编码和推理生成，检查截断是否丢失结束标记，生成是否按预期停止。",
      checks: ["在不同上下文长度下跑固定生成样例，记录停止原因和实际终止 token。"]
    },
    {
      color: "mint", title: "同题偏好对", subtitle: "DPO Preference Pairs",
      visual: { type: "pairs", label: "同一提示词 · 退货期限是多少？", rows: [
        { label: "Chosen", value: "签收后 7 天内可申请", active: true },
        { label: "Rejected", value: "任何时候都能退", active: false }
      ] },
      description: "保留同一上下文，只改变回答。抽检偏好依据，并排查长度、格式与答案质量的相关性。",
      checks: ["对 chosen/rejected 长度分层抽检，检查偏好是否在相同长度区间内仍成立。"]
    },
    {
      color: "rose", title: "参考策略约束", subtitle: "KL Regularization",
      visual: { type: "flow", label: "带 KL 惩罚的 GRPO 配置", steps: ["当前策略", "与参考策略比较", "β × KL"],
        caption: "同时跟踪 KL、任务奖励和独立验证指标" },
      description: "启用 KL 惩罚时记录 β 和参考策略。用验证集检查奖励提升是否对应真实任务进步。",
      checks: ["固定验证集，比较奖励、KL 和独立任务指标随训练步数的变化。"]
    },
    {
      color: "blue", title: "新旧能力回归", subtitle: "Regression Evaluation",
      visual: { type: "bars", label: "通过率 · 基线 → 候选", rows: [
        { label: "新任务", before: 64, value: 79 },
        { label: "旧能力", before: 87, value: 85 },
        { label: "格式遵从", before: 92, value: 93 }
      ] },
      description: "在同一评估协议下对比基线与候选，按能力切片检查退化，再按预设阈值决定保留哪个检查点。",
      checks: ["为各能力切片预设上线门槛，逐项记录候选模型与基线的差值。"]
    }
  ],
  note: "样本、掩码和数值为教学示例。主题内容依据所列技术文档整理。",
  sources: [
    { label: "TRL · SFT", url: "https://huggingface.co/docs/trl/sft_trainer" },
    { label: "TRL · DPO", url: "https://huggingface.co/docs/trl/main/dpo_trainer" },
    { label: "TRL · GRPO", url: "https://huggingface.co/docs/trl/main/en/grpo_trainer" }
  ]
});
