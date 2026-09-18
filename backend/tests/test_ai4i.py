import io

from fastapi.testclient import TestClient

from app.main import app

SAMPLE = """UDI,Product ID,Type,Air temperature [K],Process temperature [K],Rotational speed [rpm],Torque [Nm],Tool wear [min],Machine failure,TWF,HDF,PWF,OSF,RNF
90001,M14860,L,298.1,308.6,1551,42.8,0,0,0,0,0,0,0
90002,M14861,L,298.2,308.7,1408,46.3,3,0,0,0,0,0,0
90003,M14862,L,298.1,308.5,1498,49.4,5,0,0,0,0,0,0
90004,M14863,L,298.2,308.6,1433,39.5,7,0,0,0,0,0,0
90005,M14864,L,298.2,308.7,1408,40.0,9,1,0,1,0,0,0
90006,M14865,M,298.5,309.0,1600,45.0,200,1,1,0,0,0,0
"""


def _login(c: TestClient):
    r = c.post("/api/auth/login", json={"username": "admin", "password": "admin123"})
    assert r.status_code == 200, r.text


def _clean_sample():
    from app.db import SessionLocal
    from app.models import Failure
    db = SessionLocal()
    db.query(Failure).filter(Failure.id.in_(["AI4I-F-90005", "AI4I-F-90006"])).delete(synchronize_session=False)
    db.commit()
    db.close()


def test_ai4i_loader_creates_machines_and_failures():
    _clean_sample()
    c = TestClient(app)
    _login(c)
    r = c.post("/api/runs/ingest-ai4i", files={"file": ("ai4i.csv", io.BytesIO(SAMPLE.encode()), "text/csv")})
    assert r.status_code == 200, r.text
    body = r.json()
    assert body["rows_read"] == 6
    assert body["failures_created"] == 2
    assert set(body["machines"]) == {"AI4I-L", "AI4I-M"}
    assert body["run_id"]
    m = c.get("/api/machines/AI4I-L").json()
    assert m["machine"]["id"] == "AI4I-L"
    assert any(f["id"] == "AI4I-F-90005" for f in m["failures"])


def test_ai4i_loader_rerun_is_stable():
    c = TestClient(app)
    _login(c)
    before = c.get("/api/failures").json()["items"]
    n0 = len([f for f in before if f["id"].startswith("AI4I-F-")])
    c.post("/api/runs/ingest-ai4i", files={"file": ("ai4i.csv", io.BytesIO(SAMPLE.encode()), "text/csv")})
    after = c.get("/api/failures").json()["items"]
    n1 = len([f for f in after if f["id"].startswith("AI4I-F-")])
    assert n0 == n1
