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
    intro: "问题是“2026 年退货期限几天？”知识库有 2024 年 30 天版和 2026 年 7 天版。",
    question: "当只有 2024 年文档可查时，该如何处理？",
    answer: 2,
    choices: ["回答 30 天", "直接回答 7 天", "提示缺少 2026 年依据"],
    frames: [
      {"title": "召回两段证据", "state": "旧版：30 天 · 新版：7 天", "result": "初排旧版第 1", "action": "关键词相似度让旧版领先。", "reason": "文本相关不等于适用。"},
      {"title": "检查适用范围", "state": "目标年份 2026", "result": "旧版 2024 失效", "action": "把生效日期、版本等元数据纳入筛选。", "reason": "按问题所指定的时间判断证据适用性。"},
      {"title": "生成带来源的回答", "state": "7 天", "result": "引用 2026 年有效条款", "action": "用有效条款支持最终回答。", "reason": "引用应能让读者定位到包含数字的条文。"},
      {"title": "反事实复验", "state": "删除 2026 年条文", "result": "证据不足，需补查", "action": "重新运行相同查询。", "reason": "如果系统仍编出期限，说明证据约束有问题。"}
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
