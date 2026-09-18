from fastapi.testclient import TestClient

from app.main import app


def admin():
    c = TestClient(app)
    r = c.post("/api/auth/login", json={"username": "admin", "password": "admin123"})
    assert r.status_code == 200, r.text
    return c


def test_thresholds_roundtrip_and_defaults():
    c = admin()
    d = c.get("/api/settings/thresholds").json()
    assert d["vibWarning"] == 5.5 and d["tempCritical"] == 85.0
    r = c.put("/api/settings/thresholds", json={"vibWarning": 6.0})
    assert r.status_code == 200 and r.json()["vibWarning"] == 6.0
    assert c.get("/api/settings/thresholds").json()["vibWarning"] == 6.0
    c.put("/api/settings/thresholds", json={"vibWarning": 5.5})
    assert c.put("/api/settings/thresholds", json={"nope": 1}).status_code == 422


def test_thresholds_write_requires_manager():
    c = TestClient(app)
    c.post("/api/auth/login", json={"username": "viewer", "password": "viewer123"})
    assert c.put("/api/settings/thresholds", json={"vibWarning": 9.0}).status_code == 403
