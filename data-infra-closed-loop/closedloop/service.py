"""Authenticated internal WSGI entry point for ingestion and feedback."""
import argparse
import hmac
import json
import logging
import os
import time
from wsgiref.simple_server import make_server

from .core import Loop, LoopError

LOG = logging.getLogger(__name__)
MAX_BODY = 1024 * 1024


def create_app(root, tokens):
    """Map each role to a distinct credential. Run behind an internal TLS proxy."""
    tokens = {role: token.encode() for role, token in tokens.items() if token}
    if not tokens or len(set(tokens.values())) != len(tokens):
        raise ValueError("Configure distinct service tokens")
    if any(len(token) < 32 for token in tokens.values()):
        raise ValueError("Service tokens must contain at least 32 bytes")

    routes = {
        ("POST", "/v1/events"): ("writer", lambda loop, body: {"sample_id": loop.ingest(body)}),
        ("POST", "/v1/predictions"): ("inference", lambda loop, body: loop.predict(body["sample_id"], body["request_id"])),
        ("POST", "/v1/feedback"): ("feedback", lambda loop, body: {"feedback_id": loop.feedback(
            body["feedback_id"], body["prediction_id"], body["label"], body["source"], body["available_at"])}),
        ("GET", "/v1/status"): ("operator", lambda loop, body: loop.status()),
        ("GET", "/v1/queue"): ("operator", lambda loop, body: dict(loop.db.execute(
            "SELECT COUNT(CASE WHEN state='PENDING' THEN 1 END) AS pending, "
            "COUNT(CASE WHEN state='RUNNING' AND lease_until<=? THEN 1 END) AS expired, "
            "COUNT(CASE WHEN state='QUARANTINED' THEN 1 END) AS quarantined FROM jobs",
            (time.time(),),
        ).fetchone())),
    }

    def app(environ, start_response):
        def respond(status, value):
            payload = json.dumps(value, ensure_ascii=False).encode()
            start_response(status, [("Content-Type", "application/json; charset=utf-8"),
                                    ("Cache-Control", "no-store"),
                                    ("Content-Length", str(len(payload)))])
            return [payload]

        method, path = environ["REQUEST_METHOD"], environ["PATH_INFO"]
        if (method, path) == ("GET", "/healthz"):
            return respond("200 OK", {"live": True})
        route = routes.get((method, path))
        if not route:
            return respond("404 Not Found", {"error": "unknown endpoint"})
        role, handler = route
        supplied = environ.get("HTTP_AUTHORIZATION", "").encode()
        expected = tokens.get(role)
        if expected is None or not hmac.compare_digest(supplied, b"Bearer " + expected):
            return respond("401 Unauthorized", {"error": "unauthorized"})
        try:
            body = {}
            if method == "POST":
                length = int(environ.get("CONTENT_LENGTH") or 0)
                if length > MAX_BODY:
                    return respond("413 Payload Too Large", {"error": "request exceeds 1 MiB"})
                if length <= 0 or environ.get("CONTENT_TYPE", "").split(";")[0] != "application/json":
                    return respond("400 Bad Request", {"error": "expected a JSON object"})
                body = json.loads(environ["wsgi.input"].read(length))
                if not isinstance(body, dict):
                    return respond("400 Bad Request", {"error": "expected a JSON object"})
            loop = Loop(root)
            try:
                result = handler(loop, body)
            finally:
                loop.close()
            return respond("200 OK", result)
        except (ValueError, KeyError, TypeError, OverflowError) as exc:
            message = str(exc) if isinstance(exc, LoopError) else "invalid request fields"
            return respond("400 Bad Request", {"error": message})
        except Exception:
            LOG.exception("Data service request failed")
            return respond("503 Service Unavailable", {"error": "backend unavailable"})

    return app


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("--root", default="runtime")
    parser.add_argument("--port", type=int, default=8080)
    args = parser.parse_args()
    tokens = {role: os.environ.get("CLOSEDLOOP_TOKEN_" + role.upper())
              for role in ("writer", "inference", "feedback", "operator")}
    with make_server("127.0.0.1", args.port, create_app(args.root, tokens)) as server:
        server.serve_forever()


if __name__ == "__main__":
    main()
