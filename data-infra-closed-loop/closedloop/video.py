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


def frame_hash(frame):
    """Compute a 64-bit difference hash from a 9x8 grayscale frame."""
    if len(frame) != 72:
        raise LoopError("dHash requires 72 grayscale pixels")
    result = 0
    for y in range(8):
        for x in range(8):
            i = y * 9 + x
            result = (result << 1) | (frame[i] > frame[i + 1])
    return format(result, "016x")


def fingerprint_video(path):
    decoder = shutil.which("ffmpeg")
    if decoder is None:
        raise LoopError("视频近重复索引需要 ffmpeg")
    try:
        decoded = subprocess.run(
            [decoder, "-nostdin", "-v", "error", "-protocol_whitelist", "file",
             "-i", str(path), "-map", "0:v:0", "-an", "-sn",
             "-vf", "fps=1,scale=9:8,format=gray", "-frames:v", "8",
             "-f", "rawvideo", "pipe:1"],
            capture_output=True, check=True, timeout=60,
        ).stdout
    except (subprocess.CalledProcessError, subprocess.TimeoutExpired) as exc:
        raise LoopError("视频指纹提取失败或超时") from exc
    if len(decoded) % 72:
        raise LoopError("解码返回了不完整的指纹帧")
    return [frame_hash(decoded[i:i + 72]) for i in range(0, len(decoded), 72)]


def ingest_video(loop, path, event_id, source, group_id, event_time, fingerprint=False):
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
                [probe, "-v", "error", "-protocol_whitelist", "file", "-select_streams", "v:0",
                 "-read_intervals", "%+#900", "-show_frames",
                 "-show_entries", "frame=best_effort_timestamp_time",
                 "-of", "json", str(staged)],
                capture_output=True, check=True, timeout=60,
            )
        except (subprocess.CalledProcessError, subprocess.TimeoutExpired) as exc:
            raise LoopError("视频探测失败或超时") from exc
        vector = timing_features(json.loads(result.stdout).get("frames", []))
        key = sha.hexdigest()
        hashes = fingerprint_video(staged) if fingerprint else None
        event = {
            "event_id": event_id, "source": source, "group_id": group_id,
            "event_time": event_time, "features": vector,
            "media_sha256": key, "feature_schema": "video_pts_first_900_packets_v1",
        }
        if hashes:
            event["video_dhash_v1"] = hashes
        if loop.remote_objects:
            with staged.open("rb") as stream:
                loop.remote_objects.write_media(key, stream)
        else:
            try:
                os.link(staged, assets / key)
            except FileExistsError:
                with (assets / key).open("rb") as existing:
                    actual = hashlib.sha256()
                    for block in iter(lambda: existing.read(1024 * 1024), b""):
                        actual.update(block)
                if actual.hexdigest() != key:
                    raise LoopError("已存在的视频摘要不匹配")
        return loop.ingest(event)


def near_duplicates(loop, limit=500):
    """Screen a bounded cohort for aligned first-seconds visual similarity."""
    if not 2 <= limit <= 2000:
        raise LoopError("limit must be between 2 and 2000")
    from collections import defaultdict

    rows = loop.db.execute(
        "SELECT s.id,e.payload FROM samples s JOIN events e ON s.event_id=e.id "
        "WHERE s.status='READY' AND e.payload LIKE ? ORDER BY e.created DESC,s.id LIMIT ?",
        ('%"video_dhash_v1"%', limit),
    ).fetchall()
    bands = defaultdict(list)
    matches = []
    inspected = 0
    for row in rows:
        hashes = json.loads(row["payload"]).get("video_dhash_v1")
        if not isinstance(hashes, list) or not 3 <= len(hashes) <= 8:
            continue
        try:
            frames = tuple(int(value, 16) for value in hashes
                           if isinstance(value, str) and len(value) == 16)
        except ValueError:
            continue
        if len(frames) != len(hashes) or any(value < 0 for value in frames):
            continue
        inspected += 1
        candidate_ids = set()
        keys = [(frames[0] >> offset & 65535, offset) for offset in (0, 16, 32, 48)]
        for key in keys:
            for sample_id, other in bands[key]:
                if sample_id in candidate_ids:
                    continue
                candidate_ids.add(sample_id)
                overlap = min(len(frames), len(other))
                distances = [bin(a ^ b).count("1") for a, b in zip(frames, other)]
                if distances[0] <= 3 and sum(d <= 6 for d in distances) >= max(3, math.ceil(.75 * overlap)):
                    matches.append({"left": sample_id, "right": row["id"], "distances": distances})
                    if len(matches) == 1000:
                        return {"inspected": inspected, "matches": matches, "truncated": True}
            bands[key].append((row["id"], frames))
    return {"inspected": inspected, "matches": matches, "truncated": False}
