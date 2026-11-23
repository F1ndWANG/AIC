# 可追溯的数据闭环

本目录提供可直接运行的**本地闭环参考实现**，与 AIC 动效项目独立。Python 3.9+，仅使用标准库，无需安装数据库服务或下载模型。

已打通：接入 → 持久化 → 质检/隔离 → 人工标签修订 → 不可变数据发布 → 实际训练 → 评估门禁 → 本地模型路由 → 预测/反馈 → 候选挖掘 → 再标注/再训练 → 收益比较 → 回滚。

这里的“部署”指本机预测函数读取活动模型版本，不会发布到任何外部生产环境。当前任务为数值特征三分类，最近质心模型用于验证基础设施；不声称已经实现真实视频、IQA 或大模型训练。

## 立即运行

在终端进入本目录：

```bash
git clone https://github.com/F1ndWANG/AIC.git
cd AIC/data-infra-closed-loop
python3 -m closedloop --root runtime/demo demo
python3 -m closedloop --root runtime/demo status
python3 -m closedloop --root runtime/demo lineage request-0
python3 -m unittest discover -s tests -v
```

`demo` 要求空运行目录。重复演示请换目录，如 `--root runtime/demo-2`，系统不会清空已有数据。

演示输出保存在运行目录 `demo-report.json`，SQLite 中保留结构化实体和审计日志，对象目录保存内容寻址的数据、清单、模型和报告。

## 演示具体做了什么

1. 生成 66 条合成特征样本，固定 train / validation / test 划分；另导入一条无效样本验证隔离。
2. 由明确标记的模拟标注者和复核者导入标签，发布初始数据集。
3. 从训练样本真实计算三类质心，在验证集生成准确率、macro-F1、混淆矩阵、类别召回和来源切片。
4. 合成场景故意让训练数据缺少部分区域；用显式放宽的 0.6 准确率阈值进行本地初始部署，便于演示错误回流。
5. 新增 24 条线上模拟样本，记录实际预测版本，写入带来源和可用时间的反馈。
6. 按预算挖掘 18 条候选，经独立的模拟复核步骤生成标签，发布第二版数据并重新训练。
7. 在相同验证样本和标签修订上比较前后表现，通过门禁后切换本地模型，验证回滚，再恢复更新模型。
8. 保存闭环迭代记录，明确 `business_gain_verified=false`。

演示结果只证明合成场景和链路可运行。验证集用于门禁，test 成员不会用于训练或门禁；尚未提供最终盲测发布机制。真实业务收益需要独立样本、灰度流量和成熟反馈窗口验证。

## 实现与调研的对应关系

| 能力 | 当前实现 | 边界 |
|---|---|---|
| 原始接入 | JSONL、事件 ID 幂等、冲突拒绝 | 数值特征，不包含媒体上传/解码 |
| 对象存储 | SHA-256、完整写入后发布、读取校验 | 本地文件系统，未实现 S3 适配 |
| 可靠任务 | SQLite 状态、租约、重启恢复、旧租约提交拦截 | 质检任务，需主动运行 Worker；无分布式调度器 |
| 质检 | 结构、数值、维度、对象摘要、隔离重试 | 未实现视频语义质检和漂移检测 |
| 标签 | 不可覆盖修订、不同标注/复核者、选择最大修订号 | 可信操作员 CLI；无身份认证和标注 UI |
| 数据发布 | 固定对象/标签修订、事务登记、跨版本划分锁 | 精确重复和显式 group_id；无近重复模型 |
| 训练 | 最近质心分类器真实拟合、实现摘要 | 只支持整数标签 0/1/2 和同维数值特征 |
| 模型评估 | 固定验证集评估、来源/类别退化门禁 | 指标无置信区间；默认阈值仅为示例 |
| 部署/回滚 | 具体模型绑定、本地活动版本、基线变化拒绝 | 无 Kubernetes、服务端灰度或流量实验 |
| 反馈 | 关联实际预测/部署、幂等、可用时间截止 | 业务反馈不自动视为人工真值 |
| 挖掘 | 分歧/不确定性优先、随机预算、组与内容去重 | 分数未经校准；不是总体表现估计 |
| 迭代结论 | 候选入训检查、固定验证版本、前后指标 | 离线结论，不等于因果业务收益 |
| 血缘审计 | 预测 → 部署 → 训练 → 清单 → 成员 | 本地可写数据库，无防篡改审计系统 |

## 使用自己的数据

### 1. 接入与处理

```bash
python3 -m closedloop --root runtime/my-data init
python3 -m closedloop --root runtime/my-data ingest examples/events.jsonl
python3 -m closedloop --root runtime/my-data work
```

事件字段参见 `examples/events.jsonl`。`event_id` 表示一次业务事件，`group_id` 表示不可跨划分的同源单位；不同事件可共享相同内容。三类的业务语义需由任务规范明确，不在基础设施里默认解释成流畅等级。

