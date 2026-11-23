"""Extract timing features from a local video and retain the exact input bytes."""
import hashlib
import json
import math
import os
import shutil
import statistics
import subprocess
import tempfile
from pathlib import Path

from .core import LoopError


def timing_features(frames):
    pts = []
    for frame in frames:
        try:
            value = float(frame["best_effort_timestamp_time"])
        except (KeyError, ValueError, TypeError):
            continue
        if math.isfinite(value):
            pts.append(value)
    if len(pts) < 4:
        raise LoopError("视频至少需要四个有效帧时间戳")
    elapsed = [right - left for left, right in zip(pts, pts[1:])]
    positive = [gap for gap in elapsed if gap > 0]
    if len(positive) < 3 or not all(map(math.isfinite, elapsed)):
        raise LoopError("视频时间戳不满足提取条件")
    median = statistics.median(positive)
    return [
        1 / median,
        statistics.median(abs(gap - median) for gap in positive) / median,
        sum(gap > 1.5 * median for gap in positive) / len(elapsed),
        sum(gap <= 0 for gap in elapsed) / len(elapsed),
    ]


def ingest_video(loop, path, event_id, source, group_id, event_time):
    probe = shutil.which("ffprobe")
    if probe is None:
        raise LoopError("视频接入需要在 PATH 中安装 ffprobe")
    assets = loop.root / "media"
    assets.mkdir(exist_ok=True)
    with tempfile.TemporaryDirectory(dir=assets) as directory:
        staged = Path(directory) / "video"
        sha = hashlib.sha256()
        with Path(path).open("rb") as original, staged.open("wb") as output:
            for block in iter(lambda: original.read(1024 * 1024), b""):
                sha.update(block)
                output.write(block)
            output.flush()
            os.fsync(output.fileno())
        try:
            result = subprocess.run(
                [probe, "-v", "error", "-select_streams", "v:0",
                 "-read_intervals", "%+#900", "-show_frames",
                 "-show_entries", "frame=best_effort_timestamp_time",
                 "-of", "json", str(staged)],
                capture_output=True, check=True, timeout=60,
            )
        except (subprocess.CalledProcessError, subprocess.TimeoutExpired) as exc:
            raise LoopError("视频探测失败或超时") from exc
        vector = timing_features(json.loads(result.stdout).get("frames", []))
        key = sha.hexdigest()
        try:
            os.link(staged, assets / key)
        except FileExistsError:
            pass
        return loop.ingest({
            "event_id": event_id, "source": source, "group_id": group_id,
            "event_time": event_time, "features": vector,
            "media_sha256": key, "feature_schema": "video_pts_first_900_packets_v1",
        })
