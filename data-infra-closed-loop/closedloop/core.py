"""Python 3.9+, standard library only. Local reference, not a production service."""
import hashlib
import json
import math
import os
import random
import sqlite3
import time
import uuid
from datetime import datetime, timezone
from pathlib import Path


class LoopError(ValueError):
    pass


def now():
    return datetime.now(timezone.utc).isoformat()


def encode(value):
    return json.dumps(value, sort_keys=True, ensure_ascii=False, allow_nan=False)


def digest(data):
    return hashlib.sha256(data).hexdigest()


def identifier(prefix):
    return prefix + "_" + uuid.uuid4().hex


def features(value):
    if not isinstance(value, list) or not value or any(
        isinstance(v, bool) or not isinstance(v, (float, int)) or not math.isfinite(v)
        for v in value
    ):
        raise LoopError("features 必须为非空、有限数值数组")
    return [float(v) for v in value]


def label(value):
    if type(value) is not int or value not in (0, 1, 2):
        raise LoopError("本参考任务标签仅接受整数 0/1/2")
    return value


def timestamp(value):
    try:
        parsed = datetime.fromisoformat(value.replace("Z", "+00:00"))
        if parsed.tzinfo is None:
            raise ValueError()
        return parsed.astimezone(timezone.utc).isoformat()
    except (ValueError, AttributeError, TypeError):
        raise LoopError("时间必须为带时区的 ISO 8601 字符串")


SCHEMA = """
PRAGMA foreign_keys=ON;
CREATE TABLE IF NOT EXISTS events(id TEXT PRIMARY KEY, digest TEXT NOT NULL, payload TEXT NOT NULL, created TEXT NOT NULL);
CREATE TABLE IF NOT EXISTS samples(id TEXT PRIMARY KEY, event_id TEXT UNIQUE REFERENCES events(id), source TEXT NOT NULL, group_id TEXT NOT NULL, object_hash TEXT NOT NULL, event_time TEXT NOT NULL, status TEXT NOT NULL, error TEXT);
CREATE TABLE IF NOT EXISTS jobs(id TEXT PRIMARY KEY, sample_id TEXT UNIQUE REFERENCES samples(id), state TEXT NOT NULL, attempts INTEGER NOT NULL DEFAULT 0, lease_until REAL, token TEXT, error TEXT);
CREATE TABLE IF NOT EXISTS annotations(id TEXT PRIMARY KEY, sample_id TEXT REFERENCES samples(id), revision INTEGER NOT NULL, label INTEGER NOT NULL, author TEXT NOT NULL, reviewer TEXT NOT NULL, created TEXT NOT NULL, UNIQUE(sample_id, revision));
CREATE TABLE IF NOT EXISTS releases(id TEXT PRIMARY KEY, manifest_hash TEXT NOT NULL, created TEXT NOT NULL);
CREATE TABLE IF NOT EXISTS split_groups(kind TEXT NOT NULL, value TEXT NOT NULL, split TEXT NOT NULL, PRIMARY KEY(kind,value));
CREATE TABLE IF NOT EXISTS runs(id TEXT PRIMARY KEY, release_id TEXT REFERENCES releases(id), artifact_hash TEXT NOT NULL, report_hash TEXT NOT NULL, created TEXT NOT NULL);
CREATE TABLE IF NOT EXISTS evaluations(id TEXT PRIMARY KEY, run_id TEXT REFERENCES runs(id), incumbent_id TEXT, report_hash TEXT NOT NULL, passed INTEGER NOT NULL, created TEXT NOT NULL);
CREATE TABLE IF NOT EXISTS deployments(id TEXT PRIMARY KEY, run_id TEXT REFERENCES runs(id), evaluation_id TEXT REFERENCES evaluations(id), previous_id TEXT, created TEXT NOT NULL);
CREATE TABLE IF NOT EXISTS active(slot TEXT PRIMARY KEY, deployment_id TEXT REFERENCES deployments(id));
CREATE TABLE IF NOT EXISTS predictions(id TEXT PRIMARY KEY, sample_id TEXT REFERENCES samples(id), deployment_id TEXT REFERENCES deployments(id), label INTEGER NOT NULL, probabilities TEXT NOT NULL, created TEXT NOT NULL);
CREATE TABLE IF NOT EXISTS feedback(id TEXT PRIMARY KEY, prediction_id TEXT REFERENCES predictions(id), label INTEGER NOT NULL, source TEXT NOT NULL, available_at TEXT NOT NULL, created TEXT NOT NULL);
CREATE TABLE IF NOT EXISTS batches(id TEXT PRIMARY KEY, payload TEXT NOT NULL, created TEXT NOT NULL);
CREATE TABLE IF NOT EXISTS iterations(id TEXT PRIMARY KEY, batch_id TEXT REFERENCES batches(id), release_id TEXT REFERENCES releases(id), run_id TEXT REFERENCES runs(id), baseline_id TEXT, payload TEXT NOT NULL, created TEXT NOT NULL);
CREATE TABLE IF NOT EXISTS audit(seq INTEGER PRIMARY KEY AUTOINCREMENT, action TEXT NOT NULL, entity TEXT NOT NULL, payload TEXT NOT NULL, created TEXT NOT NULL);
CREATE INDEX IF NOT EXISTS predictions_sample_time ON predictions(sample_id,created DESC,id DESC);
CREATE INDEX IF NOT EXISTS feedback_prediction_time ON feedback(prediction_id,available_at DESC,id DESC);
CREATE INDEX IF NOT EXISTS jobs_state_lease ON jobs(state,lease_until);
CREATE TABLE IF NOT EXISTS votes(
    sample_id TEXT NOT NULL REFERENCES samples(id),
    revision INTEGER NOT NULL, voter TEXT NOT NULL, label INTEGER NOT NULL,
    created TEXT NOT NULL, PRIMARY KEY(sample_id,revision,voter)
);
CREATE TABLE IF NOT EXISTS holdout_reports(run_id TEXT PRIMARY KEY REFERENCES runs(id), report_hash TEXT NOT NULL, created TEXT NOT NULL);

"""


