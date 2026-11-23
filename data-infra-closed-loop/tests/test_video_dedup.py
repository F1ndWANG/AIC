import tempfile
import unittest

from closedloop.core import Loop, LoopError, now
from closedloop.video import frame_hash, near_duplicates


class VideoDuplicates(unittest.TestCase):
    def test_fingerprint_candidates_and_exact_split_guard(self):
        self.assertEqual(frame_hash(bytes(range(72))), "0000000000000000")
        with tempfile.TemporaryDirectory() as root:
            loop = Loop(root)
            try:
                ids = []
                for index in range(3):
                    sid = loop.ingest({
                        "event_id": str(index), "group_id": str(index), "source": "test",
                        "event_time": now(), "features": [index],
                        "media_sha256": "a" * 64 if index < 2 else "b" * 64,
                        "video_dhash_v1": [("0" if index < 2 else "f") * 16] * 4,
                    })
                    ids.append(sid)
                loop.work()
                for sid in ids:
                    loop.annotate(sid, 1, 0, "labeler", "reviewer")
                self.assertEqual(len(near_duplicates(loop)["matches"]), 1)
                loop.publish("train", [{"sample_id": ids[0], "split": "train"}])
                with self.assertRaises(LoopError):
                    loop.publish("test", [{"sample_id": ids[1], "split": "test"}])
            finally:
                loop.close()
