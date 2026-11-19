window.workedExamples = {
  "llm-basics": {
    title: "模型怎样连续生成两个 Token？",
    intro: "把“北京是”送给一个教学模型，观察它怎样接着生成“中国首都”。这里把词当作示意 Token，概率为教学数值。",
    question: "生成“中国”之后，预测“首都”时，模型接收的前缀是哪一个？",
    answer: 1,
    choices: ["北京是", "北京是中国", "中国"],
    frames: [
      {"title": "前缀入场", "state": "北京是", "result": "词表未打分", "action": "将前缀表示成 Token 序列。", "reason": "模型根据当前位置可见的前缀计算下一位置的词表分数。"},
      {"title": "生成第一个 Token", "state": "北京是", "result": "中国 0.62 · 一座 0.21 · 其余 0.17", "action": "按贪心策略选“中国”。", "reason": "贪心解码每次选当前概率最大的 Token。"},
      {"title": "把输出接到输入", "state": "北京是中国", "result": "等待重新评分", "action": "把“中国”追加到前缀。", "reason": "下一轮的条件发生了变化，模型现在可以利用刚生成的 Token。"},
      {"title": "生成第二个 Token", "state": "北京是中国首都", "result": "首都 0.71 · 的 0.20 · 其余 0.09", "action": "在新前缀下选“首都”。", "reason": "自回归生成会重复这个循环，直到 EOS 或生成长度上限。"}
    ]
  },
  "tokenization": {
    title: "手算两轮 BPE 合并",
    intro: "语料只有两个词 b a n a n a 和 b a n d。忽略词边界标记，频次相同时按本例规定的次序选择。",
    question: "合并 a+n 后，“banana”会有几个符号？",
    answer: 0,
    choices: ["4 个", "5 个", "6 个"],
    frames: [
      {"title": "初始符号", "state": "b a n a n a · b a n d", "result": "词表 b / a / n / d", "action": "先把两个词拆成字符。", "reason": "BPE 从已有符号出发统计相邻符号对。"},
      {"title": "统计相邻对", "state": "a+n 出现 3 次", "result": "b+a 和 n+a 各 2 次", "action": "以频次最高的 a+n 作为合并对象。", "reason": "频次来自整个训练语料。"},
      {"title": "执行第一轮", "state": "b an an a · b an d", "result": "加入符号 an", "action": "两个词同时应用 a+n → an。", "reason": "banana 由六个字符变为四个符号。"},
      {"title": "重新计数", "state": "b an 出现 2 次", "result": "下一轮 b+an → ban", "action": "在新的符号序列上重新统计。", "reason": "合并顺序决定最终的切分。下一轮得到 ban an a 和 ban d。"}
    ]
  },
  "transformer-architecture": {
    title: "手算一次带掩码的注意力",
    intro: "三个位置的 V 简化为标量 2、8、20。观察第 2 个位置，前两个已缩放注意力分数都为 0。",
    question: "第 2 个位置的注意力输出是多少？",
    answer: 1,
    choices: ["10", "5", "8"],
    frames: [
      {"title": "准备分数", "state": "位置 1：0 · 位置 2：0 · 位置 3：4", "result": "V：2 · 8 · 20", "action": "把同一查询与三个键的已缩放分数放到一行。", "reason": "第三个位置虽然分高，但当前查询处于第 2 个位置。"},
      {"title": "执行因果掩码", "state": "0 · 0 · −∞", "result": "位置 3 被遮住", "action": "先把未来位置的分数替换为 −∞。", "reason": "softmax 后未来位置权重为 0。"},
      {"title": "计算权重", "state": "e⁰=1 · e⁰=1 · e⁻∞=0", "result": "0.5 · 0.5 · 0", "action": "前两个等分权重。", "reason": "同分且都可见的两个位置得到相同权重。"},
      {"title": "聚合 V", "state": "0.5×2 + 0.5×8 + 0×20", "result": "输出 5", "action": "用权重加和 V。", "reason": "把未来位置的 V 改为 200，当前输出仍为 5。"}
    ]
  },
  "training-data": {
    title: "去重必须发生在跨集合检查之前",
    intro: "训练候选 A 和评估候选 B 来自不同网址，但正文只有一个标点不同；C 是另一篇独立文档。",
    question: "如果 A 和 B 应保留，怎样拆分才能避免近重复泄漏？",
    answer: 2,
    choices: ["随便按网址拆", "A 训练、B 测试", "A 和 B 作为同一簇分配"],
    frames: [
      {"title": "构造候选", "state": "A：原文 · B：转载 · C：独立文档", "result": "随机拆分按文档 ID", "action": "A 和 B 的 URL 不同。", "reason": "只看网址容易遗漏转载内容。"},
      {"title": "精确去重", "state": "A 与 B 的规范化哈希不同", "result": "3 篇文档仍在", "action": "一个标点足以改变精确哈希。", "reason": "这一步只能发现规范化后完全一致的文档。"},
      {"title": "近重复聚类", "state": "簇 X：A、B · 簇 Y：C", "result": "簇 X 必须整组分配", "action": "按文本指纹检索高相似文档，并抽检。", "reason": "簇内样本高度相似。"},
      {"title": "按簇拆分", "state": "训练：簇 X · 评估：簇 Y", "result": "跨集近重复簇：0", "action": "把同一个簇全部放进同一侧。", "reason": "评估集规模与代表性还需单独检查。"}
    ]
  },
  "pretraining-inference": {
    title: "同一个句子如何用于训练和生成？",
    intro: "教学序列为 A B C。训练时能看到整个序列，推理时只收到 A B。",
    question: "收到 A B 时，推理用哪个位置的输出预测 C？",
    answer: 1,
    choices: ["A 位置", "B 位置", "先输入 C，再预测 C"],
    frames: [
      {"title": "训练数据", "state": "输入：A B C", "result": "目标：B C EOS", "action": "把标签向后对应到下一位置。", "reason": "输入位置 A 对应目标 B，位置 B 对应目标 C。"},
      {"title": "并行计算训练损失", "state": "A→B · B→C · C→EOS", "result": "每个预测位置受因果掩码约束", "action": "并行计算三个预测位置的损失。", "reason": "位置 B 不能看到后面的 C。"},
      {"title": "推理预填充", "state": "Prompt：A B", "result": "缓存 A、B 的 KV", "action": "前向处理现有前缀。", "reason": "用于预测 C 的词表分数来自末尾位置 B。"},
      {"title": "逐步解码", "state": "前缀：A B C", "result": "下一目标可能为 EOS", "action": "如果选中了 C，就把它追加后继续预测。", "reason": "训练教模型预测后继，推理反复使用这个能力。"}
    ]
  },
  "scaling-training": {
    title: "算清梯度累积的有效批量",
    intro: "每张卡每次处理 2 条样本，共 4 个数据并行副本，累积 3 次再更新。假设每个微批次大小相同。",
    question: "一次参数更新覆盖多少条样本？",
    answer: 2,
    choices: ["8", "12", "24"],
    frames: [
      {"title": "单个副本", "state": "每卡微批次 2", "result": "积累步数 3", "action": "显存先承担单个微批次。", "reason": "微批次大小不等于一次更新的样本数。"},
      {"title": "同轮跨副本", "state": "4 × 2 = 8 条", "result": "4 张卡处理不同数据", "action": "每一轮所有并行副本合计处理 8 条。", "reason": "实际梯度同步时点可由实现安排。"},
      {"title": "累积三轮", "state": "8 + 8 + 8 = 24 条", "result": "梯度累计", "action": "累积第三次后才到更新边界。", "reason": "梯度归一化要与目标平均损失一致。"},
      {"title": "更新参数", "state": "有效批量 24 条", "result": "优化器更新一次", "action": "此后清空累计梯度，开始下一轮。", "reason": "改变副本数或累积数时，核对学习率和日志里的步数。"}
    ]
  },
  "efficient-serving": {
    title: "KV 分页避免为最长请求预留整块",
    intro: "示意系统按每页 4 Token 分配 KV。请求 A 有 3 Token，请求 B 有 7 Token。",
    question: "B 再新增一个 Token，从 7 变成 8，需要新页吗？",
    answer: 0,
    choices: ["不需要", "需要 1 页", "需要 2 页"],
    frames: [
      {"title": "初始分配", "state": "A：3/4 · B：7/8", "result": "总页数 3", "action": "A 占一页，B 占两页。", "reason": "页内剩余槽位可供同一请求继续写入。"},
      {"title": "B 生成第八个 Token", "state": "A：3/4 · B：8/8", "result": "总页数仍为 3", "action": "第八个 Token 填满 B 的第二页。", "reason": "够用时无需新增一页。"},
      {"title": "B 生成第九个 Token", "state": "A：3/4 · B：9/12", "result": "总页数增为 4", "action": "第九个 Token 需要 B 的第三页。", "reason": "页表记录逻辑 Token 与物理缓存块的映射。"},
      {"title": "A 完成请求", "state": "A：释放 1 页 · B：9/12", "result": "已用页数降为 3", "action": "回收 A 的页，允许其他请求使用。", "reason": "实际服务需考虑对齐、元数据、调度和共享前缀。"}
    ]
  },
  "llm-post-training": {
    title: "掩码错一位，模型学到什么？",
    intro: "教学对话序列是 [USER, 问题, ASSISTANT, 答案, EOS]。目标是在 assistant-only SFT 中仅监督答案和 EOS。",
    question: "哪个是本例期望的目标位置掩码？",
    answer: 1,
    choices: ["1 1 1 1 1", "0 0 0 1 1", "0 0 1 1 0"],
    frames: [
      {"title": "模板编码", "state": "USER · 问题 · ASSISTANT · 答案 · EOS", "result": "先区分角色和文本", "action": "生成实际训练序列。", "reason": "先检查 tokenizer 的模板，避免拿文本字符位置代替 Token 位置。"},
      {"title": "错误配置", "state": "掩码 0 0 1 1 0", "result": "角色标记计入 · EOS 忽略", "action": "目标位置偏移了一格。", "reason": "训练意图与真实 labels 不一致，输出边界可能学不好。"},
      {"title": "正确配置", "state": "掩码 0 0 0 1 1", "result": "答案与 EOS 参与损失", "action": "把监督位置对齐到目标 Token。", "reason": "若框架内部做标签移位，要核对最终 logits 对应的是哪一个目标。"},
      {"title": "推理复验", "state": "输入用户消息与助手前缀", "result": "观察生成和停止原因", "action": "在零截断和截断边界分别运行。", "reason": "模板训练正确之后，还需检查推理端 EOS 配置。"}
    ]
  },
  "sft-peft": {
    title: "LoRA 实际训练多少参数？",
    intro: "对 8×8 的线性层加秩为 2 的 LoRA，忽略偏置和缩放系数。",
    question: "新增的可训练参数有多少？",
    answer: 1,
    choices: ["16", "32", "64"],
    frames: [
      {"title": "原始权重", "state": "W：8×8", "result": "64 个参数冻结", "action": "保留基础矩阵。", "reason": "这一层仍参与前向计算。"},
      {"title": "插入低秩支路", "state": "A：2×8 · B：8×2", "result": "ΔW = BA", "action": "先把 8 维降到 2，再映回 8 维。", "reason": "可训练的是两个小矩阵。"},
      {"title": "计算训练参数", "state": "2×8 + 8×2", "result": "32 个新增可训练参数", "action": "只更新 A 和 B。", "reason": "以该层为例，忽略偏置和缩放。"},
      {"title": "推理与验收", "state": "输出使用 W 与 BA", "result": "比较基座与适配结果", "action": "兼容时可在部署前合并低秩更新。", "reason": "用相同评估集检查目标任务和旧能力变化。"}
    ]
  },
  "preference-rl": {
    title: "一组奖励如何变成相对学习信号？",
    intro: "用 GRPO 的组内标准化思想做简化演示。三个回答的奖励分别是 0、1、2，先观察中心化方向。",
    question: "若同组奖励都等于 1，中心化后是什么？",
    answer: 0,
    choices: ["0、0、0", "−1、0、1", "1、1、1"],
    frames: [
      {"title": "采样同题回答", "state": "A、B、C", "result": "奖励 0、1、2", "action": "同一题采样三个候选，奖励由同一规则给出。", "reason": "比较的是同一 Prompt 下的相对表现。"},
      {"title": "计算均值", "state": "均值 1", "result": "中心化 −1、0、1", "action": "每个奖励减去组均值。", "reason": "再做正尺度归一化时不会改变正负方向。"},
      {"title": "解释方向", "state": "A 低于均值 · C 高于均值", "result": "中心化信号 A 负、C 正", "action": "在简化目标下，学习倾向提高相对较好回答概率。", "reason": "实际更新还受到目标函数、裁剪等配置影响。"},
      {"title": "检验同分组", "state": "原始 1、1、1", "result": "中心化全部为 0", "action": "奖励无法区分候选。", "reason": "监控平分组占比，排查奖励分辨率与采样多样性。"}
    ]
  },
  "reasoning-evaluation": {
    title: "多数票碰到共同错误时怎么办？",
    intro: "题目 18×7，五个候选答案为 126、124、124、126、124。可额外使用乘法验证器。",
    question: "只有多数投票时，选出的答案是哪一个？",
    answer: 1,
    choices: ["126", "124", "两者平票"],
    frames: [
      {"title": "收集候选", "state": "126 · 124 · 124 · 126 · 124", "result": "采样次数 5", "action": "提取每条回答的最终答案。", "reason": "先确定解析失败如何处理。"},
      {"title": "按答案分组", "state": "126：2 票 · 124：3 票", "result": "多数结果 124", "action": "多数票只统计一致度。", "reason": "多个样本可能共享同一系统性错误。"},
      {"title": "运行验证", "state": "18×7 = 126", "result": "124 验证失败", "action": "用独立计算核对结果。", "reason": "本例可计算验证，其他任务需要可执行测试或更可靠的证据。"},
      {"title": "固定预算比较", "state": "单次 vs 多数票 vs 多数票加验证", "result": "分别记录正确率与成本", "action": "在多道留出题上比较。", "reason": "不用单个示例推断哪种策略普遍更好。"}
    ]
  },
  "multimodal-llm": {
    title: "视频平均抽帧为何会漏掉短事件？",
    intro: "视频 4 秒，事件发生在 1.4–1.6 秒。先每隔 1 秒取一帧，再试局部加密抽帧。",
    question: "只取 0、1、2、3 秒，有事件帧吗？",
    answer: 0,
    choices: ["没有", "有，1 秒帧", "有，2 秒帧"],
    frames: [
      {"title": "看真实时间轴", "state": "事件窗 1.4–1.6 秒", "result": "输入时长 4 秒", "action": "标出事件出现的区间。", "reason": "时间窗口比抽帧间隔短。"},
      {"title": "稀疏采样", "state": "0 · 1 · 2 · 3 秒", "result": "命中 0 帧", "action": "采样点都落在事件窗之外。", "reason": "模型输入缺少支持事件发生的视觉证据。"},
      {"title": "局部加密", "state": "增加 1.25 · 1.5 · 1.75 秒", "result": "1.5 秒命中", "action": "围绕候选区间增加帧。", "reason": "这里预先知道候选范围，实际系统还需做候选发现。"},
      {"title": "比较代价", "state": "额外 3 帧", "result": "覆盖增加，输入成本也增加", "action": "同时报告召回、延迟和视觉 Token 数。", "reason": "以相同预算对比均匀采样和自适应采样。"}
    ]
  },
  "rag": {
    title: "检索到了过期政策，怎么回答？",
    intro: "教学问题：“2025 年 5 月，未拆封设备签收后多久可申请退款？”库里有旧版 B（14 天）、4 月 1 日起生效的新版 A（7 天）和数字商品规则 C。RAG 先检索候选文档，再把适用的材料交给生成器。正常路径是召回 [B, A] → 过滤后 [A] → 生成器读到 A → 回答“未拆封设备签收后 7 天内”，引用 v2 §2。",
    question: "如果只检索到已经失效的旧版 B，该如何处理？",
    answer: 2,
    choices: ["回答 14 天", "直接回答 7 天", "说明缺少现行政策依据"],
    frames: [
      {"title": "召回两段证据", "state": "B：旧版 14 天 · A：新版 7 天", "result": "初排旧版第 1", "action": "教学内积分数 B=3、A=2，因此旧版领先。", "reason": "文本相关不等于适用。"},
      {"title": "检查适用范围", "state": "目标日期 2025 年 5 月", "result": "B 已失效，A 生效", "action": "把生效日期、版本等元数据纳入筛选。", "reason": "按问题所指定的时间判断证据适用性。"},
      {"title": "生成带来源的回答", "state": "未拆封设备签收后 7 天", "result": "引用设备政策 v2 §2（A）", "action": "用有效条款支持最终回答。", "reason": "引用应能让读者定位到包含数字的条文。"},
      {"title": "反事实复验", "state": "移除现行条款 A", "result": "证据不足，需补查", "action": "重新运行相同查询。", "reason": "如果系统仍编出期限，说明证据约束有问题。"}
    ],
    practice: [
      {trace: "运行 1 · 召回 [B] → 过滤后 [] → 上下文 [] → 无法确认", diagnosis: "召回范围不足。按 B=3、A=2、C=1 的教学打分，Top-1 只返回 B。拒答符合当时可见的证据状态。把 K 改成 2 再复跑，本例的单题召回率从 0/1 变为 1/1。"},
      {trace: "运行 2 · 召回 [B, A] → 过滤后 [B] → 上下文 [B] → 14 天", diagnosis: "适用性过滤失败。A 已进入候选，但规则错误地留下已失效的 B。先核对解析出的查询日期，再检查有效期边界及过滤日志。本例预期只留下 A。"},
      {trace: "运行 3 · 召回 [B, A] → 过滤后 [A] → 上下文 [] → 无法确认", diagnosis: "上下文组装丢证据。筛选已经找对 A，生成器却没收到它。应检查按 ID 取正文是否成功、上下文预算是否截断了片段，以及实际请求是否包含 A。"},
      {trace: "运行 4 · 召回 [B, A] → 过滤后 [A] → 上下文 [A] → 14 天", diagnosis: "答案忠实度失败。生成器收到的 A 明确写了 7 天，输出却成了 14 天。把回答拆成对象、起算点、期限，逐项与 A 比对，并检查引用是否真的支持每项结论。"}
    ]
  },
  "agent-planning": {
    title: "工具执行失败后怎样重规划？",
    intro: "任务是导出上周订单。工具要求绝对日期，报表任务才支持生成 CSV。",
    question: "查询工具返回日期格式错误时，先做什么？",
    answer: 0,
    choices: ["转换日期并重试只读查询", "循环提交原参数", "宣称已完成"],
    frames: [
      {"title": "解析目标", "state": "上周订单 → CSV", "result": "尚无订单数据", "action": "先确认日期范围和时区。", "reason": "计划要明确前置条件。"},
      {"title": "调用只读查询", "state": "传入“上周”", "result": "返回 INVALID_DATE", "action": "观察到工具参数与计划不符。", "reason": "工具结果应进入下一轮决策。"},
      {"title": "更新计划和参数", "state": "转换为绝对日期区间", "result": "只读查询返回 128 条", "action": "修复参数，并在预算内继续。", "reason": "对有副作用的工具要另查幂等条件。"},
      {"title": "验收产物", "state": "CSV 应有 128 条数据行", "result": "读取文件核验", "action": "导出后用文件状态和行数验收。", "reason": "工具成功与业务目标完成是两次不同的检查。"}
    ]
  },
  "agent-reliability": {
    title: "写请求超时了，如何避免重复执行？",
    intro: "模拟退款请求，客户端调用超时，但服务可能已执行。现有接口支持查询订单和幂等键。",
    question: "不确定第一次是否成功时，应优先采用哪种操作？",
    answer: 1,
    choices: ["换个新键再提交", "查询状态，用原幂等键恢复", "用同一订单发两次"],
    frames: [
      {"title": "发出退款请求", "state": "订单 42 · 幂等键 refund-42", "result": "等待响应", "action": "为本次业务动作固定幂等键。", "reason": "幂等键应该跨重试保持一致。"},
      {"title": "客户端超时", "state": "响应未知", "result": "服务端结果未知", "action": "保留原键和请求记录。", "reason": "超时只能说明客户端没拿到结果。"},
      {"title": "检查真实状态", "state": "查询到退款已完成", "result": "退款 ID 已存在", "action": "读取订单或幂等键的结果。", "reason": "有可靠结果时可以复用已完成的操作。"},
      {"title": "复验失败路径", "state": "模拟记录未完成", "result": "按接口语义用原键恢复", "action": "确认最终仅写入一笔。", "reason": "重复请求是否安全依赖服务端的幂等实现。"}
    ]
  },
  "agent-memory": {
    title: "相似的历史经验什么时候会误导？",
    intro: "旧环境的导出菜单在“工具”里。新环境升级后菜单移到“文件”。",
    question: "经过新版本验证后，最稳妥的记忆更新是？",
    answer: 2,
    choices: ["删掉所有旧经验", "两条都存，不写版本", "分别标注适用版本"],
    frames: [
      {"title": "检索历史记录", "state": "旧经验：工具 → 导出", "result": "来源 v1", "action": "向量召回找到语义最相关的流程。", "reason": "相似度可能找对主题，却找错适用版本。"},
      {"title": "在当前环境验证", "state": "当前版本 v2", "result": "“工具”菜单无导出项", "action": "执行前先检查环境状态。", "reason": "过期记忆可能使 Agent 走错路径。"},
      {"title": "补充新证据", "state": "v2：文件 → 导出", "result": "已实际产生文件", "action": "保存新流程及验证信号。", "reason": "把环境版本写进可检索字段。"},
      {"title": "按版本复用", "state": "v1 用旧流程 · v2 用新流程", "result": "无匹配版本时重新验证", "action": "合并时保留适用边界。", "reason": "避免一条新经验把另一场景仍有效的经验覆盖掉。"}
    ]
  },
  "agent-verification": {
    title: "让验证器检查真实产物",
    intro: "Actor 声称“已导出 128 条订单”，实际 CSV 有 80 条数据行。验收要求覆盖全部 128 条。",
    question: "Verifier 应给出什么结论？",
    answer: 0,
    choices: ["未完成，缺 48 条", "已完成，已生成文件", "采用 Actor 自评"],
    frames: [
      {"title": "读取要求", "state": "覆盖 128 条订单", "result": "文件格式应为 CSV", "action": "把目标转换成可检查条件。", "reason": "存在文件只是一个条件。"},
      {"title": "读取产物", "state": "CSV 存在", "result": "实际 80 条数据行", "action": "从工具输出或文件直接获得证据。", "reason": "与 Actor 的自然语言声明分开核对。"},
      {"title": "给出失败证据", "state": "128 − 80 = 48 条", "result": "验收失败", "action": "把差值及文件路径反馈给 Actor。", "reason": "可定位的失败能指导下一次修复。"},
      {"title": "修复后验证", "state": "重查分页并补齐", "result": "复核数量与 ID 唯一性", "action": "还要确认没有以重复行凑足数量。", "reason": "同一验收规则用于每次重试。"}
    ]
  },
  "self-improvement": {
    title: "怎样区分纠错与跨任务改进？",
    intro: "Agent 在 T1 漏掉分页。修复后得到一条经验“下一页游标为空再停止”，准备在独立任务 T2 测试。",
    question: "哪项证据能证明经验确实迁移到了新任务？",
    answer: 2,
    choices: ["T1 修复后通过", "T1 的重试次数增多", "同样预算下，T2 加载经验后表现更好"],
    frames: [
      {"title": "第一次失败", "state": "T1 只导出第一页", "result": "错误：遗漏游标", "action": "记录导致错误的操作。", "reason": "一次失败只提供候选经验。"},
      {"title": "当场修复", "state": "循环读取至无游标", "result": "T1 验收通过", "action": "验证修复有效。", "reason": "这说明解决了当前任务。"},
      {"title": "保存可复用流程", "state": "写入分页停止规则", "result": "附来源与适用接口", "action": "经验能被下一任务加载。", "reason": "明确写入的状态，是改进闭环的载体。"},
      {"title": "独立验证", "state": "T2 有记忆 / 无记忆", "result": "工具与预算相同", "action": "衡量迁移到未见任务上的表现。", "reason": "保持测试任务隔离，避免把答案直接写入记忆。"}
    ]
  },
  "rsi": {
    title: "一次经过验证的探索如何改变下一轮？",
    intro: "目标是让 Agent 学会在陌生报表系统中完成筛选和导出。模型权重固定，允许更新共享记忆。",
    question: "冻结测试时，哪个状态还应该保持只读？",
    answer: 1,
    choices: ["页面中的用户任务状态", "从探索得到的长期记忆", "验证器返回的任务结果"],
    frames: [
      {"title": "广度探索", "state": "Curriculum 分派筛选、导出、分页", "result": "初始记忆 M₀", "action": "用不同任务覆盖环境操作。", "reason": "广度探索让系统先看到更多可操作路径。"},
      {"title": "Actor 与 Verifier", "state": "Actor 导出 80 / 128 行", "result": "Verifier 判定分页未完成", "action": "独立核验真实环境结果。", "reason": "失败反馈指出下一轮值得练习的具体缺口。"},
      {"title": "深度练习并更新", "state": "定向练习分页 → 验证 128 / 128", "result": "M₁ 加入分页终止条件", "action": "对薄弱点练习，验收后归纳为经验。", "reason": "下一轮 Actor 可复用 M₁，权重保持固定。"},
      {"title": "冻结后评估", "state": "只读 M₁ → 未见报表任务", "result": "对照 M₀ 和 M₁", "action": "在相同预算下测未见任务结果。", "reason": "避免用正式测试反馈继续更新记忆。"}
    ]
  },
  "rsi-evaluation": {
    title: "控制预算后，如何判断递归更新有用？",
    intro: "在同一组 40 个留出任务上比较三种设置。以下结果为教学示例，工具和推理预算相同。",
    question: "完整探索相对仅广度探索的成功率差多少？",
    answer: 2,
    choices: ["4 个百分点", "20 个百分点", "10 个百分点"],
    frames: [
      {"title": "无记忆基线", "state": "成功 20 / 40", "result": "50%", "action": "记录固定模型和工具下的起点。", "reason": "留出任务与探索任务隔离。"},
      {"title": "仅广度探索", "state": "成功 24 / 40", "result": "60%", "action": "冻结经过广度探索得到的记忆。", "reason": "比基线高 10 个百分点。"},
      {"title": "广度加深度", "state": "成功 28 / 40", "result": "70%", "action": "冻结完整探索后的记忆。", "reason": "比仅广度高 10 个百分点，仍需复验。"},
      {"title": "分析差异", "state": "成功 28 − 24 = 4 个任务", "result": "4 / 40 = 10 个百分点", "action": "逐任务检查成功变化，并跨环境复跑。", "reason": "单组教学数字不能证明普遍收益，还需同时报告探索成本与不确定性。"}
    ]
  }
};

