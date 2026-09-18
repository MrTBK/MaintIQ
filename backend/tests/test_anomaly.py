import datetime as dt

from fastapi.testclient import TestClient

from app.db import SessionLocal
from app.main import app
from app.models import SensorReading


def _login(c: TestClient):
    r = c.post("/api/auth/login", json={"username": "admin", "password": "admin123"})
    assert r.status_code == 200, r.text


def _seed_spike():
    db = SessionLocal()
    db.query(SensorReading).filter(SensorReading.machine_id == "M-002").delete()
    base = dt.datetime(2026, 9, 2, 8, 0, 0)
    for h in range(30):
        v = 14.0 if h == 25 else 4.0 + (h % 3) * 0.1
        db.add(SensorReading(machine_id="M-002", ts=base + dt.timedelta(minutes=10 * h),
                             temperature=68.0, vibration=v, pressure=6.0, rpm=1780, current=54.0))
    db.commit()
    db.close()


def test_detect_run_persists_anomalies():
    _seed_spike()
    c = TestClient(app)
    _login(c)
    r = c.post("/api/runs/detect")
    assert r.status_code == 200, r.text
    body = r.json()
    assert body["anomalies_found"] >= 1
    assert body["run_id"]
    spike = [a for a in body["anomalies"] if a["machine_id"] == "M-002" and a["sensor"] == "vibration"]
    assert spike, "expected M-002 vibration spike flagged"
    assert spike[0]["method"] == "rolling-z"
    assert {"observed", "baseline", "severity"} <= set(spike[0])


def test_anomalies_listed_per_machine():
    c = TestClient(app)
    _login(c)
    r = c.get("/api/machines/M-002/anomalies")
    assert r.status_code == 200, r.text
    assert any(a["sensor"] == "vibration" for a in r.json())


def test_detect_rerun_no_duplicates_and_updates_risk_and_reco():
    c = TestClient(app)
    _login(c)
    c.post("/api/runs/detect")
    n1 = len(c.get("/api/machines/M-002/anomalies").json())
    r = c.post("/api/runs/detect").json()
    n2 = len(c.get("/api/machines/M-002/anomalies").json())
    assert n1 == n2, f"rerun duplicated anomalies {n1} -> {n2}"
    m = c.get("/api/machines/M-002").json()
    assert m["risk"]["risk_level"] in ("High", "Critical"), m["risk"]
    assert any("vibration" in (x.get("primary_driver", "") + str(x.get("evidence", ""))).lower() or "anomaly" in (x.get("primary_driver", "") + str(x.get("evidence", ""))).lower() for x in [m["risk"]])
    assert any(x["machine_id"] == "M-002" for x in c.get("/api/recommendations").json()["items"])


def test_detect_creates_alerts_without_duplicates():
    c = TestClient(app)
    _login(c)
    c.post("/api/runs/detect")
    open_alerts = [a for a in c.get("/api/alerts").json()["items"]
                   if a["machine_id"] == "M-002" and a["status"] == "Detected" and "Anomaly" in (a.get("metric") or "")]
    assert len(open_alerts) >= 1, "expected an open anomaly alert for M-002"
    c.post("/api/runs/detect")
    reopened = [a for a in c.get("/api/alerts").json()["items"]
                if a["machine_id"] == "M-002" and a["status"] == "Detected" and "Anomaly" in (a.get("metric") or "")]
    assert len(reopened) == len(open_alerts), f"rerun duplicated alerts {len(open_alerts)} -> {len(reopened)}"
