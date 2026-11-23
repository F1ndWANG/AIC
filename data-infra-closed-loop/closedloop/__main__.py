import argparse
import json
import sqlite3
import sys
from pathlib import Path
from .core import Loop, LoopError
from .demo import run
from .video import ingest_video


def main():
    parser = argparse.ArgumentParser(description="可追溯数据闭环，本地参考实现")
    parser.add_argument("--root", default="runtime", help="运行数据目录（默认 runtime）")
    sub = parser.add_subparsers(dest="command", required=True)
    for name in ("init", "work", "status", "demo", "rollback"):
        sub.add_parser(name)
    p = sub.add_parser("ingest"); p.add_argument("file", help="JSONL 事件文件")
    p = sub.add_parser("ingest-video")
    p.add_argument("file")
    for field in ("event-id", "source", "group-id", "event-time"):
        p.add_argument("--" + field, required=True)
    p = sub.add_parser("test-report")
    p.add_argument("run_id")
    p = sub.add_parser("retry"); p.add_argument("sample_id")
    p = sub.add_parser("annotate")
    p.add_argument("sample_id"); p.add_argument("label", type=int)
    p.add_argument("--revision", type=int, required=True)
    p.add_argument("--author", required=True); p.add_argument("--reviewer", required=True)
    p = sub.add_parser("vote")
    p.add_argument("sample_id")
    p.add_argument("revision", type=int)
    p.add_argument("voter")
    p.add_argument("label", type=int)
    p = sub.add_parser("review")
    p.add_argument("sample_id")
    p.add_argument("revision", type=int)
    p.add_argument("reviewer")
    p.add_argument("--arbitration", type=int)
    p.add_argument("--reason")
    p = sub.add_parser("publish"); p.add_argument("release_id"); p.add_argument("members", help="JSON 成员数组")
    p = sub.add_parser("train"); p.add_argument("release_id")
    p = sub.add_parser("evaluate"); p.add_argument("run_id")
    p.add_argument("--min-accuracy", type=float, default=0.7)
    p.add_argument("--max-regression", type=float, default=0.0)
    p = sub.add_parser("deploy"); p.add_argument("evaluation_id")
    p = sub.add_parser("predict"); p.add_argument("sample_id"); p.add_argument("--request-id", required=True)
    p = sub.add_parser("feedback"); p.add_argument("feedback_id"); p.add_argument("prediction_id"); p.add_argument("label", type=int)
    p.add_argument("--source", required=True); p.add_argument("--available-at", required=True)
    p = sub.add_parser("mine"); p.add_argument("--budget", type=int, default=30); p.add_argument("--cutoff"); p.add_argument("--seed", type=int, default=42)
    p = sub.add_parser("lineage"); p.add_argument("prediction_id")
    p = sub.add_parser("finish"); p.add_argument("batch_id"); p.add_argument("release_id"); p.add_argument("run_id"); p.add_argument("baseline_id")
    args = parser.parse_args()
    loop = Loop(args.root)
    try:
        c = args.command
        if c in ("init", "status"): result = loop.status()
        elif c == "demo": result = run(loop)
        elif c == "work": result = loop.work()
        elif c == "ingest":
            result = []
            with Path(args.file).open(encoding="utf-8") as stream:
                for number, line in enumerate(stream, 1):
                    if line.strip():
                        try:
                            result.append(loop.ingest(json.loads(line)))
                        except (LoopError, ValueError) as exc:
                            raise LoopError(f"第 {number} 行: {exc}；此前成功行已提交，可幂等重放") from exc
        elif c == "ingest-video":
            result = ingest_video(loop, args.file, args.event_id, args.source, args.group_id, args.event_time)
        elif c == "test-report":
            result = loop.test_report(args.run_id)
        elif c == "retry": result = loop.retry(args.sample_id)
        elif c == "annotate": result = loop.annotate(args.sample_id, args.revision, args.label, args.author, args.reviewer)
        elif c == "vote": result = loop.vote(args.sample_id, args.revision, args.voter, args.label)
        elif c == "review": result = loop.review(args.sample_id, args.revision, args.reviewer, args.arbitration, args.reason)
        elif c == "publish": result = loop.publish(args.release_id, json.loads(Path(args.members).read_text(encoding="utf-8")))
        elif c == "train": result = loop.train(args.release_id)
        elif c == "evaluate": result = loop.evaluate(args.run_id, args.min_accuracy, args.max_regression)
        elif c == "deploy": result = loop.deploy(args.evaluation_id)
        elif c == "rollback": result = loop.rollback()
        elif c == "predict": result = loop.predict(args.sample_id, args.request_id)
        elif c == "feedback": result = loop.feedback(args.feedback_id, args.prediction_id, args.label, args.source, args.available_at)
        elif c == "mine": result = loop.mine(args.budget, args.cutoff, args.seed)
        elif c == "lineage": result = loop.lineage(args.prediction_id)
        elif c == "finish": result = loop.finish_iteration(args.batch_id, args.release_id, args.run_id, args.baseline_id)
        print(json.dumps(result, ensure_ascii=False, indent=2))
        return 0
    except (LoopError, sqlite3.Error, OSError, ValueError, KeyError, TypeError) as exc:
        print(json.dumps({"error": str(exc)}, ensure_ascii=False), file=sys.stderr)
        return 1
    finally:
        loop.close()


if __name__ == "__main__":
    sys.exit(main())
