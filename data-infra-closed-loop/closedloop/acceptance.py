"""Run the same acceptance checks against local or configured external stores."""
import argparse
import json
import os
import tempfile
import time
from concurrent.futures import ThreadPoolExecutor

from .core import Loop, LoopError, now
from .demo import run


def verify(root, workers, events):
    loop = Loop(root)
    try:
        if loop.status()["events"]:
            raise LoopError("Acceptance requires an empty, dedicated metadata database")
        demo = run(loop)
        if demo["rollback_restored"] != demo["initial_deployment"]:
            raise LoopError("Deployment rollback did not restore the initial model")
        if demo["iteration"]["accuracy_delta"] <= 0:
            raise LoopError("Synthetic feedback iteration failed to improve")
        loop.test_report(demo["updated_run"])
        for index in range(events):
            loop.ingest({"event_id": "acceptance-" + str(index),
                         "group_id": "acceptance-" + str(index), "source": "synthetic",
                         "event_time": now(), "features": [index, 0]})
        abandoned = loop.claim(lease_seconds=.05)
        time.sleep(.06)

        def drain():
            worker = Loop(root)
            try:
                return worker.work().get("READY", 0)
            finally:
                worker.close()

        begin = time.monotonic()
        with ThreadPoolExecutor(max_workers=workers) as executor:
            completed = sum(executor.map(lambda _: drain(), range(workers)))
        duration = time.monotonic() - begin
        recovered = loop.row("jobs", abandoned["id"])
        if completed != events or recovered["state"] != "SUCCEEDED" or recovered["attempts"] != 2:
            raise LoopError("Concurrent processing or expired lease recovery failed")
        try:
            loop.complete(abandoned)
        except LoopError:
            pass
        else:
            raise LoopError("Expired worker token was accepted")
        return {
            "metadata_backend": "postgresql" if os.getenv("CLOSEDLOOP_POSTGRES_DSN") else "sqlite",
            "object_backend": "s3" if loop.remote_objects else "filesystem",
            "workers": workers, "completed": completed,
            "queue_drain_seconds": duration, "queue_drain_jobs_per_second": completed / duration,
            "expired_lease_recovered": True, "rollback_verified": True,
            "synthetic_accuracy_delta": demo["iteration"]["accuracy_delta"],
        }
    finally:
        loop.close()


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--workers", type=int, default=4)
    parser.add_argument("--events", type=int, default=100)
    parser.add_argument("--external", action="store_true",
                        help="Allow writes to a dedicated empty configured database and S3 prefix")
    args = parser.parse_args()
    if not 1 <= args.workers <= 32 or not 1 <= args.events <= 100000:
        parser.error("workers must be 1–32 and events 1–100000")
    if not args.external and any(os.getenv(key) for key in (
            "CLOSEDLOOP_POSTGRES_DSN", "CLOSEDLOOP_S3_BUCKET")):
        parser.error("use --external explicitly to test configured external storage")
    with tempfile.TemporaryDirectory() as root:
        print(json.dumps(verify(root, args.workers, args.events), indent=2))


if __name__ == "__main__":
    main()
