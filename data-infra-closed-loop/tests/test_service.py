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
