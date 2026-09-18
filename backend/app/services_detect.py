"""Scheduled analysis runs. The detect/run pipeline reused by API + scheduler."""
import datetime as dt
import uuid

from sqlalchemy.orm import Session

from app.models import Alert, Anomaly, AuditEvent, Machine, Recommendation, Risk, Run, SensorReading
from app.services_analytics import SENSORS
from app.services_anomaly import detect_series
from app.services_risk import level as risk_level


def run_detection(db: Session, triggered_by: str = "scheduler", role: str = "system") -> dict:
    run_id = f"RUN-{int(dt.datetime.utcnow().timestamp())}-{uuid.uuid4().hex[:6]}"
    db.query(Anomaly).delete()
    found: list[dict] = []
    worst: dict[str, dict] = {}
    for (m,) in db.query(Machine.id).all():
        readings = db.query(SensorReading).filter(SensorReading.machine_id == m).order_by(SensorReading.ts).limit(20000).all()
        for sensor in SENSORS:
            pts = [(r.ts, getattr(r, sensor)) for r in readings]
            for a in detect_series(pts, sensor):
                db.add(Anomaly(machine_id=m, run_id=run_id, **{k: v for k, v in a.items()}))
                found.append({"machine_id": m, **{k: (v.isoformat() if k == "ts" else v) for k, v in a.items()}})
                prev = worst.get(m)
                order = {"Medium": 1, "High": 2, "Critical": 3}
                if not prev or order[a["severity"]] > order[prev["severity"]]:
                    worst[m] = a
    for m, a in worst.items():
        floor = {"Critical": 80.0, "High": 65.0, "Medium": 40.0}[a["severity"]]
        risk = db.query(Risk).filter(Risk.machine_id == m).first()
        machine = db.query(Machine).filter(Machine.id == m).first()
        base = risk.risk_score if risk else (machine.risk_score if machine else 0)
        score = round(min(100.0, max(base, floor)), 1)
        driver = f"Anomaly: {a['sensor']} spike (z={a['deviation']})"
        import json as _json
        ev = _json.dumps([{"factor": f"Anomaly {a['sensor']}", "contribution": floor,
                           "value": f"z={a['deviation']}", "baseline": "|z|<3", "status": "critical"}])
        if risk:
            risk.risk_score, risk.risk_level, risk.primary_driver, risk.evidence = score, risk_level(score), driver, ev
        else:
            db.add(Risk(machine_id=m, risk_score=score, risk_level=risk_level(score), primary_driver=driver, evidence=ev))
        if machine:
            machine.risk_score, machine.risk_level = score, risk_level(score)
            machine.status = "Critical" if score >= 80 else ("Warning" if score >= 35 else "Healthy")
        metric = f"Anomaly {a['sensor']}"
        if a["severity"] in ("Critical", "High"):
            open_same = db.query(Alert).filter(Alert.machine_id == m, Alert.metric == metric, Alert.status == "Detected").first()
            if not open_same:
                ts = a["ts"] if isinstance(a["ts"], dt.datetime) else dt.datetime.utcnow()
                db.add(Alert(id=f"AL-{m}-{run_id[-6:]}", severity="High" if a["severity"] == "Critical" else "Medium",
                             machine_id=m, event=f"{a['sensor']} spike: observed {a['observed']} vs baseline {a['baseline']} (z={a['deviation']})",
                             timestamp=ts, status="Detected", metric=metric,
                             details=f"Raised by anomaly detection run {run_id}"))
        rec_id = f"REC-{m}-ANO"
        if a["severity"] in ("Critical", "High") and not db.query(Recommendation).filter(Recommendation.id == rec_id).first():
            db.add(Recommendation(id=rec_id, machine_id=m, priority="High" if a["severity"] == "Critical" else "Medium",
                                  recommendation=f"Inspect {a['sensor']} source on {m}",
                                  reason=f"Rolling-z anomaly: observed {a['observed']} vs baseline {a['baseline']} (z={a['deviation']})",
                                  impact="Catch fault before unplanned stop", status="Pending",
                                  window="48h" if a["severity"] == "Critical" else "7 days", downtime="4h"))
    db.add(Run(id=run_id, completed=dt.datetime.utcnow(), dataset="sensor_readings", rows=db.query(SensorReading).count(),
               status="Completed", duration="", trigger="Scheduled (Cron)" if triggered_by == "scheduler" else "Manual",
               findings=f"{len(found)} anomalies", log='{"method": "rolling-z"}'))
    db.add(AuditEvent(user=triggered_by, role=role, action="anomaly detection", resource=run_id,
                      result="Success", details=f"{len(found)} anomalies"))
    db.commit()
    return {"run_id": run_id, "anomalies_found": len(found), "anomalies": found[:200]}