接入输出 sample_id。JSONL 按行提交，某行失败时此前成功行保留；修复后可以重放文件。事件 ID 相同但内容变化会拒绝，修复原始数据应使用新事件并保留来源关系。

### 2. 导入经复核标签

```bash
python3 -m closedloop --root runtime/my-data annotate SAMPLE_ID 0 --revision 1 --author annotator-a --reviewer reviewer-b
```

替换 `SAMPLE_ID`。修订号越大越新，旧修订晚到也不会覆盖新标签。接口接受已完成复核的结果，两个名字不同只是本地校验，不构成独立身份认证。

### 3. 准备数据成员并发布

创建 JSON 文件，例如 `members.json`：

```json
[
  {"sample_id":"实际样本ID","split":"train"},
  {"sample_id":"另一实际样本ID","split":"validation"}
]
```

这只是格式示例。要训练与评估，train 和 validation 均须有三类，建议另外保留 test。每条成员需先通过质检并导入复核标签。相同 group_id 或相同特征内容禁止跨划分，且划分约束跨数据版本生效。

```bash
python3 -m closedloop --root runtime/my-data publish dataset-001 members.json
python3 -m closedloop --root runtime/my-data train dataset-001
python3 -m closedloop --root runtime/my-data evaluate RUN_ID --min-accuracy 0.8 --max-regression 0
python3 -m closedloop --root runtime/my-data deploy EVALUATION_ID
```

`RUN_ID` 和 `EVALUATION_ID` 使用上一步输出。评估检查验证集准确率，以及相对活动模型的类别召回、来源准确率退化；阈值由业务确认。评估与部署之间若活动基线变化，必须重新评估。

### 4. 预测、反馈、选数与下一轮

```bash
python3 -m closedloop --root runtime/my-data predict SAMPLE_ID --request-id request-001
python3 -m closedloop --root runtime/my-data feedback fb-001 request-001 1 --source reviewed-business-feedback --available-at 2026-11-24T00:00:00Z
python3 -m closedloop --root runtime/my-data mine --budget 30 --cutoff 2026-11-24T01:00:00Z
```

反馈可用时间必须不早于实际预测。这里的时间仅为命令格式示例，真实接入应填写实际时间。候选输出包含原因与 sample_id；反馈只影响候选优先级，后续仍需复核标签。已进入任何已发布划分的组或重复内容均不再挖掘，避免将保留集或已训练内容再次作为增量。

将选中成员完成标注，以 train 身份加入下一版数据，原验证成员和标签修订保持固定，再执行 publish / train / evaluate / deploy。

```bash
python3 -m closedloop --root runtime/my-data finish BATCH_ID NEW_RELEASE_ID NEW_RUN_ID BASELINE_RUN_ID
python3 -m closedloop --root runtime/my-data lineage request-001
python3 -m closedloop --root runtime/my-data rollback
```

`finish` 保存可审计的离线迭代结论；`rollback` 恢复上一个具体部署。原预测始终保留当时版本，不随当前活动模型变动。

## 故障恢复与存储

- Worker 处理到一半退出：重新执行 `work`，租约到期后可重新领取，默认租约 60 秒。旧 Worker 不能提交已过期或被重新领取的任务。
- 隔离样本：`retry SAMPLE_ID` 后执行 `work`。若原始内容确实无效，应导入修复后的新事件；直接重试不会自动修复。
- 对象损坏或缺失：清单读取和发布都会校验并失败；需要从可信备份恢复原内容。不要编辑哈希命名的对象来“修复标签”。
- 发布中断：未完成事务的版本不可见；未引用对象可能残留。当前不自动清理，避免误删有效版本。
- 本地备份：停止写入后备份整个运行目录，或使用 SQLite 在线备份 API 并协调对象快照；不要仅复制正在写入的数据库主文件而忽略 WAL。

`audit` 表记录事件、任务、发布、训练、评估、部署和反馈。运行目录请按实际数据权限管理；当前程序无鉴权，不应直接开放到公网。

## 后续接生产环境

接口边界已通过 Python 方法与 CLI 拆分，但尚未实现外部连接器。下一步按真实场景替换：本地对象存储 → S3；SQLite → PostgreSQL；数值接入 → 媒体/轨迹处理器；本地标签入口 → 标注平台；最近质心 → 实际训练框架；本地路由 → 模型服务与灰度系统。

还需建设：认证授权、删除/保留策略、完整标注工作流、定时编排/告警、线上评估与统计置信度、负载与容灾验证。原调研中的 Kafka / Flink / Iceberg / Feast 未被假装集成，需在容量和时效明确后再选择。

理论与资料见 [RESEARCH.md](RESEARCH.md)，实现入口见 [closedloop/core.py](closedloop/core.py)。