window.workedExamples["transformer-architecture"].experiment = {
  label: "改变未来位置的 V，观察当前输出",
  min: 20, max: 200, initial: 20, unit: "",
  compare(value) {
    const futureWeight = Math.exp(4) / (2 + Math.exp(4));
    const unmasked = (2 + 8) / (2 + Math.exp(4)) + futureWeight * value;
    return [
      ["启用因果掩码", 5, "未来位置权重为 0"],
      ["关闭因果掩码", unmasked, "未来位置参与加权"]
    ];
  }
};

window.workedExamples["efficient-serving"].experiment = {
  label: "改变请求 B 的 Token 数，观察 KV 页数",
  min: 1, max: 16, initial: 7, unit: "Token",
  compare(value) {
    const pages = Math.ceil(value / 4);
    return [
      ["已分配页数", pages, "每页 4 个槽位"],
      ["空闲槽位", 4 * pages - value, "供同一请求继续写入"]
    ];
  }
};

window.workedExamples["sft-peft"].experiment = {
  label: "改变 LoRA 的秩，观察参数量",
  min: 1, max: 8, initial: 2, unit: "",
  compare(rank) {
    return [
      ["LoRA 两个矩阵", 16 * rank, `A：${rank}×8，B：8×${rank}`],
      ["原矩阵", 64, "8×8；在 LoRA 微调中冻结"]
    ];
  }
};

