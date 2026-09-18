import time

from fastapi.testclient import TestClient

from app.main import app


def test_login_rate_limited():
    c = TestClient(app)
    statuses = set()
    for _ in range(12):
        r = c.post("/api/auth/login", json={"username": "nobody", "password": "wrong"})
        statuses.add(r.status_code)
    assert 429 in statuses


def test_security_headers_present():
    c = TestClient(app)
    r = c.get("/health")
    assert r.headers.get("X-Content-Type-Options") == "nosniff"
    assert r.headers.get("X-Frame-Options") == "DENY"
