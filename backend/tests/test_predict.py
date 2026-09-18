from fastapi.testclient import TestClient

from app.main import app


def _login(c: TestClient):
    r = c.post("/api/auth/login", json={"username": "admin", "password": "admin123"})
    assert r.status_code == 200, r.text


def test_failure_model_reports_honest_metrics():
    c = TestClient(app)
    _login(c)
    r = c.post("/api/runs/train-failure-model")
    assert r.status_code == 200, r.text
    body = r.json()
    assert body["model"] == "LogisticRegression"
    assert {"precision", "recall", "f1", "roc_auc", "n_train", "n_test"} <= set(body["metrics"])
    assert "leakage" in body and body["features"]
    # no post-failure / target-derived features allowed
    banned = {"downtime_hours", "failure_type", "maintenance_action", "status"}
    assert not (set(body["features"]) & banned)


def test_failure_model_deterministic():
    c = TestClient(app)
    _login(c)
    a = c.post("/api/runs/train-failure-model").json()["metrics"]
    b = c.post("/api/runs/train-failure-model").json()["metrics"]
    assert a == b
