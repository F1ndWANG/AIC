import tempfile
import unittest

from closedloop.core import Loop, now
from closedloop.monitor import inspect


class MonitoringTests(unittest.TestCase):
    def test_pending_alert_clears_after_processing(self):
        with tempfile.TemporaryDirectory() as root:
            loop = Loop(root)
            try:
                loop.ingest({"event_id": "x", "group_id": "x", "source": "test",
                             "event_time": now(), "features": [1]})
                self.assertEqual(inspect(loop, max_pending=0)["alerts"], ["pending"])
                loop.work()
                self.assertEqual(inspect(loop, max_pending=0)["alerts"], [])
            finally:
                loop.close()
