import io
import json
import tempfile
import unittest

from closedloop.core import Loop, now
from closedloop.service import create_app


class ServiceTests(unittest.TestCase):
    def test_scope_and_queue_after_idempotent_replay(self):
        with tempfile.TemporaryDirectory() as root:
            credentials = {"writer": "w" * 32, "operator": "o" * 32}
            app = create_app(root, credentials)

            def request(method, path, token, body=None):
                payload = json.dumps(body).encode() if body is not None else b""
                status = []
                result = app({
                    "REQUEST_METHOD": method, "PATH_INFO": path,
                    "HTTP_AUTHORIZATION": "Bearer " + token,
                    "CONTENT_TYPE": "application/json", "CONTENT_LENGTH": str(len(payload)),
                    "wsgi.input": io.BytesIO(payload),
                }, lambda code, headers: status.append(code))
                return status[0], json.loads(b"".join(result))

            event = {"event_id": "api-1", "group_id": "1", "source": "api",
                     "features": [1, 2], "event_time": now()}
            self.assertTrue(request("POST", "/v1/events", credentials["operator"], event)[0].startswith("401"))
            first = request("POST", "/v1/events", credentials["writer"], event)
            self.assertTrue(first[0].startswith("200"))
            self.assertEqual(first, request("POST", "/v1/events", credentials["writer"], event))
            self.assertEqual(request("GET", "/v1/queue", credentials["operator"])[1]["pending"], 1)
            loop = Loop(root)
            try:
                self.assertEqual(loop.work(1), {"READY": 1})
            finally:
                loop.close()
            self.assertEqual(request("GET", "/v1/queue", credentials["operator"])[1]["pending"], 0)

    def test_annotation_identity_and_separation(self):
        with tempfile.TemporaryDirectory() as root:
            loop = Loop(root)
            try:
                sid = loop.ingest({"event_id": "vote", "source": "test", "group_id": "g",
                                   "event_time": now(), "features": [1]})
                loop.work()
            finally:
                loop.close()
            app = create_app(root, {}, {
                "alice": {"role": "annotator", "token": "a" * 32},
                "bob": {"role": "annotator", "token": "b" * 32},
                "carol": {"role": "reviewer", "token": "c" * 32},
            })

            def post(path, token, body):
                payload = json.dumps(body).encode()
                status = []
                result = app({"REQUEST_METHOD": "POST", "PATH_INFO": path,
                              "HTTP_AUTHORIZATION": "Bearer " + token,
                              "CONTENT_TYPE": "application/json", "CONTENT_LENGTH": str(len(payload)),
                              "wsgi.input": io.BytesIO(payload)}, lambda code, headers: status.append(code))
                return status[0], json.loads(b"".join(result))

            vote = {"sample_id": sid, "revision": 1, "label": 1, "voter": "fake"}
            self.assertTrue(post("/v1/annotations/vote", "c" * 32, vote)[0].startswith("401"))
            for token in ("a" * 32, "b" * 32):
                self.assertTrue(post("/v1/annotations/vote", token, vote)[0].startswith("200"))
            self.assertTrue(post("/v1/annotations/review", "a" * 32, vote)[0].startswith("401"))
            self.assertTrue(post("/v1/annotations/review", "c" * 32, vote)[0].startswith("200"))
            loop = Loop(root)
            try:
                self.assertEqual({r["voter"] for r in loop.db.execute("SELECT voter FROM votes")}, {"alice", "bob"})
            finally:
                loop.close()
