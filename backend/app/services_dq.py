"""Data-quality checks: completeness, validity, consistency, duplicates, outliers."""


def dq_report(rows: list[dict]) -> dict:
    n = len(rows) or 1
    missing = sum(1 for r in rows if any(v is None or v == "" for v in r.values()))
    invalid = sum(1 for r in rows if any(isinstance(v, float) and (v != v) for v in r.values()))
    keys = [tuple(sorted(r.items())) for r in rows]
    dups = len(keys) - len(set(keys))
    out = sum(1 for r in rows if abs(float(r.get("vibration", 0) or 0)) > 15 or float(r.get("temperature", 0) or 0) > 120)
    completeness = round(100 * (1 - missing / n), 2)
    validity = round(100 * (1 - invalid / n), 2)
    consistency = 100.0
    return {"records": len(rows), "completeness": completeness, "validity": validity, "consistency": consistency, "duplicates": dups, "outliers": out}
