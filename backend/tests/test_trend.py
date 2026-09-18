import datetime as dt

from fastapi.testclient import TestClient

from app.db import SessionLocal
from app.main import app
from app.models import SensorReading


def _login(c: TestClient):
    r = c.post("/api/auth/login", json={"username": "admin", "password": "admin123"})
    assert r.status_code == 200, r.text


def _seed_readings():
    db = SessionLocal()
    db.query(SensorReading).filter(SensorReading.machine_id == "M-001").delete()
    base = dt.datetime(2026, 9, 1, 8, 0, 0)
    for h in range(6):
        db.add(SensorReading(machine_id="M-001", ts=base + dt.timedelta(minutes=30 * h),
                             temperature=68.0 + h, vibration=4.0 + 0.2 * h,
                             pressure=6.0, rpm=1780, current=54.0))
    db.commit()
    db.close()


def test_trend_hour_buckets_and_stats():
    _seed_readings()
    c = TestClient(app)
    _login(c)
    r = c.get("/api/machines/M-001/trend?sensor=vibration&bucket=hour")
    assert r.status_code == 200, r.text
    body = r.json()
    assert body["points"] and len(body["points"]) <= 4
    assert body["stats"]["count"] == 6
    assert body["stats"]["min"] <= body["stats"]["avg"] <= body["stats"]["max"]
    assert "baseline" in body["stats"]


def test_trend_rejects_unknown_sensor():
    c = TestClient(app)
    _login(c)
    r = c.get("/api/machines/M-001/trend?sensor=noise&bucket=hour")
    assert r.status_code == 422
