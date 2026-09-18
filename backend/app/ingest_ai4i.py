"""AI4I 2020 loader. Honest subset mapping (see docs/data-pipeline.md).

Source columns: UDI, Product ID, Type, Air/Process temperature [K],
Rotational speed [rpm], Torque [Nm], Tool wear [min], Machine failure,
TWF/HDF/PWF/OSF/RNF cause flags. No timestamps in the dataset: failure
detected_at is set to ingestion time and documented as such; UDI order is
the record sequence. Vibration/pressure/current do not exist in AI4I and are
never invented — sensor_readings are left untouched.
"""
import csv
import datetime as dt
import io
import time
import uuid
from collections import defaultdict

from sqlalchemy.orm import Session

from app.models import AuditEvent, DQReport, Failure, Machine, Risk, Run
from app.services_risk import level as risk_level

REQUIRED = ["UDI", "Product ID", "Type", "Air temperature [K]", "Process temperature [K]",
            "Rotational speed [rpm]", "Torque [Nm]", "Tool wear [min]", "Machine failure",
            "TWF", "HDF", "PWF", "OSF", "RNF"]
CAUSES = {"TWF": "Tool Wear", "HDF": "Heat Dissipation", "PWF": "Power Fault",
          "OSF": "Overstrain", "RNF": "Random Failure"}
TYPE_NAMES = {"L": "Light Product", "M": "Medium Product", "H": "Heavy Product"}


def _f(v: str):
    try:
        return float(v)
    except (TypeError, ValueError):
        return None


def load_ai4i(db: Session, filename: str, payload: bytes, user: str, role: str) -> dict:
    t0 = time.time()
    try:
        text = payload.decode("utf-8-sig")
    except UnicodeDecodeError:
        return {"rows_read": 0, "rows_accepted": 0, "rows_rejected": 0, "errors": ["not valid UTF-8 CSV"], "run_id": None}
    reader = csv.DictReader(io.StringIO(text))
    if reader.fieldnames != REQUIRED:
        return {"rows_read": 0, "rows_accepted": 0, "rows_rejected": 0,
                "errors": ["AI4I schema mismatch: expected " + ",".join(REQUIRED)], "run_id": None}
    per_type: dict[str, list[dict]] = defaultdict(list)
    accepted = rejected = 0
    errors: list[str] = []
    for i, raw in enumerate(reader, start=2):
        nums = {k: _f(raw.get(k)) for k in REQUIRED[3:8]}
        flags = {k: (raw.get(k) or "").strip() for k in ["Machine failure", "TWF", "HDF", "PWF", "OSF", "RNF"]}
        if any(v is None for v in nums.values()) or any(v not in ("0", "1") for v in flags.values()) \
                or (raw.get("Type") or "").strip() not in TYPE_NAMES or not (raw.get("Product ID") or "").strip():
            rejected += 1
            if len(errors) < 50:
                errors.append(f"line {i}: invalid types/flags")
            continue
        accepted += 1
        per_type[raw["Type"].strip()].append({"udi": raw["UDI"].strip(), "failure": flags["Machine failure"] == "1",
                                              "causes": [c for c in CAUSES if flags[c] == "1"]})
    now = dt.datetime.utcnow()
    machines: list[str] = []
    failures_created = 0
    seen: dict[str, list[dict]] = {}
    for t, rows in sorted(per_type.items()):
        mid = f"AI4I-{t}"
        machines.append(mid)
        fails = [r for r in rows if r["failure"]]
        rate = len(fails) / len(rows)
        score = round(min(95.0, rate * 100 * 2), 1)
        m = db.query(Machine).filter(Machine.id == mid).first()
        if not m:
            m = Machine(id=mid, name=f"AI4I 2020 {TYPE_NAMES[t]}", type="AI4I Batch",
                        category="Motors", location="Historical Dataset",
                        status="Critical" if score >= 80 else "Warning" if score >= 35 else "Healthy",
                        health_score=round(100 - score * 0.7, 1), risk_level=risk_level(score),
                        risk_score=score, operating_hours=0.0, manufacturer="AI4I 2020 (UCI)")
            db.add(m)
        else:
            m.risk_score, m.risk_level = score, risk_level(score)
            m.status = "Critical" if score >= 80 else "Warning" if score >= 35 else "Healthy"
        risk = db.query(Risk).filter(Risk.machine_id == mid).first()
        driver = f"Historical failure rate {rate:.1%} ({len(fails)}/{len(rows)})"
        if risk:
            risk.risk_score, risk.risk_level, risk.primary_driver = score, risk_level(score), driver
        else:
            db.add(Risk(machine_id=mid, risk_score=score, risk_level=risk_level(score),
                        primary_driver=driver, evidence=f'[{{"factor": "Historical failure rate", "contribution": {score}, "value": "{rate:.1%}", "baseline": "0%", "status": "elevated"}}]'))
        seen[mid] = fails
    db.flush()  # parents before children (see D9)
    for mid, fails in seen.items():
        for r in fails:
            fid = f"AI4I-F-{r['udi']}"
            if db.query(Failure).filter(Failure.id == fid).first():
                continue
            cause = CAUSES[r["causes"][0]] if r["causes"] else "Machine Failure"
            db.add(Failure(id=fid, machine_id=mid, failure_type=cause, detected_at=now,
                           downtime_hours=0, action="", technician="", status="Closed"))
            failures_created += 1
    quality = {"records": accepted, "rejected": rejected}
    db.add(DQReport(dataset=filename or "AI4I 2020", records=accepted, completeness=round(100 * accepted / max(1, accepted + rejected), 2),
                    validity=round(100 * accepted / max(1, accepted + rejected), 2), consistency=100.0,
                    duplicates=0, outliers=0))
    run_id = f"RUN-{int(time.time())}-{uuid.uuid4().hex[:6]}"
    db.add(Run(id=run_id, completed=now, dataset=filename or "AI4I 2020", rows=accepted,
               status="Completed", duration=f"{time.time() - t0:.1f}s", trigger="Manual",
               findings=f"{accepted} rows, {failures_created} new failures", log='{"loader": "ai4i"}'))
    db.add(AuditEvent(user=user, role=role, action="ingest ai4i", resource=filename or "AI4I 2020",
                      result="Success", details=f"{accepted} accepted, {rejected} rejected"))
    db.commit()
    return {"rows_read": accepted + rejected, "rows_accepted": accepted, "rows_rejected": rejected,
            "errors": errors, "failures_created": failures_created, "machines": machines,
            "quality": quality, "run_id": run_id,
            "limitations": "No timestamps in source (detected_at = ingestion time); no vibration/pressure/current sensors (not invented)."}
