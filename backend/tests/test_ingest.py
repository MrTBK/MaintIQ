import io

from fastapi.testclient import TestClient

from app.main import app

GOOD = """machine_id,ts,temperature,vibration,pressure,rpm,current
M-001,2026-09-01T08:00:00,68.5,4.2,6.1,1780,54.0
M-001,2026-09-01T09:00:00,69.0,4.4,6.0,1780,54.2
"""
BAD = """machine_id,ts,temperature,vibration,pressure,rpm,current
M-001,not-a-date,9999,4.2,6.1,1780,54.0
,2026-09-01T09:00:00,69.0,4.4,6.0,1780,54.2
"""


def _login(c: TestClient):
    r = c.post("/api/auth/login", json={"username": "admin", "password": "admin123"})
    assert r.status_code == 200, r.text


def test_ingest_accepts_good_rows_and_records_run():
    c = TestClient(app)
    _login(c)
    r = c.post("/api/runs/ingest", files={"file": ("readings.csv", io.BytesIO(GOOD.encode()), "text/csv")})
    assert r.status_code == 200, r.text
    body = r.json()
    assert body["rows_accepted"] == 2
    assert body["rows_rejected"] == 0
    assert body["run_id"]


def test_ingest_rejects_bad_rows_without_silent_drop():
    c = TestClient(app)
    _login(c)
    r = c.post("/api/runs/ingest", files={"file": ("bad.csv", io.BytesIO(BAD.encode()), "text/csv")})
    assert r.status_code == 200, r.text
    body = r.json()
    assert body["rows_accepted"] == 0
    assert body["rows_rejected"] == 2
    assert len(body["errors"]) == 3
    assert any("line 2" in e for e in body["errors"])
    assert any("line 3" in e for e in body["errors"])
