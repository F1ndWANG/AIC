"""Queue monitoring with persisted alert observations and nonzero exit on alert."""
import argparse
import json
import time

from .core import Loop


def inspect(loop, max_pending=1000, max_expired=0, max_quarantined=0):
    counts = dict(loop.db.execute(
        "SELECT COUNT(CASE WHEN state='PENDING' THEN 1 END) AS pending, "
        "COUNT(CASE WHEN state='RUNNING' AND lease_until<=? THEN 1 END) AS expired, "
        "COUNT(CASE WHEN state='QUARANTINED' THEN 1 END) AS quarantined FROM jobs",
        (time.time(),),
    ).fetchone())
    limits = {"pending": max_pending, "expired": max_expired, "quarantined": max_quarantined}
    if any(type(value) is not int or value < 0 for value in limits.values()):
        raise ValueError("Queue thresholds must be nonnegative integers")
    alerts = [name for name, count in counts.items() if count > limits[name]]
    result = {"counts": counts, "limits": limits, "alerts": alerts}
    with loop.db:
        loop.audit("queue_monitor", "queue", result)
    return result


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--root", default="runtime")
    parser.add_argument("--max-pending", type=int, default=1000)
    parser.add_argument("--max-expired", type=int, default=0)
    parser.add_argument("--max-quarantined", type=int, default=0)
    args = parser.parse_args()
    loop = Loop(args.root)
    try:
        report = inspect(loop, args.max_pending, args.max_expired, args.max_quarantined)
        print(json.dumps(report, ensure_ascii=False))
        return int(bool(report["alerts"]))
    finally:
        loop.close()


if __name__ == "__main__":
    raise SystemExit(main())
