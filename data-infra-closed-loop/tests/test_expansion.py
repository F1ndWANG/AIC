import tempfile
import unittest

from closedloop.core import Loop, LoopError, now
from closedloop.demo import run
from closedloop.video import timing_features


class ExpansionTests(unittest.TestCase):
    def setUp(self):
        self.directory = tempfile.TemporaryDirectory()
        self.addCleanup(self.directory.cleanup)
        self.loop = Loop(self.directory.name)
        self.addCleanup(self.loop.close)

    def test_video_timestamp_gap(self):
        frames = [{"best_effort_timestamp_time": str(t)} for t in (0, .04, .08, .12, .24)]
        fps, dispersion, long_gaps, nonmonotonic = timing_features(frames)
        self.assertAlmostEqual(fps, 25)
        self.assertAlmostEqual(dispersion, 0)
        self.assertEqual((long_gaps, nonmonotonic), (.25, 0))

    def test_conflicting_votes_require_independent_arbitration(self):
        sid = self.loop.ingest({"event_id": "1", "group_id": "video", "source": "test",
                                "event_time": now(), "features": [1]})
        self.loop.work()
        self.loop.vote(sid, 1, "a", 0)
        self.loop.vote(sid, 1, "b", 2)
        with self.assertRaises(LoopError):
            self.loop.review(sid, 1, "c")
        with self.assertRaises(LoopError):
            self.loop.review(sid, 1, "a", 2, "confirmed")
        self.loop.review(sid, 1, "c", 2, "confirmed")
        with self.assertRaises(LoopError):
            self.loop.vote(sid, 1, "d", 0)
        self.loop.publish("r", [{"sample_id": sid, "split": "train"}])
        self.assertEqual(self.loop.dataset("r")[0]["label"], 2)

    def test_holdout_report_does_not_change_deployment(self):
        demo = run(self.loop)
        active = self.loop.active()
        report = self.loop.test_report(demo["updated_run"])
        self.assertEqual(report["metrics"]["count"], 18)
        self.assertEqual(report, self.loop.test_report(demo["updated_run"]))
        self.assertEqual(active, self.loop.active())

    def test_mining_excludes_events_ingested_after_cutoff(self):
        cutoff = now()
        self.loop.ingest({"event_id": "later", "group_id": "later", "source": "test",
                          "event_time": "2020-01-01T00:00:00Z", "features": [1]})
        self.loop.work()
        self.assertEqual(self.loop.mine(cutoff=cutoff)["members"], [])