Object.assign(window.workedExamples, {
  "decoding-controls": {
    "title": "同一分布下 Top-k 和 Top-p 会留下谁？",
    "intro": "四个候选概率为 0.50、0.30、0.15、0.05。比较 k=3 和 p=0.70。",
    "question": "Top-p 保留几个候选？",
    "answer": 1,
    "choices": ["1 个", "2 个", "3 个"],
    "frames": [{"title": "排序", "state": "A 0.50 · B 0.30 · C 0.15 · D 0.05", "result": "按概率从大到小", "action": "两个方法都从排序后的候选开始。", "reason": "此处概率已归一化。"}, {"title": "固定候选数量", "state": "Top-k，k=3", "result": "A、B、C 保留", "action": "直接截取前三项。", "reason": "保留概率总和为 0.95。"}, {"title": "累加概率", "state": "Top-p，p=0.70", "result": "0.50 不够；0.80 达标", "action": "找到累计质量首次达到阈值的位置。", "reason": "本例保留 A 和 B。"}, {"title": "重新归一化", "state": "Top-p：A 0.625 · B 0.375", "result": "其余候选为 0", "action": "将保留概率分别除以 0.80。", "reason": "抽样结果仍取决于随机数。"}]
  },
  "context-engineering": {
    "title": "输入超预算，删掉哪部分？",
    "intro": "窗口 8192，输出预留 1024。输入含关键条款、工具定义和可删的重复历史。",
    "question": "输入 7600 Token 时至少删多少？",
    "answer": 1,
    "choices": ["168", "432", "1024"],
    "frames": [{"title": "预留输出", "state": "总窗口 8192 · 输出保留 1024", "result": "输入上限 7168", "action": "先从窗口中预留输出。", "reason": "计算本例预算时，输入包括所有模板与工具定义。"}, {"title": "统计当前输入", "state": "输入 7600", "result": "超出 432", "action": "把已序列化的全部内容实际分词。", "reason": "按实际 Token 计数，字符数只能粗估。"}, {"title": "筛选保留项", "state": "条款、订单号、工具定义保留", "result": "移除 500 Token 重复历史", "action": "从可替代的历史中回收预算。", "reason": "如果删除唯一证据，回答质量可能比长度不足更糟。"}, {"title": "重新验收", "state": "输入 7100", "result": "余量 68", "action": "再计数，并确认订单号及条款仍在。", "reason": "用原题和边界题复验，检查压缩是否改变结果。"}]
  },
  "verifiable-reward": {
    "title": "训练验证器为什么给错解满分？",
    "intro": "题目计算整数绝对值。训练验证器只测 2 和 3，候选提交 f(x)=x。",
    "question": "哪一个输入能第一次暴露本例错误？",
    "answer": 1,
    "choices": ["3", "−2", "0"],
    "frames": [{"title": "候选输出", "state": "候选直接返回输入 x", "result": "未检验负数", "action": "先读取候选实际逻辑。", "reason": "正确函数在 x 为负数时应改变符号。"}, {"title": "运行可见测试", "state": "x=2 和 x=3", "result": "2/2 通过", "action": "仅运行正数用例。", "reason": "两种函数在这些样本上行为相同。"}, {"title": "加入独立反例", "state": "x=−2", "result": "预期 2，实际 −2", "action": "运行训练可见集合以外的反例。", "reason": "测试覆盖不足掩盖了真正的实现错误。"}, {"title": "记录回归", "state": "训练分 2/2；独立测试失败", "result": "扩大验证覆盖", "action": "将奖励验收和独立发布验收分别报告。", "reason": "训练分数不能替代对目标任务的正确性证明。"}]
  },
  "rag-ingestion": {
    "title": "新政策入库后为什么仍答旧数据？",
    "intro": "政策 v1 写 30 天，v2 写 7 天，生效日期已过。索引和答案缓存都可能残留旧数据。",
    "question": "只新增 v2 就能保证不会回答 30 天吗？",
    "answer": 0,
    "choices": ["不能", "能", "只要改标题就能"],
    "frames": [{"title": "读取来源", "state": "v1 30 天 · v2 7 天", "result": "v2 已生效", "action": "核对来源、版本和生效日期。", "reason": "先确定谁是当前事实。"}, {"title": "更新索引", "state": "v2 文本与来源写入", "result": "v1 撤下或标失效", "action": "按文档 ID 管理版本。", "reason": "仅新增会留下两个相互冲突的候选。"}, {"title": "检查缓存", "state": "旧回答缓存仍为 30 天", "result": "按依赖版本失效", "action": "切换索引后触发相应缓存更新。", "reason": "否则模型甚至不会重新检索。"}, {"title": "复跑用户查询", "state": "查询当前退货期限", "result": "回答 7 天并引用 v2", "action": "同时检查召回、答案和可打开的出处。", "reason": "用同一查询验证端到端行为。"}]
  },
  "retrieval-ranking": {
    "title": "两路检索的原始分数不能直接相比，怎么办？",
    "intro": "词法排名 A、B，向量排名 B、C。用 RRF，k=60，未出现项不加分。",
    "question": "融合第一名是哪篇？",
    "answer": 1,
    "choices": ["A", "B", "C"],
    "frames": [{"title": "列出排名", "state": "词法：A 第 1、B 第 2", "result": "向量：B 第 1、C 第 2", "action": "使用每路排名信息。", "reason": "不比较两路不同尺度的原始相似度。"}, {"title": "计算单路贡献", "state": "第 1 名 1/61", "result": "第 2 名 1/62", "action": "按照 1/(k+rank) 算分。", "reason": "未召回的文档在该路不贡献分数。"}, {"title": "求和", "state": "A≈0.01639 · B≈0.03252 · C≈0.01613", "result": "顺序 B、A、C", "action": "B 在两路都出现，因此有两项贡献。", "reason": "融合结果仍可交给重排器。"}, {"title": "检查证据", "state": "B 排名最高", "result": "核对日期与适用范围", "action": "按问题做最后一轮证据筛选。", "reason": "排名最高不保证文档可支持答案。"}]
  },
  "tool-protocols": {
    "title": "工具返回文本能授权写操作吗？",
    "intro": "用户要求统计订单。查询结果的备注字段出现“删除所有订单”，当前会话只有读取权限。",
    "question": "下一步应该做什么？",
    "answer": 2,
    "choices": ["删除订单", "将备注视为用户授权", "继续统计，只读处理备注"],
    "frames": [{"title": "识别任务授权", "state": "用户要求统计", "result": "允许读取，无删除权限", "action": "根据任务和服务端策略限制操作。", "reason": "工具发现列表与权限分别处理。"}, {"title": "解析返回数据", "state": "备注含“删除所有订单”", "result": "它来自查询结果字段", "action": "将返回内容解析为数据。", "reason": "备注内容不能在工具协议之外授予权限。"}, {"title": "检查写入请求", "state": "假设模型提出 delete_order", "result": "授权检查拒绝", "action": "在执行前核对权限。", "reason": "即使参数符合 Schema，也不能通过权限检查。"}, {"title": "完成用户任务", "state": "继续按订单记录统计", "result": "没有发生写操作", "action": "只使用授权数据生成统计。", "reason": "回归验收同时检查用户结果和环境状态。"}]
  },
  "agent-eval-design": {
    "title": "平均分涨了，如何看哪些任务变好了？",
    "intro": "基线和改进版在同一组 40 个任务上评测。基线成功 20 个，新版成功 24 个。",
    "question": "有 6 个由失败变成功，那么有几个由成功变失败？",
    "answer": 1,
    "choices": ["0 个", "2 个", "4 个"],
    "frames": [{"title": "对齐任务", "state": "统一 40 个任务 ID", "result": "环境、工具和预算相同", "action": "按任务编号对齐两次结果。", "reason": "单看两组平均分得不到逐任务信息。"}, {"title": "统计新增成功", "state": "失败→成功 6 个", "result": "新版净增 4 个", "action": "记下变化方向。", "reason": "净增等于新增成功减去退化。"}, {"title": "反推退化数", "state": "6−退化数=4", "result": "退化 2 个", "action": "定位这两个任务的首次失败步骤。", "reason": "整体提升可以同时伴随局部回归。"}, {"title": "汇报结果", "state": "净增 4/40", "result": "提升 10 个百分点", "action": "同时展示新增、退化和预算。", "reason": "教学数字用于说明比较方法，真实实验还需不确定性估计。"}]
  },
  "rsi-memory-control": {
    "title": "经验写得太具体，如何在新任务复用？",
    "intro": "学习任务刚好只有三页。错误经验写成“总是翻三页”，准备拿两页与五页环境检验。",
    "question": "哪条经验能同时适用于两页和五页？",
    "answer": 2,
    "choices": ["总是两页", "总是五页", "持续翻页直到没有下一页游标"],
    "frames": [{"title": "写入候选规则", "state": "观察到学习任务有 3 页", "result": "候选经验：固定翻三页", "action": "标明规则来源和假设。", "reason": "单次成功不足以证明规则泛化。"}, {"title": "运行反例", "state": "两页调用后没有下一页；五页还剩两页", "result": "固定三页失败", "action": "在独立实例中检验实际停止条件。", "reason": "失败说明页数不是可复用状态。"}, {"title": "修订并记录", "state": "只要存在下一页游标就继续", "result": "分别在两页与五页验收", "action": "更新规则声明及验证记录。", "reason": "保留旧版本，便于追踪何时修订。"}, {"title": "冻结后再测", "state": "冻结新版记忆", "result": "在未见任务上对照旧版", "action": "不把留出集结果写回记忆。", "reason": "相同推理和工具预算下，才好解释差异。"}]
  },
  "optimization-stability": {
    "title": "裁剪梯度后，更新方向会变吗？",
    "intro": "梯度是 (3,4)，全局范数阈值设为 2。暂不考虑优化器动量和逐参数预处理。",
    "question": "裁剪后的梯度是什么？",
    "answer": 1,
    "choices": ["(2,2)", "(1.2,1.6)", "(3,4)"],
    "frames": [{"title": "读出梯度", "state": "(3,4)", "result": "阈值 2", "action": "取本步未裁剪的梯度。", "reason": "全局范数把所有分量一起考虑。"}, {"title": "计算范数", "state": "sqrt(3²+4²)=5", "result": "5 大于阈值 2", "action": "求出 L2 范数。", "reason": "超限才缩放。"}, {"title": "统一缩放", "state": "系数 2/5", "result": "得到 (1.2,1.6)", "action": "将每一维乘同一系数。", "reason": "同缩放保留原向量方向。"}, {"title": "复核结果", "state": "sqrt(1.2²+1.6²)=2", "result": "首尾方向一致", "action": "同时核对范数和方向。", "reason": "逐分量截到 2 会得到 (2,2)，它不符合本例的全局裁剪规则。"}]
  },
  "inference-search": {
    "title": "什么时候可以在搜索前证明无解？",
    "intro": "要从候选中找一个同时满足 x+y=9 和 x、y 都是正偶数的解。演示器先验证奇偶性约束。",
    "question": "只根据这两个约束，能否得到有效解？",
    "answer": 2,
    "choices": ["能，取 4 和 5", "能，取 2 和 6", "不能，两正偶数之和必为偶数"],
    "frames": [{"title": "读取条件", "state": "x+y=9", "result": "x、y 都是正偶数", "action": "明确判定所需的两个约束。", "reason": "生成候选之前可以先做便宜的约束检查。"}, {"title": "检验局部候选", "state": "候选 (4,5) 满足和为 9", "result": "(4,5) 的 y 为奇数", "action": "拒绝只满足一项约束的候选。", "reason": "判定要覆盖所有硬约束。"}, {"title": "检查全局约束", "state": "偶数 + 偶数 = 偶数", "result": "目标 9 为奇数", "action": "用可验证的不变量剪掉整个搜索空间。", "reason": "与只删除单个失败候选相比，全局不变量可以直接终止搜索。"}, {"title": "返回验收结果", "state": "不存在可行解", "result": "停止继续生成候选", "action": "报告可核查的不变量。", "reason": "若没有全局证明，应区分预算耗尽与证明无解。"}]
  },
  "agent-workflows": {
    "title": "进程重启后，怎样避免生成两份导出文件？",
    "intro": "查询得出 128 条订单。创建导出文件的请求可能已发送，进程在记录结果前中断。导出服务支持按业务键查询与幂等写入。",
    "question": "从检查点恢复后应先做什么？",
    "answer": 1,
    "choices": ["新建业务键再导出", "用原业务键检查已有文件", "直接标记成功"],
    "frames": [{"title": "保存检查点", "state": "查询完成，记录 128 条的快照", "result": "业务键 export-42", "action": "持久化操作目标及业务键。", "reason": "检查点记录预期动作，不代表外部写已完成。"}, {"title": "发生中断", "state": "请求已发出，响应未记录", "result": "文件状态未知", "action": "将未知状态留待查询。", "reason": "不能从本地没有响应推断外部没有副作用。"}, {"title": "恢复和查询", "state": "按 export-42 查结果", "result": "若已有则复用", "action": "读取源系统确认状态。", "reason": "若确需重试，按服务协议复用原键。"}, {"title": "验收并续跑", "state": "检查唯一订单 ID 与数据行数", "result": "符合 128 条要求后进入通知", "action": "保存确认结果和外部文件引用。", "reason": "重复恢复也应只推进一次状态。"}]
  },
  "rsi-strategy-selection": {
    "title": "分数下降说明 Actor 变差了吗？",
    "intro": "用同一批导出产物对比两个验证器。旧版只查文件存在，新版还核对唯一订单 ID 和必要字段。",
    "question": "新版通过率更低，从什么先查起？",
    "answer": 0,
    "choices": ["核对评分口径与人工标签", "立即修改模型权重", "直接判定 Actor 退化"],
    "frames": [{"title": "冻结产物", "state": "同一份导出结果", "result": "Actor 和文件内容完全相同", "action": "保留被测对象，只改变验证规则。", "reason": "定位误差需要尽量单独改变一个因素。"}, {"title": "应用旧验证器", "state": "CSV 存在", "result": "判定通过", "action": "记录旧评分依据。", "reason": "单看存在性不能发现漏数据。"}, {"title": "应用新验证器", "state": "CSV 存在但仅 80 个唯一 ID", "result": "目标为 128，判定失败", "action": "保存失败原因和可查证据。", "reason": "差异来自验收规则，需由人工确认新规则符合任务。"}, {"title": "校准后对照改进", "state": "用新口径重评基线与候选", "result": "按同一规则比较成功率和成本", "action": "重新建立可比基线。", "reason": "在同一口径下才能判断策略更新是否改善真实完成率。"}]
  },
  "model-compression": {
    "title": "低位权重节省的显存等于整机显存节省吗？",
    "intro": "模型有十亿个权重。用十进制 GB；教学中先忽略元数据，再加入相同的 1 GB 运行时状态。",
    "question": "INT4 的理论权重载荷是多少？",
    "answer": 1,
    "choices": ["0.25 GB", "0.5 GB", "1 GB"],
    "frames": [{"title": "FP16 权重", "state": "10 亿 × 2 字节", "result": "2 GB", "action": "先只计算权重。", "reason": "FP16 每个权重 16 位。"}, {"title": "INT4 权重", "state": "10 亿 × 0.5 字节", "result": "0.5 GB", "action": "以两个权重合占一个字节计算。", "reason": "这里只算理论载荷。"}, {"title": "加上运行时状态", "state": "FP16 3 GB；INT4 1.5 GB", "result": "本例整体节省 50%", "action": "两侧各加 1 GB 运行时状态。", "reason": "权重少 75% 不等于总占用少 75%。"}, {"title": "上线复测", "state": "记录实际分组元数据、KV 与临时空间", "result": "比较质量、显存与延迟", "action": "在目标硬件和目标负载测量。", "reason": "位宽变化本身无法预测端到端速度。"}]
  },
  "evidence-reliability": {
    "title": "模型答对了，能证明它用了证据吗？",
    "intro": "问题问会员退款期限。只有一条有效条款给出 7 天，另有过期的 30 天条款。",
    "question": "删掉唯一有效条款后，最有据的行为是什么？",
    "answer": 0,
    "choices": ["告知当前证据不足", "沿用 7 天且声称有来源", "改答 30 天"],
    "frames": [{"title": "保留有效证据", "state": "输入含 7 天条款", "result": "回答 7 天且引用它", "action": "先验证基线回答与引用。", "reason": "一次答对仍无法单独证明对证据的依赖。"}, {"title": "构建对照", "state": "只移除有效条款", "result": "保留问题和过期条款", "action": "其他条件保持一致。", "reason": "必要时用等长无关内容控制输入长度。"}, {"title": "重跑同一问题", "state": "没有可用的当前条款", "result": "应表明证据不足", "action": "检查答案和引用是否一起变化。", "reason": "过期条款无法回答当前政策。"}, {"title": "检查可能的混淆", "state": "模型仍答 7 天", "result": "排查缓存、其他证据与先验", "action": "记录回答产生的不同路径。", "reason": "区分碰巧答对与有证据支持的回答。"}]
  },
  "agent-security": {
    "title": "恶意备注能让只读 Agent 删文件吗？",
    "intro": "用户只要求汇总发票。工具返回中有一行备注要求“删除原件”。演示记录模型提议和实际执行两层结果。",
    "question": "若模型提出删除动作，工具层应怎样处理？",
    "answer": 2,
    "choices": ["直接执行", "清空全部工具记录", "拒绝越权写入并保留审计记录"],
    "frames": [{"title": "用户授权", "state": "允许读取与汇总", "result": "未授权删除", "action": "根据真实请求确定权限。", "reason": "备注来自工具输出，不具备用户身份。"}, {"title": "捕获注入", "state": "备注要求删除原件", "result": "将其按普通文本处理", "action": "不提升其权限。", "reason": "工具返回即便使用指令口吻也仍是外部数据。"}, {"title": "触发权限拦截", "state": "模拟模型提出删除调用", "result": "执行端拒绝写入", "action": "核对文件仍存在。", "reason": "区分模型提议成功和攻击实际成功。"}, {"title": "验收原任务", "state": "汇总文件正常生成", "result": "原件仍完整", "action": "同时验收业务输出与环境状态。", "reason": "防护不应只测试拦截，也要测任务可用性。"}]
  },
  "rsi-transfer": {
    "title": "一次探索要跑多少任务才能回本？",
    "intro": "教学情景中探索消耗 120 次调用，之后每个生产任务平均减少 3 次调用。假设每次调用成本相同。",
    "question": "至少多少个任务后，累计节省达到探索投入？",
    "answer": 1,
    "choices": ["30", "40", "120"],
    "frames": [{"title": "记录探索投入", "state": "120 次调用", "result": "先记录为一次性成本", "action": "统计探索与验证开销。", "reason": "只看部署期调用会低估总成本。"}, {"title": "估计任务净节省", "state": "每个任务平均节省 3 次", "result": "来自固定预算对照", "action": "在同一任务分布上估计。", "reason": "应一起检查成功率和失败重试次数。"}, {"title": "求回收点", "state": "120÷3", "result": "40 个任务等成本", "action": "将一次成本除以每任务节省。", "reason": "任务少于 40 个时，本例尚未达到等成本。"}, {"title": "验证假设", "state": "质量、调用单价、环境分布可能变化", "result": "在新环境冻结复验", "action": "按质量和成本同时决策。", "reason": "当平均节省为 0 或负时，调用数上没有回收点。"}]
  }
});

