from fastapi.testclient import TestClient

from app.main import app


def _login(c: TestClient):
    r = c.post("/api/auth/login", json={"username": "admin", "password": "admin123"})
    assert r.status_code == 200, r.text


def test_paged_lists_return_items_and_totals():
    c = TestClient(app)
    _login(c)
    for path in ("/api/failures", "/api/alerts", "/api/recommendations", "/api/maintenance", "/api/runs"):
        body = c.get(f"{path}?page=1&page_size=2").json()
        assert set(body) == {"items", "total", "page", "page_size"}, path
        assert body["page"] == 1 and body["page_size"] == 2
        assert body["total"] >= len(body["items"])
    assert c.get("/api/alerts?page=1&page_size=500").status_code == 422
