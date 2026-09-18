from fastapi.testclient import TestClient

from app.main import app


def admin():
    c = TestClient(app)
    r = c.post("/api/auth/login", json={"username": "admin", "password": "admin123"})
    assert r.status_code == 200, r.text
    return c


def viewer():
    c = TestClient(app)
    c.post("/api/auth/login", json={"username": "viewer", "password": "viewer123"})
    return c


def test_alert_review_and_resolve():
    c = admin()
    aid = c.get("/api/alerts").json()["items"][0]["id"]
    assert c.post(f"/api/alerts/{aid}/review").status_code == 200
    r = c.post(f"/api/alerts/{aid}/resolve")
    assert r.status_code == 200 and r.json()["status"] == "Resolved"
    assert viewer().post(f"/api/alerts/{aid}/review").status_code == 403


def test_reco_and_maintenance_transitions():
    c = admin()
    rid = c.get("/api/recommendations").json()["items"][0]["id"]
    assert c.patch(f"/api/recommendations/{rid}", json={"status": "Approved"}).status_code == 200
    assert c.patch(f"/api/recommendations/{rid}", json={"status": "bogus"}).status_code == 422
    tid = c.get("/api/maintenance").json()["items"][0]["id"]
    assert c.patch(f"/api/maintenance/{tid}", json={"status": "In Progress"}).status_code == 200


def test_user_create_and_deactivate():
    import uuid
    c = admin()
    name = f"op-{uuid.uuid4().hex[:6]}"
    r = c.post("/api/users", json={"username": name, "password": "x12345678", "role": "VIEWER"})
    assert r.status_code == 200, r.text
    uid = r.json()["id"]
    assert c.patch(f"/api/users/{uid}", json={"active": 0}).status_code == 200
    assert c.post("/api/users", json={"username": name, "password": "x", "role": "VIEWER"}).status_code == 422
    assert viewer().post("/api/users", json={"username": "z", "password": "x12345678", "role": "VIEWER"}).status_code == 403