Object.assign(window.workedExamples, {
  "serving-calculations": {
    title: "8 个长请求要预留多少 KV 显存？",
    intro: "32 层、8 个 KV 头、每头 128 维，KV 使用 FP16。每个请求当前缓存 4096 Token，教学例忽略分页开销和前缀共享。",
    question: "8 个请求同时存活时，KV 张量载荷约为多少？",
    answer: 2,
    choices: ["512 MiB", "1 GiB", "4 GiB"],
    frames: [
      { title: "算单层", state: "K 和 V 各存 8×128 个数", result: "2×8×128×2 = 4096 字节/层/Token", action: "FP16 每个数占 2 字节。", reason: "公式中两个 2 分别来自 K/V 和数值字节数。" },
      { title: "乘层数", state: "4096×32 字节", result: "131072 字节 = 128 KiB/Token", action: "每个 Token 在每层都要有缓存。", reason: "本例只算整个模型的缓存载荷，不代表分片后某张卡的占用。" },
      { title: "乘请求长度", state: "4096 Token × 128 KiB", result: "512 MiB/请求", action: "按当前已缓存的序列长度计算。", reason: "生成更多 Token 会继续占用缓存。" },
      { title: "乘并发并验收", state: "8 × 512 MiB", result: "约 4 GiB KV 载荷", action: "从设备预算中另扣权重与工作空间。", reason: "显存达标还需验证延迟与真实调度下的碎片。" }
    ],
    experiment: {
      label: "调整并发，比较 KV 载荷与假设预算",
      min: 1, max: 24, initial: 8, unit: "请求",
      compare(requests) {
        const usage = requests * 0.5;
        return [
          ["KV 载荷（GiB）", usage, usage <= 8 ? "估算未超预算" : "估算已超预算"],
          ["可用 KV 预算（GiB）", 8, "教学设定，已扣除其他开销"]
        ];
      }
    }
  },
  "dpo-calculations": {
    title: "偏好对写反，为什么损失会变大？",
    intro: "当前策略对 A/B 的序列 log 概率为 −2、−4，参考策略为 −3、−4。取 β=1，A 是 chosen。",
    question: "参考策略校正后，这条样本的 DPO logit 是多少？",
    answer: 1,
    choices: ["2", "1", "−1"],
    frames: [
      { title: "算当前差值", state: "log π(A)=−2，log π(B)=−4", result: "当前差值 2", action: "用 chosen 减 rejected。", reason: "计算针对同一提示下的完整回答。" },
      { title: "减参考差值", state: "参考差值 (−3)−(−4)=1", result: "相对差值 2−1=1", action: "比较当前策略比参考策略多偏向 A 多少。", reason: "β=1 时，相对差值就是 logit。" },
      { title: "算单样本损失", state: "σ(1)≈0.731", result: "−log σ(1)≈0.313", action: "把 logit 转换成偏好分类的损失。", reason: "该值是单个样本的目标，不是整个训练集的准确率。" },
      { title: "交换偏好标签", state: "A/B 互换，logit 变成 −1", result: "−log σ(−1)≈1.313", action: "对同样的模型状态重新计算。", reason: "标签方向改变了学习信号，说明数据顺序必须核对。" }
    ],
    experiment: {
      label: "改变校正后 logit，比较原标签和互换标签",
      min: -4, max: 4, initial: 1, unit: "",
      compare(logit) {
        return [
          ["原标签损失", Math.log1p(Math.exp(-logit)), "softplus(−logit)"],
          ["互换标签损失", Math.log1p(Math.exp(logit)), "softplus(logit)"]
        ];
      }
    }
  },
  "rsi-paired-eval": {
    title: "成功率提高时，为什么还要查退化任务？",
    intro: "同一批 20 个任务分别用旧记忆和新记忆跑一次。8 个都成功，6 个都失败，5 个新增成功，1 个发生退化。",
    question: "新版相对基线的成功率净提升是多少？",
    answer: 2,
    choices: ["4 个百分点", "25 个百分点", "20 个百分点"],
    frames: [
      { title: "先做配对", state: "20 个任务按 ID 对齐", result: "每个任务有基线与新版两个结果", action: "固定模型、预算和验收规则。", reason: "使用同一任务防止任务构成变化影响比较。" },
      { title: "计算基线", state: "都成功 8 + 退化 1", result: "9/20 = 45%", action: "基线成功包含后来退化的任务。", reason: "退化指基线成功、新版失败。" },
      { title: "计算新版", state: "都成功 8 + 新增成功 5", result: "13/20 = 65%，净增 20 个百分点", action: "新增成功数量减去退化数量。", reason: "5 个新增成功并不等于净增 5 个。" },
      { title: "回放退化", state: "定位 1 个基线成功、新版失败的任务", result: "检查新记忆是否误用旧接口", action: "同时报告总体收益、退化与成本。", reason: "示例数字用来练习配对计算，不代表任何真实系统性能。" }
    ],
    experiment: {
      label: "改变新增成功数，观察配对后的两组成功率",
      min: 0, max: 11, initial: 5, unit: "个",
      compare(gains) {
        const delta = (gains - 1) * 5;
        return [
          ["基线成功率（%）", 45, "8 个共同成功 + 1 个退化"],
          ["新版成功率（%）", (8 + gains) * 5, `相对基线 ${delta > 0 ? "+" : ""}${delta} 个百分点`]
        ];
      }
    }
  }
});

