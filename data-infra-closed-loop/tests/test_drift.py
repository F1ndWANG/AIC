import tempfile
import unittest

from closedloop.core import Loop, now
from closedloop.drift import divergence, report


class DriftTests(unittest.TestCase):
    def test_identical_and_separated_distributions(self):
        self.assertAlmostEqual(divergence([1, 2, 3], [1, 2, 3]), 0)
        self.assertAlmostEqual(divergence([1, 1, 1], [4, 4]), 1)

    def test_window_detects_shift_and_persists_report(self):
        with tempfile.TemporaryDirectory() as root:
            loop = Loop(root)
            self.addCleanup(loop.close)
            base = loop.ingest(dict(event_id="base", source="ref", group_id="base",
                                    event_time="2000-01-01T00:00:00Z", features=[1]))
            loop.work()
            loop.annotate(base, 1, 1, "a", "b")
            loop.publish("ref", [{"sample_id": base, "split": "train"}])
            start = now()
            loop.ingest(dict(event_id="new", source="stream", group_id="new",
                             event_time=start, features=[4]))
            loop.work()
            result = report(loop, "ref", start, now(), minimum=1)
            self.assertEqual(result["status"], "drift_detected")
            self.assertEqual(loop.get(result["report_hash"])["scores"], [1.0])
            self.assertEqual(report(loop, "ref", start, now(), minimum=2)["status"],
                             "insufficient_data")
