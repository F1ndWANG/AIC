import copy
import json
import tempfile
import unittest
from pathlib import Path

from closedloop.core import Loop, LoopError, now
from closedloop.demo import run


class LoopTests(unittest.TestCase):
    def setUp(self):
        self.temp = tempfile.TemporaryDirectory()
        self.loop = Loop(self.temp.name)

    def tearDown(self):
        self.loop.close()
        self.temp.cleanup()

    def event(self, eid="event", vector=None, group=None):
        return {"event_id": eid, "source": "test", "group_id": group or eid,
                "event_time": "2026-01-01T00:00:00+00:00", "features": vector if vector is not None else [0.1, 0.2]}

    def sample(self, eid="event", vector=None, group=None):
        sid = self.loop.ingest(self.event(eid, vector, group))
        self.loop.work()
        self.loop.annotate(sid, 1, 0, "annotator", "reviewer")
        return sid

    def test_ingestion_replay_and_conflict(self):
        event = self.event()
        first = self.loop.ingest(event)
        self.assertEqual(first, self.loop.ingest(event))
        event["source"] = "changed"
        with self.assertRaises(LoopError): self.loop.ingest(event)
        self.assertEqual(self.loop.status()["events"], 1)

    def test_atomic_reject_invalid_timestamp(self):
        event = self.event()
        event["event_time"] = "bad"
        with self.assertRaises(LoopError): self.loop.ingest(event)
        self.assertEqual(self.loop.status()["events"], 0)

    def test_quarantine_and_retry(self):
        sid = self.loop.ingest(self.event(vector=[]))
        self.assertEqual(self.loop.work(), {"QUARANTINED": 1})
        with self.assertRaises(LoopError): self.loop.annotate(sid, 1, 0, "a", "b")
        self.loop.retry(sid)
        self.assertEqual(self.loop.work(), {"QUARANTINED": 1})

    def test_crashed_worker_reclaimed_and_old_token_fenced(self):
        sid = self.loop.ingest(self.event())
        old = self.loop.claim()
        with self.loop.db:
            self.loop.db.execute("UPDATE jobs SET lease_until=0 WHERE id=?", (old["id"],))
        # Simulates process restart after a worker died while holding a lease.
        self.loop.close()
        self.loop = Loop(self.temp.name)
        new = self.loop.claim()
        with self.assertRaises(LoopError): self.loop.complete(old)
        self.assertEqual(self.loop.complete(new), "READY")
        self.assertEqual(self.loop.row("samples", sid)["status"], "READY")

    def test_annotation_order_and_snapshot_freeze(self):
        sid = self.sample()
        self.loop.annotate(sid, 3, 2, "a", "b")
        self.loop.annotate(sid, 2, 1, "a", "b")
        self.loop.publish("v1", [{"sample_id": sid, "split": "train"}])
        self.assertEqual(self.loop.dataset("v1")[0]["label"], 2)
        self.loop.annotate(sid, 4, 1, "a", "b")
        self.assertEqual(self.loop.dataset("v1")[0]["label"], 2)
        with self.assertRaises(LoopError): self.loop.annotate(sid, 4, 0, "a", "b")
        with self.assertRaises(LoopError): self.loop.publish("v1", [{"sample_id": sid, "split": "train"}])

    def test_same_group_cross_split_rejected_transactionally(self):
        one = self.sample("one", [1.0], "video")
        two = self.sample("two", [2.0], "video")
        with self.assertRaises(LoopError):
            self.loop.publish("bad", [{"sample_id": one, "split": "train"}, {"sample_id": two, "split": "test"}])
        self.assertEqual(self.loop.db.execute("SELECT COUNT(*) FROM split_groups").fetchone()[0], 0)
        self.assertEqual(self.loop.status()["releases"], 0)

    def test_exact_duplicate_cannot_cross_release_split(self):
        one = self.sample("one", [1.0])
        two = self.sample("two", [1.0])
        self.loop.publish("v1", [{"sample_id": one, "split": "test"}])
        with self.assertRaises(LoopError): self.loop.publish("v2", [{"sample_id": two, "split": "train"}])

    def test_missing_and_tampered_object_block_publication(self):
        sid = self.sample()
        key = self.loop.row("samples", sid)["object_hash"]
        path = self.loop.objects / key
        original = path.read_bytes()
        path.write_text("{}")
        with self.assertRaises(LoopError): self.loop.publish("bad", [{"sample_id": sid, "split": "train"}])
        path.write_bytes(original)
        path.unlink()
        with self.assertRaises(LoopError): self.loop.publish("bad", [{"sample_id": sid, "split": "train"}])
        self.assertEqual(self.loop.status()["releases"], 0)

    def test_training_requires_full_class_coverage(self):
        sid = self.sample()
        self.loop.publish("v1", [{"sample_id": sid, "split": "train"}])
        with self.assertRaises(LoopError): self.loop.train("v1")

    def test_mining_budget_dedup_and_holdout_exclusion(self):
        one = self.sample("one", [1.0])
        self.sample("duplicate", [1.0])
        self.sample("two", [2.0])
        self.loop.publish("held", [{"sample_id": one, "split": "test"}])
        batch = self.loop.mine(1)
        self.assertEqual(len(batch["members"]), 1)
        self.assertNotEqual(batch["members"][0]["sample_id"], one)
        self.assertNotEqual(batch["members"][0]["object_hash"], self.loop.row("samples", one)["object_hash"])

    def test_full_loop_real_training_feedback_lineage_and_rollback(self):
        result = run(self.loop)
        self.assertGreater(result["iteration"]["accuracy_delta"], 0)
        self.assertFalse(result["iteration"]["business_gain_verified"])
        self.assertEqual(result["rollback_restored"], result["initial_deployment"])
        lineage = self.loop.lineage("request-0")
        self.assertEqual(lineage["training_run"]["id"], result["initial_run"])
        self.assertEqual(lineage["dataset_release"]["id"], "dataset_initial")
        self.assertEqual(self.loop.predict(lineage["input_sample"]["id"], "request-0")["deployment_id"], result["initial_deployment"])
        with self.assertRaises(LoopError): self.loop.predict("missing", "request-0")

    def test_failed_gate_and_stale_gate_cannot_deploy(self):
        result = run(self.loop)
        failed = self.loop.evaluate(result["initial_run"], min_accuracy=0.9)
        self.assertFalse(failed["passed"])
        with self.assertRaises(LoopError): self.loop.deploy(failed["evaluation_id"])
        good = self.loop.evaluate(result["updated_run"], min_accuracy=0.8)
        self.loop.rollback()
        with self.assertRaises(LoopError): self.loop.deploy(good["evaluation_id"])

    def test_feedback_idempotency_and_time(self):
        run(self.loop)
        args = ("extra", "request-0", 1, "human", now())
        self.assertEqual(self.loop.feedback(*args), self.loop.feedback(*args))
        with self.assertRaises(LoopError): self.loop.feedback("extra", "request-0", 2, "human", args[-1])
        with self.assertRaises(LoopError): self.loop.feedback("past", "request-0", 1, "human", "2020-01-01T00:00:00Z")


if __name__ == "__main__":
    unittest.main()