Object.assign(window.workedExamples, {
  "speculative-sampling": {
    title: "拒绝草稿 A 以后，为什么不能直接重抽目标分布？",
    intro: "草稿分布 q=(0.8,0.2)，目标分布 p=(0.6,0.4)。原论文的采样算法保持目标分布，以下概率为教学算例。",
    question: "草稿提出 A 后被拒，修正采样选 B 的概率是多少？",
    answer: 2,
    choices: ["0.2", "0.4", "1.0"],
    frames: [
      { title: "生成候选", state: "q(A)=0.8，q(B)=0.2", result: "草稿提出 A", action: "用草稿分布采样。", reason: "目标分布用同一前缀计算。" },
      { title: "验收", state: "p(A)/q(A)=0.6/0.8", result: "接受率 0.75，u=0.9 时拒绝", action: "把均匀随机数与 min(1,p/q) 比较。", reason: "草稿给 A 的概率已经高于目标给的概率。" },
      { title: "补不足的质量", state: "正部 max(p−q,0)=(0,0.2)", result: "归一化成 (0,1)，输出 B", action: "只在拒绝分支采修正分布。", reason: "直接重抽 p 会把已验收的 A 再加入一部分。" },
      { title: "合并概率", state: "A 验收 0.6；B 验收 0.2；拒绝后 B 0.2", result: "总分布 (0.6,0.4)", action: "将互斥路径的概率相加。", reason: "这里验证的是分布相同。单次采样轨迹可以不同。" }
    ],
    experiment: {
      label: "改变草稿提出 A 的概率，观察验收与补偿",
      min: 10, max: 90, initial: 80, unit: "%",
      compare(value) {
        const acceptedA = Math.min(value, 60);
        const correctionA = 60 - acceptedA;
        return [
          ["经草稿验收输出 A（%）", acceptedA, "min(q(A), p(A))"],
          ["经拒绝修正输出 A（%）", correctionA, "max(p(A)−q(A), 0)"],
          ["A 的总概率（%）", acceptedA + correctionA, "与目标分布一致"]
        ];
      }
    }
  },
  "grpo-objective": {
    title: "负优势为什么不能先裁剪比值再乘？",
    intro: "选一个已生成 Token，设组内优势 A=−1，旧策略概率 0.4，新策略概率 0.2，裁剪阈值 ε=0.2。只算裁剪代理项。",
    question: "min(rA, clip(r)A) 的值是多少？",
    answer: 1,
    choices: ["−0.5", "−0.8", "0.8"],
    frames: [
      { title: "算新旧比", state: "0.2 / 0.4", result: "r=0.5", action: "用当前概率除以采样时旧策略概率。", reason: "参考策略不参与这个比值。" },
      { title: "看裁剪区间", state: "[0.8, 1.2]", result: "clip(0.5)=0.8", action: "占位计算第二个分支。", reason: "还需要给两个分支各乘 A。" },
      { title: "分别相乘", state: "0.5×(−1)=−0.5；0.8×(−1)=−0.8", result: "min(−0.5,−0.8)=−0.8", action: "保留较小的代理目标。", reason: "乘负数会反转大小，改变运算顺序会算错。" },
      { title: "核对完整目标", state: "本例只计算一个 Token 的裁剪代理项", result: "尚未扣除 KL 或做样本归约", action: "带着这个局部例子读 DeepSeekMath 式 (3)。", reason: "结果监督同响应内共享优势，完整优化还涉及多个响应及 Token。" }
    ]
  },
  "rrf-ranking": {
    title: "一个文档在两路都排第二，能超过一路第一吗？",
    intro: "词法返回 [A,B]，向量返回 [C,B]。教学例用截断列表，未出现的路不加分，k=60。",
    question: "合并后哪篇排名最高？",
    answer: 1,
    choices: ["A", "B", "C"],
    frames: [
      { title: "列出两路排名", state: "词法 A→B；向量 C→B", result: "B 在两路都第 2", action: "只取名次，无须比较两路原始分数。", reason: "本例每个列表从 1 开始计名次。" },
      { title: "算每路贡献", state: "第 1 名 1/61，第 2 名 1/62", result: "A 和 C 各只有一次贡献", action: "对每路文档算 1/(k+rank)。", reason: "本例只对返回的候选累计。" },
      { title: "按文档求和", state: "A≈0.01639，B≈0.03226，C≈0.01639", result: "B 第一，A 和 C 并列", action: "把 B 的 1/62 加两次。", reason: "如需稳定排序，明确同分处理规则。" },
      { title: "验证有效性", state: "融合第一的 B 可能是过期政策", result: "核对发布时间和适用条件", action: "将排序结果交给重排及证据校验。", reason: "融合得分是候选信号，答案仍需有效证据。" }
    ]
  }
});

