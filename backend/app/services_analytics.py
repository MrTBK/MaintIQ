"""Time-series analytics: bucketed trends + stats. Baselines are documented means."""
import datetime as dt

SENSORS = ("temperature", "vibration", "pressure", "rpm", "current")


def bucket_key(ts: dt.datetime, bucket: str) -> dt.datetime:
    if bucket == "day":
        return ts.replace(hour=0, minute=0, second=0, microsecond=0)
    if bucket == "hour":
        return ts.replace(minute=0, second=0, microsecond=0)
    return ts.replace(second=0, microsecond=0)


def trend(readings: list, sensor: str, bucket: str) -> dict:
    vals = [(r.ts, getattr(r, sensor)) for r in readings]
    vals.sort()
    groups: dict[dt.datetime, list[float]] = {}
    for ts, v in vals:
        groups.setdefault(bucket_key(ts, bucket), []).append(v)
    points = [{"ts": k.isoformat(), "avg": round(sum(v) / len(v), 3),
               "min": min(v), "max": max(v), "count": len(v)} for k, v in sorted(groups.items())]
    allv = [v for _, v in vals]
    n = len(allv)
    base_n = max(1, n // 3)
    baseline = round(sum(allv[:base_n]) / base_n, 3) if n else 0  # earliest third = normal-operation reference
    stats = {"count": n, "min": min(allv) if n else 0, "max": max(allv) if n else 0,
             "avg": round(sum(allv) / n, 3) if n else 0,
             "current": allv[-1] if n else 0, "baseline": baseline}
    return {"sensor": sensor, "bucket": bucket, "points": points, "stats": stats}
