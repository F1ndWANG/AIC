"""Synthetic features, explicit simulated reviewers; no claim of video model quality."""
import json
import random
from .core import LoopError, now


def run(loop):
    if loop.status()["events"]:
        raise LoopError("demo 需要空目录；请指定新的 --root，已有数据不会删除")
    rng = random.Random(42)
    members = []
    for split, count in (("train", 8), ("validation", 8), ("test", 6)):
        for cls in range(3):
            for i in range(count):
                # Deliberately undercovered class-1 training region.
                center = {0: -3.0, 1: 0.0 if split == "train" else 1.6, 2: 3.0}[cls]
                event = {"event_id": "%s-%s-%s" % (split, cls, i), "source": "synthetic_device_a",
                         "group_id": "%s-group-%s-%s" % (split, cls, i), "event_time": now(),
                         "features": [center+rng.uniform(-0.08, 0.08), rng.uniform(-0.05, 0.05)]}
                sid = loop.ingest(event)
                members.append({"sample_id": sid, "split": split, "truth": cls})
    invalid = loop.ingest({"event_id": "invalid", "source": "synthetic", "group_id": "invalid", "event_time": now(), "features": []})
    quality = loop.work()
    for m in members:
        loop.annotate(m["sample_id"], 1, m["truth"], "simulated_annotator", "simulated_reviewer")
    release1 = loop.publish("dataset_initial", members)
    run1 = loop.train(release1)
    # Explicitly relaxed bootstrap threshold for this synthetic failure scenario.
    gate1 = loop.evaluate(run1, min_accuracy=0.6)
    deployment1 = loop.deploy(gate1["evaluation_id"])
    online = []
    for i in range(24):
        sid = loop.ingest({"event_id": "online-%s" % i, "source": "synthetic_device_b",
                           "group_id": "online-group-%s" % i, "event_time": now(),
                           "features": [1.6+rng.uniform(-0.08, 0.08), rng.uniform(-0.05, 0.05)]})
        online.append(sid)
    loop.work()
    for i, sid in enumerate(online):
        prediction = loop.predict(sid, "request-%s" % i)
        loop.feedback("feedback-%s" % i, prediction["id"], 1, "simulated_review", now())
    batch = loop.mine(budget=18)
    for m in batch["members"]:
        # Feedback never silently becomes a verified label: review is explicit.
        loop.annotate(m["sample_id"], 1, 1, "simulated_annotator", "simulated_reviewer")
    extended = members + [dict(m, split="train") for m in batch["members"]]
    release2 = loop.publish("dataset_iteration_1", extended)
    run2 = loop.train(release2)
    gate2 = loop.evaluate(run2, min_accuracy=0.8)
    deployment2 = loop.deploy(gate2["evaluation_id"])
    iteration = loop.finish_iteration(batch["batch_id"], release2, run2, run1)
    after = loop.predict(online[0], "request-after-update")
    restored = loop.rollback()
    loop.deploy(loop.evaluate(run2, min_accuracy=0.8)["evaluation_id"])
    summary = {"scenario": "synthetic_numeric_features_not_real_video", "quality": quality,
               "quarantined_sample": invalid, "initial_run": run1, "updated_run": run2,
               "initial_deployment": deployment1, "updated_deployment": deployment2,
               "rollback_restored": restored, "iteration": iteration,
               "after_update_prediction": after, "status": loop.status()}
    output = loop.root / "demo-report.json"
    output.write_text(json.dumps(summary, ensure_ascii=False, indent=2), encoding="utf-8")
    return summary
