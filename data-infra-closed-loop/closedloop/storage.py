"""Optional infrastructure adapters. Local execution needs no extra packages."""
import os


class Postgres:
    """Match the transaction boundaries of the SQLite metadata implementation."""

    def __init__(self, dsn, schema):
        import psycopg
        from psycopg.pq import TransactionStatus
        from psycopg.rows import dict_row

        self.idle = TransactionStatus.IDLE
        self.connection = psycopg.connect(dsn, autocommit=True, row_factory=dict_row)
        try:
            with self:
                for statement in schema.split(";"):
                    if statement.strip() and not statement.strip().startswith("PRAGMA"):
                        self.execute(statement.replace("INTEGER PRIMARY KEY AUTOINCREMENT",
                                                       "BIGSERIAL PRIMARY KEY")
                                     .replace("lease_until REAL", "lease_until DOUBLE PRECISION"))
        except Exception:
            self.close()
            raise

    def execute(self, sql, parameters=()):
        if sql == "BEGIN IMMEDIATE":
            if self.connection.info.transaction_status != self.idle:
                return
            self.connection.execute("BEGIN")
            try:
                self.connection.execute("SELECT pg_advisory_xact_lock(826174211)")
            except Exception:
                self.rollback()
                raise
            return
        return self.connection.execute(sql.replace("?", "%s"), parameters)

    def __enter__(self):
        self.execute("BEGIN IMMEDIATE")
        return self

    def __exit__(self, kind, value, traceback):
        if kind:
            self.rollback()
        else:
            self.commit()

    def commit(self):
        self.connection.execute("COMMIT")

    def rollback(self):
        self.connection.execute("ROLLBACK")

    def close(self):
        self.connection.close()


class S3Objects:
    def __init__(self, bucket):
        import boto3
        from botocore.config import Config
        from botocore.exceptions import ClientError

        self.error = ClientError
        self.bucket = bucket
        prefix = os.environ.get("CLOSEDLOOP_S3_PREFIX", "closedloop").strip("/")
        self.prefix = prefix + "/" if prefix else ""
        self.client = boto3.client(
            "s3", endpoint_url=os.environ.get("CLOSEDLOOP_S3_ENDPOINT"),
            config=Config(connect_timeout=5, read_timeout=30,
                          retries={"total_max_attempts": 3}),
        )

    def read(self, key):
        try:
            response = self.client.get_object(Bucket=self.bucket, Key=self.prefix + key)
        except self.error as exc:
            if exc.response["Error"]["Code"] in ("NoSuchKey", "404"):
                raise FileNotFoundError(key) from exc
            raise
        body = response["Body"]
        try:
            return body.read()
        finally:
            body.close()

    def write(self, key, data):
        try:
            self.client.put_object(Bucket=self.bucket, Key=self.prefix + key, Body=data,
                                   ContentType="application/json", IfNoneMatch="*")
        except self.error as exc:
            if exc.response["Error"]["Code"] not in ("PreconditionFailed", "412"):
                raise
            if self.read(key) != data:
                raise OSError("Existing S3 object does not match its content digest") from exc

    def write_media(self, digest, stream):
        """Stream a content-addressed media object without overwriting it."""
        import base64
        import hashlib

        key = self.prefix + "media/" + digest
        checksum = base64.b64encode(bytes.fromhex(digest)).decode("ascii")
        try:
            self.client.put_object(Bucket=self.bucket, Key=key, Body=stream,
                                   ContentType="application/octet-stream",
                                   ChecksumSHA256=checksum, IfNoneMatch="*")
        except self.error as exc:
            if exc.response["Error"]["Code"] not in ("PreconditionFailed", "412"):
                raise
            body = self.client.get_object(Bucket=self.bucket, Key=key)["Body"]
            actual = hashlib.sha256()
            try:
                for chunk in iter(lambda: body.read(1024 * 1024), b""):
                    actual.update(chunk)
            finally:
                body.close()
            if actual.hexdigest() != digest:
                raise OSError("Existing media failed SHA-256 verification") from exc
        return "s3://" + self.bucket + "/" + key