// Interactive teaching examples use small, explicitly specified inputs.
window.workedExamples["efficient-serving"].experiment.diagram = function (count) {
  const pages = Math.ceil(count / 4);
  return {
    items: Array.from({ length: pages * 4 }, (_, index) => ({
      label: String(index + 1),
      detail: index < count ? "已写入" : "空槽",
      state: index < count ? "occupied" : "vacant"
    })),
    explanation: count + " 个 Token 需要 " + pages + " 页，共 " + pages * 4 +
      " 个槽位。最后一页空 " + (pages * 4 - count) + " 槽。拖过 4、8、12 的边界，观察整页分配怎样增加。这里仅展示单请求的逻辑页，物理页可以不连续。"
  };
};

window.workedExamples["rag"].experiment = {
  label: "候选数量 K · 先预测能否找到新版 A",
  min: 1, max: 3, initial: 1, unit: "条",
  compare(count) {
    return [
      ["检索候选数", count, "固定内积分数 B=3、A=2、C=1"],
      ["通过适用性过滤的证据数", count >= 2 ? 1 : 0, "A 是当前问题唯一有效证据"]
    ];
  },
  diagram(count) {
    const docs = [
      { label: "B · 旧版设备政策", detail: "14 天 · 已失效", state: "excluded" },
      { label: "A · 新版设备政策", detail: "7 天 · 5 月适用", state: "accepted" },
      { label: "C · 数字商品政策", detail: "商品类型不适用", state: "excluded" }
    ];
    return {
      items: docs.map((doc, index) => index < count ? doc : {
        label: doc.label, detail: "未进入 Top-" + count, state: "vacant"
      }),
      explanation: count === 1
        ? "只召回 B，时效过滤后没有证据。此时应说明无法确认当前期限。把 K 调到 2，看看 A 何时进入生成器可使用的材料。"
        : "A 已进入候选并通过过滤，可回答未拆封设备签收后 7 天内，引用 v2 §2。" +
          (count === 3 ? "新增 C 也被召回，但它属于数字商品，被适用范围过滤掉；此例继续扩大 K 没有增加有效证据。" : "B 因已失效被排除。")
    };
  }
};

