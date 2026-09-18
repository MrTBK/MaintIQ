"""Seed demo data. Isolated from real ingestion. Run: PYTHONPATH=. .venv/bin/python -m app.seed"""
import datetime as dt
import random

from app.auth import hash_pw
from app.db import SessionLocal, init_db
from app.models import Alert, DataSource, DQReport, Failure, Machine, MaintenanceTask, Recommendation, Risk, Run, User
from app.services_risk import score_machine

random.seed(42)
TYPES = [("Centrifugal Compressor", "Compressors"), ("Industrial Pump", "Pumps"), ("Electric Motor", "Motors"), ("CNC Machine", "CNC"), ("Robotics Arm", "Robotics")]
LOCS = ["Production Line 1", "Production Line 2", "Assembly Line 1", "Assembly Line 2", "Cooling Area", "Packaging Line"]


def run():
    init_db()
    db = SessionLocal()
    if not db.query(User).first():
        db.add(User(username="admin", password_hash=hash_pw("admin123"), role="ADMIN", display_name="Admin", email="admin@maintiq.local"))
        db.add(User(username="manager", password_hash=hash_pw("manager123"), role="MAINTENANCE_MANAGER", display_name="Maintenance Manager", email="manager@maintiq.local"))
        db.add(User(username="viewer", password_hash=hash_pw("viewer123"), role="VIEWER", display_name="Viewer", email="viewer@maintiq.local"))
    if db.query(Machine).count() == 0:
        # Pass 1: parents. This SQLAlchemy version does not reorder FK-only
        # (relationship-less) child inserts behind their parents in one flush,
        # so parents are flushed first (Postgres enforces FKs; dev SQLite now
        # does too via PRAGMA foreign_keys=ON).
        risks: dict[str, dict] = {}
        for i in range(1, 21):
            t, cat = TYPES[i % len(TYPES)]
            vib_dev = random.choice([2, 6, 12, 28, 35])
            temp_dev = random.choice([1, 5, 10, 16])
            r = score_machine(vib_dev, temp_dev, random.choice([5, 20, 40, 70]), overdue=(i % 5 == 0), past_failures=i % 3)
            mid = f"M-{i:03d}"
            risks[mid] = r
            db.add(Machine(id=mid, name=f"{t} {i:02d}", type=t, category=cat, location=LOCS[i % len(LOCS)],
                           status="Critical" if r["risk_level"] == "Critical" else "Warning" if r["risk_level"] in ("High", "Medium") else "Healthy",
                           health_score=round(100 - r["risk_score"] * 0.7, 1), risk_level=r["risk_level"], risk_score=r["risk_score"],
                           operating_hours=4000 + i * 317))
        db.flush()
        # Pass 2: children (risks, alerts, recs, failures, work orders).
        for i in range(1, 21):
            mid = f"M-{i:03d}"
            r = risks[mid]
            db.add(Risk(machine_id=mid, risk_score=r["risk_score"], risk_level=r["risk_level"], primary_driver=r["primary_driver"], evidence=r["evidence_json"]))
            if r["risk_score"] > 50:
                db.add(Alert(id=f"AL-{i:03d}", severity="High" if r["risk_score"] > 70 else "Medium", machine_id=mid,
                             event=f"{r['primary_driver']} elevated on {mid}", timestamp=dt.datetime.utcnow(), status="Detected", metric=r["primary_driver"]))
                db.add(Recommendation(id=f"REC-{mid}-01", machine_id=mid, priority="High" if r["risk_score"] > 70 else "Medium",
                                      recommendation="Inspect bearing assembly" if "Vibration" in r["primary_driver"] else "Thermal inspection",
                                      reason=f"Risk {r['risk_score']} driven by {r['primary_driver']}", impact="Avoid unplanned downtime",
                                      status="Pending", window="48h", downtime="4h"))
            if i % 4 == 0:
                db.add(Failure(id=f"F-{i:03d}", machine_id=mid, failure_type="Bearing", detected_at=dt.datetime.utcnow() - dt.timedelta(days=i),
                               downtime_hours=6 + i % 10, action="Bearing replacement", technician="Team A", status="Closed"))
            db.add(MaintenanceTask(id=f"WO-{i:03d}", machine_id=mid, type="Inspection", priority="High" if r["risk_score"] > 60 else "Medium",
                                   due_date=dt.datetime.utcnow() + dt.timedelta(days=(i % 10) - 2), assigned_to="Team A", est_downtime="4h",
                                   status="Overdue" if i % 5 == 0 else "Upcoming", description="Routine check"))
        db.add(DataSource(id="DS-AI4I", name="AI4I 2020 Predictive Maintenance", type="CSV dataset", status="Connected",
                          last_ingestion=dt.datetime.utcnow().isoformat(), rows=10000, coverage="6 machines types", quality=96.5))
        db.add(DQReport(dataset="AI4I 2020", records=10000, completeness=98.2, validity=97.5, consistency=99.1, duplicates=12, outliers=84))
        db.add(Run(id="RUN-001", started=dt.datetime.utcnow(), completed=dt.datetime.utcnow(), dataset="AI4I 2020", rows=10000,
                   status="Completed", duration="42s", trigger="Manual", findings="7 high-risk machines", log="{}"))
    db.commit()
    print(f"seed ok: {db.query(Machine).count()} machines")


if __name__ == "__main__":
    run()
