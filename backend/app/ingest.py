"""CSV ingestion: schema → type → business validation → DQ → load → run record."""
import csv
import datetime as dt
import io
import time
import uuid

from sqlalchemy.orm import Session

from app.models import AuditEvent, DQReport, Machine, Run, SensorReading
from app.services_dq import dq_report

REQUIRED = ["machine_id", "ts", "temperature", "vibration", "pressure", "rpm", "current"]
BOUNDS = {"temperature": (-50.0, 150.0), "vibration": (0.0, 25.0), "pressure": (0.0, 20.0), "rpm": (0.0, 6000.0), "current": (0.0, 500.0)}


def _num(v: str, col: str, errors: list, line: int):
    try:
        f = float(v)
    except (TypeError, ValueError):
        errors.append(f"line {line}: {col} not a number ({v!r})")
        return None
    lo, hi = BOUNDS[col]
    if not (lo <= f <= hi):
        errors.append(f"line {line}: {col}={f} outside [{lo},{hi}]")
        return None
    return f


def ingest_csv(db: Session, filename: str, payload: bytes, user: str, role: str) -> dict:
    t0 = time.time()
    try:
        text = payload.decode("utf-8-sig")
    except UnicodeDecodeError:
        return {"rows_read": 0, "rows_accepted": 0, "rows_rejected": 0, "errors": ["file is not valid UTF-8 CSV"], "run_id": None}
    reader = csv.DictReader(io.StringIO(text))
    if reader.fieldnames != REQUIRED:
        return {"rows_read": 0, "rows_accepted": 0, "rows_rejected": 0,
                "errors": [f"schema must be exactly: {','.join(REQUIRED)}"], "run_id": None}
    rows_read = accepted = rejected = 0
    errors: list[str] = []
    good: list[dict] = []
    for i, raw in enumerate(reader, start=2):
        rows_read += 1
        line_errs: list[str] = []
        mid = (raw.get("machine_id") or "").strip()
        if not mid:
            line_errs.append(f"line {i}: machine_id missing")
        elif not db.query(Machine).filter(Machine.id == mid).first():
            line_errs.append(f"line {i}: unknown machine_id {mid!r}")
        try:
            ts = dt.datetime.fromisoformat((raw.get("ts") or "").strip())
        except ValueError:
            line_errs.append(f"line {i}: ts not ISO datetime ({raw.get('ts')!r})")
            ts = None
        vals = {}
        for col in ["temperature", "vibration", "pressure", "rpm", "current"]:
            f = _num((raw.get(col) or "").strip(), col, line_errs, i)
            if f is None:
                break
            vals[col] = f
        if line_errs or ts is None or len(vals) != 5:
            rejected += 1
            errors.extend(line_errs[:3])
            continue
        accepted += 1
        good.append({"machine_id": mid, "ts": ts, **vals})

    for g in good:
        db.add(SensorReading(**g))
    dq = dq_report([{"vibration": g["vibration"], "temperature": g["temperature"]} for g in good])
    db.add(DQReport(dataset=filename, records=accepted, completeness=dq["completeness"],
                    validity=dq["validity"], consistency=dq["consistency"],
                    duplicates=dq["duplicates"], outliers=dq["outliers"]))
    dur = time.time() - t0
    run_id = f"RUN-{int(time.time())}-{uuid.uuid4().hex[:6]}"
    db.add(Run(id=run_id, completed=dt.datetime.utcnow(), dataset=filename, rows=accepted,
               status="Completed" if rejected == 0 else "Completed",
               duration=f"{dur:.1f}s", trigger="Manual",
               findings=f"{accepted} accepted, {rejected} rejected",
               log=f'{{"rows_read": {rows_read}}}'))
    db.add(AuditEvent(user=user, role=role, action="ingest csv", resource=filename,
                      result="Success" if accepted else "Warning",
                      details=f"{accepted} accepted, {rejected} rejected"))
    db.commit()
    return {"rows_read": rows_read, "rows_accepted": accepted, "rows_rejected": rejected,
            "errors": errors[:50], "quality": dq, "run_id": run_id}