window.workedExamples["llm-basics"].experiment = {
  label: "温度 T × 10 · 固定 logits 为 [0, ln 3]",
  min: 2, max: 20, initial: 10, unit: "",
  compare(value) {
    const t = value / 10;
    const b = 1 / (1 + Math.exp(-Math.log(3) / t));
    return [
      ["候选 A 的概率 %", (1 - b) * 100, "logit=0"],
      ["候选 B 的概率 %", b * 100, "logit=ln 3"]
    ];
  },
  diagram(value) {
    const t = value / 10;
    const b = 1 / (1 + Math.exp(-Math.log(3) / t));
    return {
      items: [
        { label: "A", detail: ((1 - b) * 100).toFixed(1) + "%", percent: (1 - b) * 100, state: "probability" },
        { label: "B", detail: (b * 100).toFixed(1) + "%", percent: b * 100, state: "probability" }
      ],
      explanation: "当前 T=" + t.toFixed(1) +
        "。先用 T 除每个 logit，再做 softmax。T=1 时 A=25%、B=75%；降低温度会让分布更集中。B 在所有正温度下都排名第一。条形长度表示概率，采样结果仍有随机性。"
    };
  }
};

window.workedExamples["transformer-architecture"].experiment.diagram = function (futureValue) {
  const futureWeight = Math.exp(4) / (2 + Math.exp(4));
  const unmasked = 10 / (2 + Math.exp(4)) + futureWeight * futureValue;
  return {
    items: [
      { label: "位置 1", detail: "V=2 · 有掩码权重 50%", percent: 50, state: "probability" },
      { label: "位置 2", detail: "V=8 · 有掩码权重 50%", percent: 50, state: "probability" },
      { label: "未来位置 3", detail: "V=" + futureValue + " · 有掩码权重 0%", state: "excluded" },
      { label: "当前输出", detail: "有掩码 5；无掩码 " + unmasked.toFixed(2), state: "accepted" }
    ],
    explanation: "查询位于位置 2。本例 logits=[0,0,4]；因果掩码把位置 3 屏蔽后，softmax=[0.5,0.5,0]，输出恒为 0.5×2+0.5×8=5。关闭掩码时，未来项权重约 " +
      (futureWeight * 100).toFixed(1) + "%，所以改变未来 V 会明显改变当前输出。这里修改 V，Q、K 及 logits 保持固定。"
  };
};

