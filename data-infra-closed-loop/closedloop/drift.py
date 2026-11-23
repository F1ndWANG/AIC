"""Compare current feature distributions with a frozen training release."""
from bisect import bisect_left
from math import isfinite, log2

from .core import LoopError, features, timestamp


def divergence(reference, current):
    """Jensen–Shannon divergence in bits using reference quantile bins."""
    sorted_reference = sorted(reference)
    edges = sorted({sorted_reference[i * (len(reference) - 1) // 10]
                    for i in range(1, 10)})

    def distribution(values):
        counts = [0] * (len(edges) + 1)
        for value in values:
            counts[bisect_left(edges, value)] += 1
        return [count / len(values) for count in counts]

    result = 0.0
    for p, q in zip(distribution(reference), distribution(current)):
        if p:
            result += 0.5 * p * log2(2 * p / (p + q))
        if q:
            result += 0.5 * q * log2(2 * q / (p + q))
    return result


def report(loop, release_id, start, end, limit=1000, minimum=30, threshold=.15):
    start, end = timestamp(start), timestamp(end)
    if start >= end or not 1 <= minimum <= limit <= 10000:
        raise LoopError("Invalid observation window or sample limits")
    if not isfinite(threshold) or not 0 <= threshold <= 1:
        raise LoopError("Drift threshold must be between zero and one")
    release = loop.row("releases", release_id)
    manifest = loop.get(release["manifest_hash"])
    train = [m for m in manifest["members"] if m["split"] == "train"][:limit]
    baseline = [features(loop.get(m["object_hash"])["features"]) for m in train]
    if not baseline:
        raise LoopError("Release has no reference training members")
    dimension = len(baseline[0])
    observed = loop.db.execute(
        "SELECT s.id,s.object_hash FROM samples s JOIN events e ON s.event_id=e.id "
        "WHERE s.status='READY' AND s.event_time>=? AND s.event_time<? AND e.created<=? "
        "ORDER BY s.event_time DESC,s.id LIMIT ?", (start, end, end, limit),
    ).fetchall()
    current = []
    for member in observed:
        vector = features(loop.get(member["object_hash"])["features"])
        if len(vector) == dimension:
            current.append(vector)
    enough = min(len(current), len(baseline)) >= minimum
    scores = [divergence(b, c) for b, c in zip(zip(*baseline), zip(*current))] if enough else []
    result = {
        "reference_release": release_id, "reference_manifest": release["manifest_hash"],
        "start": start, "end": end, "sample_limit": limit, "minimum": minimum,
        "reference_count": len(baseline), "observation_count": len(current),
        "dimension_mismatch_count": len(observed) - len(current),
        "threshold": threshold, "scores": scores,
        "status": ("insufficient_data" if not enough else
                   "drift_detected" if max(scores) > threshold else "within_threshold"),
        "reference_sample_ids": [m["sample_id"] for m in train],
        "observed_sample_ids": [m["id"] for m in observed],
    }
    key = loop.put(result)
    with loop.db:
        loop.audit("feature_drift", release_id, {"report_hash": key, "status": result["status"]})
    return dict(result, report_hash=key)
