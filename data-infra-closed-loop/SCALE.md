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

规模化验收需要提供实际数据规模、峰值流量、延迟目标、存储与计算环境、保留策略及业务模型。当前版本尚未完成 PostgreSQL/S3 联合验收，也尚未接入调度、监控或灰度平台，也没有业务吞吐或容灾结论。

## PostgreSQL 与 S3 集成

安装 `python3 -m pip install -r requirements-infra.txt`。不设置环境变量时继续使用 SQLite 和本地对象目录。

- `CLOSEDLOOP_POSTGRES_DSN` 指向本项目专用数据库。进程启动时创建所需表与索引。各写事务通过 PostgreSQL 事务级 advisory lock 串行，保留本地事务语义。跨进程可用性和吞吐需要实测，后续可将热点拆为行级锁或分区任务队列。
- `CLOSEDLOOP_S3_BUCKET` 指向事先创建的桶，通过 SDK 的凭证链配置访问。可配置 `CLOSEDLOOP_S3_PREFIX` 和 `CLOSEDLOOP_S3_ENDPOINT`。服务端必须支持条件 PUT，读取时应用仍核对 SHA-256。
- PostgreSQL 和 S3 可以分别启用。启用 S3 后，特征、数据清单、报告和模型对象写入桶，视频原件仍保存在本地运行目录的 media 下。
- 开关后使用独立的数据库和对象前缀做集成演示。现有 SQLite 历史需要显式迁移，配置开关不会复制数据。节点需使用一致的存储配置。
- `python3 -m closedloop work --limit 100` 可作为定时任务的单次处理入口。任务租约仍由元数据仓库管理。

在独立数据库和空对象前缀上运行 `python3 -m closedloop demo`，然后运行 `status` 和 `lineage request-0`，可覆盖版本发布、训练门禁、预测反馈和回滚。当前环境没有 PostgreSQL 服务，尚未执行真实后端联合验收。

## 内部 API 与持续 Worker

在共享元数据及对象配置下分别运行 `python3 -m closedloop.service` 和
`python3 -m closedloop.worker --batch 100 --poll 2`。API 自带的开发服务器监听环回地址；
跨机器部署使用 WSGI 容器加载 `create_app`，并由内部网关提供 TLS 和限流。
每个启用的角色使用独立随机令牌，最少 32 字节。

| 路径 | 令牌环境变量 | 请求参数 |
| --- | --- | --- |
| POST /v1/events | CLOSEDLOOP_TOKEN_WRITER | 与 JSONL 接入事件相同 |
| POST /v1/predictions | CLOSEDLOOP_TOKEN_INFERENCE | sample_id、request_id |
| POST /v1/feedback | CLOSEDLOOP_TOKEN_FEEDBACK | feedback_id、prediction_id、label、source、available_at |
| GET /v1/queue | CLOSEDLOOP_TOKEN_OPERATOR | 返回待执行、过期租约、隔离任务数 |
| GET /v1/status | CLOSEDLOOP_TOKEN_OPERATOR | 返回实体数量和活动模型 |

请求使用 `Authorization: Bearer <token>`，POST 使用 JSON。
`/healthz` 仅表示进程存活。Worker 支持正常退出以及异常退避，过期租约可由后续 Worker 回收。
可由外部监控系统轮询队列指标设置告警。标注操作仍使用现有 CLI。
