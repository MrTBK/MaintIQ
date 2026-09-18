from fastapi.testclient import TestClient

from app.main import app
from app.services_dq import dq_report
from app.services_risk import score_machine


def test_risk_explains_drivers():
    r = score_machine(31.0, 14.0, 72.0, False, 1)
    assert r["risk_level"] in ("High", "Critical")
    assert "factors" in r and len(r["factors"]) >= 3
    assert r["primary_driver"]


def test_dq_counts():
    rows = [{"vibration": 5, "temperature": 70}, {"vibration": None, "temperature": 70}, {"vibration": 5, "temperature": 70}]
    rep = dq_report(rows)
    assert rep["records"] == 3
    assert rep["completeness"] < 100


def test_login_and_machines():
    c = TestClient(app)
    r = c.post("/api/auth/login", json={"username": "admin", "password": "admin123"})
    assert r.status_code == 200, r.text
    r2 = c.get("/api/machines?page=1&page_size=5")
    assert r2.status_code == 200, r2.text
    assert r2.json()["total"] >= 20


def test_rbac_viewer_blocked_from_users():
    c = TestClient(app)
    c.post("/api/auth/login", json={"username": "viewer", "password": "viewer123"})
    r = c.get("/api/users")
    assert r.status_code == 403