class Loop:
    def __init__(self, root="runtime"):
        self.root = Path(root).resolve()
        self.objects = self.root / "objects"
        self.objects.mkdir(parents=True, exist_ok=True)
        from .storage import Postgres, S3Objects

        bucket = os.environ.get("CLOSEDLOOP_S3_BUCKET")
        self.remote_objects = S3Objects(bucket) if bucket else None
        dsn = os.environ.get("CLOSEDLOOP_POSTGRES_DSN")
        if dsn:
            self.db = Postgres(dsn, SCHEMA)
        else:
            self.db = sqlite3.connect(str(self.root / "metadata.sqlite"), timeout=30)
            self.db.row_factory = sqlite3.Row
            self.db.execute("PRAGMA journal_mode=WAL")
            self.db.executescript(SCHEMA)

    def close(self):
        self.db.close()

    def audit(self, action, entity, payload=None):
        self.db.execute("INSERT INTO audit(action,entity,payload,created) VALUES(?,?,?,?)",
                        (action, entity, encode(payload or {}), now()))

    def row(self, table, key):
        allowed = {"samples", "jobs", "events", "releases", "runs", "evaluations", "deployments", "predictions", "feedback", "batches", "iterations"}
        if table not in allowed:
            raise LoopError("未知实体")
        found = self.db.execute("SELECT * FROM " + table + " WHERE id=?", (key,)).fetchone()
        if found is None:
            raise LoopError(table + " 不存在: " + key)
        return dict(found)

    def put(self, value):
        raw = encode(value).encode("utf-8")
        key = digest(raw)
        if self.remote_objects:
            self.remote_objects.write(key, raw)
            return key
        target = self.objects / key
        temp = self.objects / ("staging-" + uuid.uuid4().hex)
        try:
            with temp.open("xb") as handle:
                handle.write(raw)
                handle.flush()
                os.fsync(handle.fileno())
            # A hard link publishes a complete file without replacing an existing object.
            try:
                os.link(str(temp), str(target))
            except FileExistsError:
                if target.read_bytes() != raw:
                    raise LoopError("对象摘要冲突或已被篡改")
        finally:
            temp.unlink(missing_ok=True)
        return key

    def get(self, key):
        if len(key) != 64 or any(c not in "0123456789abcdef" for c in key):
            raise LoopError("无效对象摘要")
        try:
            raw = self.remote_objects.read(key) if self.remote_objects else (self.objects / key).read_bytes()
        except FileNotFoundError:
            raise LoopError("对象缺失: " + key)
        if digest(raw) != key:
            raise LoopError("对象摘要校验失败: " + key)
        return json.loads(raw)

    def ingest(self, event):
        if not isinstance(event, dict):
            raise LoopError("事件必须为对象")
        for field in ("event_id", "source", "group_id", "event_time", "features"):
            if field not in event:
                raise LoopError("缺少字段 " + field)
        for field in ("event_id", "source", "group_id"):
            if not isinstance(event[field], str) or not event[field].strip():
                raise LoopError(field + " 不能为空")
        raw = encode(event)
        key = digest(raw.encode())
        sid = "s_" + digest(event["event_id"].encode())[:24]
        obj = self.put({"features": event["features"]})
        with self.db:
            old = self.db.execute("SELECT digest FROM events WHERE id=?", (event["event_id"],)).fetchone()
            if old:
                if old["digest"] != key:
                    raise LoopError("event_id 已存在且内容不同")
                return sid
            self.db.execute("INSERT INTO events VALUES(?,?,?,?)", (event["event_id"], key, raw, now()))
            self.db.execute("INSERT INTO samples VALUES(?,?,?,?,?,?,?,?)",
                            (sid, event["event_id"], event["source"], event["group_id"], obj,
                             timestamp(event["event_time"]), "PENDING", None))
            self.db.execute("INSERT INTO jobs(id,sample_id,state) VALUES(?,?,?)", ("j_" + sid, sid, "PENDING"))
            self.audit("ingest", sid, {"event_id": event["event_id"]})
        return sid

    def claim(self, lease_seconds=60):
        if lease_seconds <= 0:
            raise LoopError("租约时间必须为正数")
        self.db.execute("BEGIN IMMEDIATE")
        try:
            row = self.db.execute("SELECT * FROM jobs WHERE state='PENDING' OR (state='RUNNING' AND lease_until<=?) ORDER BY id LIMIT 1", (time.time(),)).fetchone()
            if not row:
                self.db.commit()
                return None
            token = identifier("lease")
            self.db.execute("UPDATE jobs SET state='RUNNING',attempts=attempts+1,lease_until=?,token=? WHERE id=?",
                            (time.time() + lease_seconds, token, row["id"]))
            self.audit("claim", row["id"], {"token": token})
            self.db.commit()
            result = dict(row)
            result["token"] = token
            return result
        except Exception:
            self.db.rollback()
            raise

    def complete(self, job):
        sample = self.row("samples", job["sample_id"])
        status, error = "READY", None
        try:
            features(self.get(sample["object_hash"])["features"])
        except (LoopError, KeyError) as exc:
            status, error = "QUARANTINED", str(exc)
        with self.db:
            cursor = self.db.execute("UPDATE jobs SET state=?,error=?,lease_until=NULL WHERE id=? AND state='RUNNING' AND token=? AND lease_until>?",
                                     ("SUCCEEDED" if status == "READY" else status, error,
                                      job["id"], job["token"], time.time()))
            if cursor.rowcount != 1:
                raise LoopError("租约失效，禁止旧 Worker 提交")
            self.db.execute("UPDATE samples SET status=?,error=? WHERE id=?", (status, error, sample["id"]))
            self.audit("quality", sample["id"], {"status": status, "error": error})
        return status

    def work(self, limit=None):
        counts = {}
        while limit is None or sum(counts.values()) < limit:
            job = self.claim()
            if job is None:
                return counts
            state = self.complete(job)
            counts[state] = counts.get(state, 0) + 1
        return counts

    def retry(self, sample_id):
        with self.db:
            sample = self.row("samples", sample_id)
            if sample["status"] != "QUARANTINED":
                raise LoopError("仅可重试隔离样本；修复应导入新事件保留原始记录")
            self.db.execute("UPDATE jobs SET state='PENDING',error=NULL WHERE sample_id=?", (sample_id,))
            self.db.execute("UPDATE samples SET status='PENDING',error=NULL WHERE id=?", (sample_id,))
            self.audit("retry", sample_id)

    def annotate(self, sample_id, revision, value, author, reviewer):
        label(value)
        if type(revision) is not int or revision < 1 or not author or not reviewer or author == reviewer:
            raise LoopError("需要正整数修订号及不同的标注者/复核者")
        aid = sample_id + ":" + str(revision)
        with self.db:
            if self.row("samples", sample_id)["status"] != "READY":
                raise LoopError("样本尚未通过质检")
            old = self.db.execute("SELECT * FROM annotations WHERE id=?", (aid,)).fetchone()
            if old:
                if (old["label"], old["author"], old["reviewer"]) != (value, author, reviewer):
                    raise LoopError("同一标签修订禁止覆盖")
                return aid
            self.db.execute("INSERT INTO annotations VALUES(?,?,?,?,?,?,?)", (aid, sample_id, revision, value, author, reviewer, now()))
            self.audit("annotation_verified", aid)
        return aid

    def vote(self, sample_id, revision, voter, value):
        label(value)
        if type(revision) is not int or revision < 1 or not voter.strip():
            raise LoopError("需要正整数修订号和投票人")
        with self.db:
            # Acquire the write lock before checking whether the round is frozen.
            self.db.execute("BEGIN IMMEDIATE")
            if self.row("samples", sample_id)["status"] != "READY":
                raise LoopError("样本尚未通过质检")
            old = self.db.execute(
                "SELECT label FROM votes WHERE sample_id=? AND revision=? AND voter=?",
                (sample_id, revision, voter),
            ).fetchone()
            if old:
                if old["label"] != value:
                    raise LoopError("同一轮投票禁止覆盖")
                return
            if self.db.execute("SELECT 1 FROM annotations WHERE sample_id=? AND revision=?",
                               (sample_id, revision)).fetchone():
                raise LoopError("标注轮次已冻结")
            self.db.execute("INSERT INTO votes VALUES(?,?,?,?,?)",
                            (sample_id, revision, voter, value, now()))
            self.audit("annotation_vote", sample_id, {"revision": revision, "voter": voter})

    def review(self, sample_id, revision, reviewer, arbitration=None, reason=None):
        with self.db:
            self.db.execute("BEGIN IMMEDIATE")
            votes = self.db.execute(
                "SELECT voter,label FROM votes WHERE sample_id=? AND revision=? ORDER BY voter",
                (sample_id, revision),
            ).fetchall()
            if len(votes) < 2 or not reviewer.strip() or reviewer in {v["voter"] for v in votes}:
                raise LoopError("需要至少两名投票人和独立复核人")
            labels = {v["label"] for v in votes}
            if len(labels) == 1:
                if arbitration is not None:
                    raise LoopError("一致投票无需仲裁")
                value = votes[0]["label"]
            else:
                if arbitration is None or not reason or not reason.strip():
                    raise LoopError("投票冲突，需要仲裁标签和理由")
                value = label(arbitration)
            aid = sample_id + ":" + str(revision)
            if self.db.execute("SELECT 1 FROM annotations WHERE id=?", (aid,)).fetchone():
                raise LoopError("标注轮次已冻结")
            self.db.execute("INSERT INTO annotations VALUES(?,?,?,?,?,?,?)",
                            (aid, sample_id, revision, value, votes[0]["voter"], reviewer, now()))
            self.audit("annotation_review", aid, {
                "votes": [dict(v) for v in votes], "reviewer": reviewer,
                "arbitration_reason": reason, "label": value,
            })
            return aid

    def publish(self, release_id, members):
        if not members:
            raise LoopError("不允许发布空数据集")
        self.db.execute("BEGIN IMMEDIATE")
        try:
            frozen, groups, hashes, seen = [], {}, {}, set()
            for member in members:
                sid, split = member["sample_id"], member["split"]
                if sid in seen or split not in ("train", "validation", "test"):
                    raise LoopError("成员重复或划分无效")
                seen.add(sid)
                sample = self.row("samples", sid)
                if sample["status"] != "READY":
                    raise LoopError("发布含未通过质检的样本")
                vector = features(self.get(sample["object_hash"])["features"])
                annotation = self.db.execute("SELECT * FROM annotations WHERE sample_id=? ORDER BY revision DESC LIMIT 1", (sid,)).fetchone()
                if annotation is None:
                    raise LoopError("缺少复核标签: " + sid)
                for kind, value, local in (("group", sample["group_id"], groups), ("hash", sample["object_hash"], hashes)):
                    old = self.db.execute("SELECT split FROM split_groups WHERE kind=? AND value=?", (kind, value)).fetchone()
                    if (value in local and local[value] != split) or (old and old["split"] != split):
                        raise LoopError("同源或重复内容跨划分: " + value)
                    local[value] = split
                    self.db.execute("INSERT INTO split_groups VALUES(?,?,?) ON CONFLICT DO NOTHING", (kind, value, split))
                frozen.append({"sample_id": sid, "split": split, "object_hash": sample["object_hash"],
                               "group_id": sample["group_id"], "source": sample["source"],
                               "annotation_revision_id": annotation["id"], "label": annotation["label"],
                               "dimension": len(vector)})
            if len({m["dimension"] for m in frozen}) != 1:
                raise LoopError("特征维度不一致")
            manifest = {"schema_version": 1, "task": "three_class_numeric_features", "members": sorted(frozen, key=lambda m: m["sample_id"])}
            key = self.put(manifest)
            old = self.db.execute("SELECT manifest_hash FROM releases WHERE id=?", (release_id,)).fetchone()
            if old:
                if old["manifest_hash"] != key:
                    raise LoopError("发布 ID 已存在，禁止覆盖")
            else:
                self.db.execute("INSERT INTO releases VALUES(?,?,?)", (release_id, key, now()))
                self.audit("release_ready", release_id, {"manifest_hash": key})
            self.db.commit()
            return release_id
        except Exception:
            self.db.rollback()
            raise

    def dataset(self, release_id):
        manifest = self.get(self.row("releases", release_id)["manifest_hash"])
        rows = []
        for m in manifest["members"]:
            rows.append(dict(m, features=features(self.get(m["object_hash"])["features"])))
        return rows

    def train(self, release_id):
        data = self.dataset(release_id)
        train = [m for m in data if m["split"] == "train"]
        if set(m["label"] for m in train) != {0, 1, 2}:
            raise LoopError("训练集必须包含全部三类")
        centers = []
        for cls in range(3):
            rows = [m["features"] for m in train if m["label"] == cls]
            centers.append([sum(values) / len(rows) for values in zip(*rows)])
        artifact = {"algorithm": "nearest_centroid_v1", "centers": centers,
                    "dimension": len(centers[0]), "release_id": release_id,
                    "manifest_hash": self.row("releases", release_id)["manifest_hash"],
                    "implementation_sha256": digest(Path(__file__).read_bytes())}
        report = self.metrics(artifact, [m for m in data if m["split"] == "validation"])
        run_id = identifier("run")
        with self.db:
            self.db.execute("INSERT INTO runs VALUES(?,?,?,?,?)", (run_id, release_id, self.put(artifact), self.put(report), now()))
            self.audit("trained", run_id, {"release_id": release_id})
        return run_id

    @staticmethod
    def classify(artifact, vector):
        vector = features(vector)
        if len(vector) != artifact["dimension"]:
            raise LoopError("特征维度与模型不匹配")
        distances = [sum((a-b)**2 for a, b in zip(vector, center)) for center in artifact["centers"]]
        minimum = min(distances)
        weights = [math.exp(-(d-minimum)) for d in distances]
        probabilities = [w/sum(weights) for w in weights]
        # Distance-softmax values are scores, not calibrated probabilities.
        return min(range(3), key=lambda c: distances[c]), probabilities

    def metrics(self, artifact, data):
        if not data:
            raise LoopError("评估集不能为空")
        matrix = [[0]*3 for _ in range(3)]
        slices = {}
        for m in data:
            predicted, _ = self.classify(artifact, m["features"])
            matrix[m["label"]][predicted] += 1
            entry = slices.setdefault(m["source"], {"count": 0, "correct": 0})
            entry["count"] += 1
            entry["correct"] += int(predicted == m["label"])
        recall, f1 = [], []
        for c in range(3):
            tp, actual, selected = matrix[c][c], sum(matrix[c]), sum(row[c] for row in matrix)
            recall.append(tp/actual if actual else None)
            f1.append(2*tp/(actual+selected) if actual+selected else 0.0)
        return {"count": len(data), "accuracy": sum(matrix[c][c] for c in range(3))/len(data),
                "macro_f1": sum(f1)/3, "recall": recall, "confusion_matrix": matrix,
                "slices": {s: dict(v, accuracy=v["correct"]/v["count"]) for s, v in slices.items()}}

    def test_report(self, run_id):
        """Persist an evaluation of frozen test members without affecting routing."""
        run = self.row("runs", run_id)
        manifest_hash = self.row("releases", run["release_id"])["manifest_hash"]
        members = self.get(manifest_hash)["members"]
        data = [
            dict(member, features=features(self.get(member["object_hash"])["features"]))
            for member in members if member["split"] == "test"
        ]
        if {member["label"] for member in data} != {0, 1, 2}:
            raise LoopError("测试集必须覆盖三类")
        report = {"run_id": run_id, "manifest_hash": manifest_hash,
                  "model_hash": run["artifact_hash"], "split": "test",
                  "metrics": self.metrics(self.get(run["artifact_hash"]), data)}
        report_hash = self.put(report)
        with self.db:
            inserted = self.db.execute(
                "INSERT INTO holdout_reports VALUES(?,?,?) ON CONFLICT DO NOTHING",
                (run_id, report_hash, now()),
            )
            if inserted.rowcount:
                self.audit("holdout_evaluated", run_id, {"report_hash": report_hash})
            stored = self.db.execute(
                "SELECT report_hash FROM holdout_reports WHERE run_id=?", (run_id,)
            ).fetchone()["report_hash"]
        return dict(self.get(stored), report_hash=stored)

    def active(self):
        row = self.db.execute("SELECT deployment_id FROM active WHERE slot='local'").fetchone()
        return self.row("deployments", row["deployment_id"]) if row else None

    def evaluate(self, run_id, min_accuracy=0.7, max_regression=0.0):
        if not 0 <= min_accuracy <= 1 or not 0 <= max_regression <= 1:
            raise LoopError("门禁阈值必须位于 [0,1]")
        run = self.row("runs", run_id)
        data = [m for m in self.dataset(run["release_id"]) if m["split"] == "validation"]
        candidate = self.metrics(self.get(run["artifact_hash"]), data)
        if any(r is None for r in candidate["recall"]):
            raise LoopError("验证集必须覆盖三类")
        incumbent = self.active()
        baseline = None
        if incumbent:
            oldrun = self.row("runs", incumbent["run_id"])
            baseline = self.metrics(self.get(oldrun["artifact_hash"]), data)
        passed = candidate["accuracy"] >= min_accuracy
        if baseline:
            passed = passed and candidate["accuracy"] >= baseline["accuracy"] - max_regression
            passed = passed and all(candidate["recall"][i] >= baseline["recall"][i] - max_regression for i in range(3))
            passed = passed and all(candidate["slices"][s]["accuracy"] >= baseline["slices"][s]["accuracy"] - max_regression for s in candidate["slices"])
        report = {"candidate": candidate, "baseline": baseline, "passed": passed,
                  "policy": {"min_accuracy": min_accuracy, "max_regression": max_regression},
                  "protocol": "validation_only_v1", "release_id": run["release_id"]}
        eid = identifier("eval")
        with self.db:
            self.db.execute("INSERT INTO evaluations VALUES(?,?,?,?,?,?)",
                            (eid, run_id, incumbent["id"] if incumbent else None, self.put(report), int(passed), now()))
            self.audit("evaluated", eid, report)
        return dict(report, evaluation_id=eid)

    def deploy(self, evaluation_id):
        self.db.execute("BEGIN IMMEDIATE")
        try:
            evaluation = self.row("evaluations", evaluation_id)
            incumbent = self.active()
            if not evaluation["passed"] or evaluation["incumbent_id"] != (incumbent["id"] if incumbent else None):
                raise LoopError("门禁未通过或基线部署已变化，请重新评估")
            self.get(self.row("runs", evaluation["run_id"])["artifact_hash"])
            did = identifier("deploy")
            self.db.execute("INSERT INTO deployments VALUES(?,?,?,?,?)", (did, evaluation["run_id"], evaluation_id, evaluation["incumbent_id"], now()))
            self.db.execute("INSERT INTO active VALUES('local',?) ON CONFLICT(slot) DO UPDATE SET deployment_id=excluded.deployment_id", (did,))
            self.audit("deployed_local", did)
            self.db.commit()
            return did
        except Exception:
            self.db.rollback()
            raise

    def rollback(self):
        self.db.execute("BEGIN IMMEDIATE")
        try:
            active = self.active()
            if not active or not active["previous_id"]:
                raise LoopError("无上一部署可回滚")
            previous = self.row("deployments", active["previous_id"])
            self.get(self.row("runs", previous["run_id"])["artifact_hash"])
            self.db.execute("UPDATE active SET deployment_id=? WHERE slot='local'", (previous["id"],))
            self.audit("rollback", active["id"], {"restored": previous["id"]})
            self.db.commit()
            return previous["id"]
        except Exception:
            self.db.rollback()
            raise

    def predict(self, sample_id, request_id):
        with self.db:
            existing = self.db.execute("SELECT * FROM predictions WHERE id=?", (request_id,)).fetchone()
            if existing:
                if existing["sample_id"] != sample_id:
                    raise LoopError("request_id 对应其他样本")
                return dict(existing)
            deployment = self.active()
            if deployment is None:
                raise LoopError("尚无活动部署")
            sample = self.row("samples", sample_id)
            if sample["status"] != "READY":
                raise LoopError("样本未通过质检")
            run = self.row("runs", deployment["run_id"])
            value, probabilities = self.classify(self.get(run["artifact_hash"]), self.get(sample["object_hash"])["features"])
            self.db.execute("INSERT INTO predictions VALUES(?,?,?,?,?,?)", (request_id, sample_id, deployment["id"], value, encode(probabilities), now()))
            self.audit("predicted", request_id)
        return self.row("predictions", request_id)

    def feedback(self, feedback_id, prediction_id, value, source, available_at):
        label(value)
        if not source:
            raise LoopError("反馈来源不能为空")
        available_at = timestamp(available_at)
        with self.db:
            prediction = self.row("predictions", prediction_id)
            if available_at < prediction["created"]:
                raise LoopError("反馈可用时间早于预测")
            old = self.db.execute("SELECT * FROM feedback WHERE id=?", (feedback_id,)).fetchone()
            values = (prediction_id, value, source, available_at)
            if old:
                if tuple(old[k] for k in ("prediction_id", "label", "source", "available_at")) != values:
                    raise LoopError("反馈 ID 冲突")
                return feedback_id
            self.db.execute("INSERT INTO feedback VALUES(?,?,?,?,?,?)", (feedback_id,) + values + (now(),))
            self.audit("feedback", feedback_id)
        return feedback_id

    def mine(self, budget=30, cutoff=None, seed=42):
        if budget <= 0:
            raise LoopError("预算必须为正数")
        cutoff = timestamp(cutoff) if cutoff else now()
        candidates = []
        eligible = self.db.execute("SELECT s.* FROM samples s JOIN events e ON s.event_id=e.id WHERE s.status='READY' AND e.created<=? AND s.event_time<=? ORDER BY s.id", (cutoff, cutoff))
        for sample in eligible:
            # Never promote established validation/test content into training candidates.
            locked = self.db.execute("SELECT split FROM split_groups WHERE (kind='group' AND value=?) OR (kind='hash' AND value=?)", (sample["group_id"], sample["object_hash"])).fetchall()
            if locked:
                continue
            prediction = self.db.execute("SELECT * FROM predictions WHERE sample_id=? AND created<=? ORDER BY created DESC,id DESC LIMIT 1", (sample["id"], cutoff)).fetchone()
            fb = None
            reason = "random_coverage"
            if prediction:
                fb = self.db.execute("SELECT * FROM feedback WHERE prediction_id=? AND available_at<=? AND created<=? ORDER BY available_at DESC,id DESC LIMIT 1", (prediction["id"], cutoff, cutoff)).fetchone()
                if fb and fb["label"] != prediction["label"]:
                    reason = "feedback_disagreement_requires_review"
                elif max(json.loads(prediction["probabilities"])) < 0.65:
                    reason = "uncertain_score"
            candidates.append({"sample_id": sample["id"], "group_id": sample["group_id"], "object_hash": sample["object_hash"], "reason": reason,
                               "prediction_id": prediction["id"] if prediction else None,
                               "feedback_id": fb["id"] if fb else None})
        rng = random.Random(seed)
        rng.shuffle(candidates)
        priority = {"feedback_disagreement_requires_review": 0, "uncertain_score": 1, "random_coverage": 2}
        priority_pool = sorted(candidates, key=lambda m: priority[m["reason"]])
        # Reserve a random portion; inclusion probabilities are not estimated here.
        chosen, seen = [], set()
        random_quota = max(1, budget//4)
        for pool, limit in ((candidates, random_quota), (priority_pool, budget)):
            for m in pool:
                if len(chosen) >= limit:
                    break
                key = (m["group_id"], m["object_hash"])
                if m["group_id"] in seen or m["object_hash"] in seen:
                    continue
                seen.update(key)
                chosen.append(dict(m, selection_pool="random" if pool is candidates else "priority"))
                if len(chosen) >= limit:
                    break
        bid = identifier("batch")
        payload = {"strategy": "review_priority_random_v2", "seed": seed, "cutoff": cutoff, "budget": budget, "members": chosen}
        with self.db:
            self.db.execute("INSERT INTO batches VALUES(?,?,?)", (bid, encode(payload), now()))
            self.audit("mined", bid, {"count": len(chosen)})
        return dict(payload, batch_id=bid)

    def finish_iteration(self, batch_id, release_id, run_id, baseline_id):
        batch = json.loads(self.row("batches", batch_id)["payload"])
        run = self.row("runs", run_id)
        if run["release_id"] != release_id:
            raise LoopError("运行与数据版本不匹配")
        data = self.dataset(release_id)
        train_ids = {m["sample_id"] for m in data if m["split"] == "train"}
        if not batch["members"] or not set(m["sample_id"] for m in batch["members"]).issubset(train_ids):
            raise LoopError("候选批次未全部经过标注进入训练集")
        base = self.row("runs", baseline_id)
        old_data = self.dataset(base["release_id"])
        old_train_ids = {m["sample_id"] for m in old_data if m["split"] == "train"}
        batch_ids = {m["sample_id"] for m in batch["members"]}
        if batch_ids & old_train_ids or not old_train_ids.issubset(train_ids):
            raise LoopError("增量比较需保留基线训练样本，且候选不能已在基线训练集中")
        old_validation = [m for m in old_data if m["split"] == "validation"]
        new_validation = [m for m in data if m["split"] == "validation"]
        signature = lambda rows: sorted((m["sample_id"],m["object_hash"],m["annotation_revision_id"]) for m in rows)
        if signature(old_validation) != signature(new_validation):
            raise LoopError("闭环收益比较要求固定验证样本及标签修订")
        before = self.metrics(self.get(base["artifact_hash"]), new_validation)
        after = self.metrics(self.get(run["artifact_hash"]), new_validation)
        result = {"before": before, "after": after, "accuracy_delta": after["accuracy"]-before["accuracy"],
                  "conclusion": "offline_improved" if after["accuracy"]>before["accuracy"] else "no_offline_accuracy_gain",
                  "business_gain_verified": False}
        iid = identifier("loop")
        with self.db:
            self.db.execute("INSERT INTO iterations VALUES(?,?,?,?,?,?,?)", (iid, batch_id, release_id, run_id, baseline_id, encode(result), now()))
            self.audit("iteration_completed", iid, result)
        return dict(result, iteration_id=iid)

    def lineage(self, prediction_id):
        prediction = self.row("predictions", prediction_id)
        deployment = self.row("deployments", prediction["deployment_id"])
        run = self.row("runs", deployment["run_id"])
        release = self.row("releases", run["release_id"])
        return {"prediction": prediction, "deployment": deployment, "training_run": run,
                "dataset_release": release, "manifest": self.get(release["manifest_hash"]),
                "input_sample": self.row("samples", prediction["sample_id"])}

    def status(self):
        tables = ("events", "samples", "annotations", "releases", "runs", "evaluations", "deployments", "predictions", "feedback", "batches", "iterations", "audit")
        counts = {t: self.db.execute("SELECT COUNT(*) AS n FROM " + t).fetchone()["n"] for t in tables}
        counts["jobs"] = {r["state"]: r["n"] for r in self.db.execute("SELECT state,COUNT(*) n FROM jobs GROUP BY state")}
        counts["active_deployment"] = self.active()
        return counts
