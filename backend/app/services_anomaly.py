"""Stage-1 anomaly detection: rolling mean/std z-score. No ML yet."""
import statistics

from app.services_analytics import SENSORS


def severity(z: float) -> str:
    a = abs(z)
    if a >= 5:
        return "Critical"
    if a >= 4:
        return "High"
    return "Medium"


def detect_series(points: list[tuple], sensor: str, window: int = 20, z_thresh: float = 3.0) -> list[dict]:
    """points: sorted [(ts, value)]. Compares each point against prior `window`."""
    out = []
    vals = [v for _, v in points]
    for i in range(window, len(vals)):
        hist = vals[i - window:i]
        mean = statistics.fmean(hist)
        sd = statistics.pstdev(hist) or 1e-9
        z = (vals[i] - mean) / sd
        if abs(z) >= z_thresh:
            out.append({"sensor": sensor, "ts": points[i][0], "observed": vals[i],
                        "baseline": round(mean, 3), "deviation": round(z, 2),
                        "severity": severity(z), "method": "rolling-z"})
    return out
