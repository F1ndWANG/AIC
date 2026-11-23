# 从本地闭环扩展到规模化部署

| 能力 | 当前可运行路径 | 规模化验收条件 |
| --- | --- | --- |
| 视频接入 | FFprobe 探测首个视频流的前 900 个包，存原始字节和 SHA-256，提取时间戳统计 | 用实际编码、时长、VFR 和损坏文件矩阵测试；抽帧和近重复作为独立任务 |
| 标注 | 多人投票、独立复核、冲突仲裁、冻结修订 | 接入真实身份、分派、权限和标注平台 |
| 测试集 | 按模型运行固定成员摘要并记录独立结果 | 分离访问权限并限制模型选择过程对测试集的访问 |
| 数据平面 | SQLite 与本地对象存储 | PostgreSQL 事务吞吐、对象存储并发、失败重试和恢复演练 |
| 模型交付 | 本地验证、版本切换、回滚、反馈关联 | 业务模型、真实请求、灰度和成熟反馈窗口 |

视频特征包括中位帧间隔对应的速率、相对中位绝对离差、长间隔比例和非递增时间戳比例。它们量化时间戳节奏，无法识别固定帧率流中内容相同的重复帧。训练时应使用同一特征提取版本，并为同一原视频及其衍生版本配置相同的 group-id。对不可信媒体应在单独的受限工作进程中探测。

```sh
python3 -m closedloop ingest-video clip.mp4 --event-id clip-001 --source device-a --group-id original-001 --event-time 2026-11-23T00:00:00Z
python3 -m closedloop work
python3 -m closedloop vote SAMPLE_ID 1 labeler-a 1
python3 -m closedloop vote SAMPLE_ID 1 labeler-b 2
python3 -m closedloop review SAMPLE_ID 1 reviewer-c --arbitration 2 --reason "复核确认"
python3 -m closedloop test-report RUN_ID
```

复核后用现有 publish、train、evaluate、deploy 命令继续。测试集报告按运行保存，用于独立检查。当前 CLI 使用同一操作者权限，因此不具备盲测隔离。

挖掘按截止时间过滤接入、预测和反馈，保留预测 ID、反馈 ID 及抽样池。该能力不构成历史快照重放，当前样本状态和已发布划分仍会影响结果。现有上传与候选扫描应在容量实测后改造为分批消费，JSONL CLI 已逐行读入但仍会收集结果 ID。

规模化验收需要提供实际数据规模、峰值流量、延迟目标、存储与计算环境、保留策略及业务模型。当前版本尚未接入 PostgreSQL/S3、调度、监控或灰度平台，也没有业务吞吐或容灾结论。