window.workedExamples["agent-workflows"].experiment = {
  label: "拖动回放恢复阶段 · 外部写入已成功，响应在中断中丢失",
  min: 0, max: 4, initial: 0, unit: "阶段",
  compare(stage) {
    return [
      ["外部文件数", 1, "同一业务键 export-42 对应一个已创建文件"],
      ["本地已验收记录数", stage === 4 ? 1 : 0, "只有最后一步验证文件内容后才计为完成"]
    ];
  },
  diagram(stage) {
    const labels = ["检查点", "中断", "恢复查状态", "复用已有文件", "验证并提交"];
    const details = ["128 条订单快照与 export-42 已保存", "写成功，响应丢失，本地结果未知", "用原业务键查询外部导出服务", "查到已有文件，绑定其引用", "核对 128 个唯一订单 ID 并保存成功"];
    return {
      items: labels.map((label, index) => ({
        label: (index + 1) + " · " + label,
        detail: index <= stage ? details[index] : "尚未执行",
        state: index === stage ? "accepted" : index < stage ? "occupied" : "vacant"
      })),
      explanation: [
        "预设教学故障为外部文件已经创建，但本地尚未记录响应。检查点中的业务键能用于恢复后查证，它本身还无法证明文件完成。",
        "进程中断后，外部文件仍存在。本地状态是未知，因此仅重放创建请求可能重复写入，具体取决于服务的幂等协议。",
        "恢复后先查 export-42。读取外部结果把未知状态转换为可观察状态，找到文件引用后再继续。",
        "复用已经找到的文件，并检查它对应的业务键和快照。当前只确认存在，接下来核验实际内容。",
        "核对文件可解析、列集合正确以及 128 个唯一订单 ID 完整后，保存本地成功记录。这个演示假设这些内容检查全部通过。"
      ][stage]
    };
  }
};

window.workedExamples["rsi-paired-eval"].experiment.diagram = function (gains) {
  return {
    items: Array.from({ length: 20 }, (_, index) => {
      const common = index < 8;
      const regression = index === 8;
      const improved = index >= 9 && index < 9 + gains;
      return {
        label: "任务 " + (index + 1),
        detail: common ? "旧 ✓ → 新 ✓" : regression ? "旧 ✓ → 新 ×" : improved ? "旧 × → 新 ✓" : "旧 × → 新 ×",
        state: common ? "occupied" : regression ? "excluded" : improved ? "accepted" : "vacant"
      };
    }),
    explanation: "每格代表同一道任务的新旧配对结果。共同成功固定为 8，回归固定为 1，新增成功为 " + gains +
      "，共同失败为 " + (11 - gains) + "。基线 9/20=45%，新版 " + (8 + gains) +
      "/20=" + ((8 + gains) * 5) + "%，净变化 (" + gains + "−1)/20=" + ((gains - 1) * 5) +
      " 个百分点。新增收益再大，任务 9 的回归仍需单独排查。这些数量都是教学设定。"
  };
};

window.workedExamples["dpo-calculations"].experiment.diagram = function (logit) {
  const probability = 1 / (1 + Math.exp(-logit));
  return {
    items: [
      { label: "校正差值 z", detail: String(logit) + " · β=1", state: "occupied" },
      { label: "σ(z)", detail: (100 * probability).toFixed(1) + "%", percent: probability * 100, state: "probability" },
      { label: "原标签损失", detail: Math.log1p(Math.exp(-logit)).toFixed(3), state: logit >= 0 ? "accepted" : "excluded" },
      { label: "互换标签损失", detail: Math.log1p(Math.exp(logit)).toFixed(3), state: logit <= 0 ? "accepted" : "excluded" }
    ],
    explanation: "先计算 z=β×[(logπ(A)−logπ(B))−(logπref(A)−logπref(B))]，再取 −logσ(z)。当前 z=" +
      logit + "。原标签损失为 " + Math.log1p(Math.exp(-logit)).toFixed(3) +
      "，互换标签后 z 取反，损失变为 " + Math.log1p(Math.exp(logit)).toFixed(3) +
      "。扫过 z=0 时，两条损失都等于 ln2≈0.693。σ(z) 是偏好目标中的变换值，不能当作实际任务正确率。"
  };
};

window.workedExamples["sft-peft"].experiment.diagram = function (rank) {
  return {
    items: [
      { label: "低秩矩阵 A", detail: rank + "×8 = " + rank * 8 + " 参数 · 可训练", state: "accepted" },
      { label: "低秩矩阵 B", detail: "8×" + rank + " = " + rank * 8 + " 参数 · 可训练", state: "accepted" },
      { label: "BA 的形状", detail: "8×8 · 秩至多 " + rank, state: "occupied" },
      { label: "基座矩阵 W", detail: "8×8 = 64 参数 · 冻结", state: "vacant" }
    ],
    explanation: "本例使用列向量，增量 ΔW=BA，A∈R^(r×8)、B∈R^(8×r)。适配器参数共 16r=" +
      rank * 16 + "，完整矩阵有 64 个参数。" +
      (rank < 4 ? "当前适配器参数少于完整矩阵。" : rank === 4 ? "r=4 时两者参数数目相同。" : "当前适配器参数已多于完整矩阵；秩越大，可训练参数越多。") +
      "这是 8×8 教学矩阵的计数，实际模型有多层和不同的适配目标，还可能有缩放或偏置项。"
  };
};

window.workedExamples["speculative-sampling"].experiment.diagram = function (draftA) {
  const acceptedA = Math.min(draftA, 60);
  const acceptedB = Math.min(100 - draftA, 40);
  const rejected = 100 - acceptedA - acceptedB;
  return {
    items: [
      { label: "验收路径 → A", detail: acceptedA + "% 概率质量", percent: acceptedA, state: "probability" },
      { label: "验收路径 → B", detail: acceptedB + "% 概率质量", percent: acceptedB, state: "probability" },
      { label: "拒绝修正路径", detail: rejected === 0 ? "0% · 无需修正" : rejected + "% → " + (draftA < 60 ? "A" : "B"), state: rejected ? "accepted" : "vacant" },
      { label: "最终分布", detail: "A=60% · B=40%", state: "occupied" }
    ],
    explanation: "目标固定 p(A)=0.6，草稿 q(A)=" + (draftA / 100).toFixed(2) +
      "。验收质量逐项取 min(p,q)，共 " + (acceptedA + acceptedB) +
      "%。剩余 " + rejected + "% 进入拒绝分支，按 max(p−q,0) 的归一化分布补偿。" +
      (draftA === 60 ? "本例两分布一致，全部验收。" : draftA < 60 ? "草稿给 A 的质量不足，拒绝分支只补给 A。" : "草稿给 B 的质量不足，拒绝分支只补给 B。") +
      "最终总分布始终是目标的 [0.6,0.4]；图中展示的是多次采样的路径概率。"
  };
};
