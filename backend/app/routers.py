import json

from fastapi import APIRouter, Depends, HTTPException, Query, UploadFile
from sqlalchemy.orm import Session

from app.db import get_db
from app.deps import get_current_user, require_role
from app.models import Alert, AuditEvent, DataSource, DQReport, Failure, Machine, MaintenanceTask, Recommendation, Risk, Run, SensorReading, User

router = APIRouter(prefix="/api", tags=["core"])


def paginate(q, page: int, size: int):
    total = q.count()
    items = q.offset((page - 1) * size).limit(size).all()
    return {"items": items, "total": total, "page": page, "page_size": size}


@router.get("/machines")
def machines(page: int = 1, page_size: int = Query(20, le=100), q: str = "", status: str = "", db: Session = Depends(get_db), _=Depends(get_current_user)):
    query = db.query(Machine)
    if q:
        query = query.filter(Machine.name.ilike(f"%{q}%"))
    if status:
        query = query.filter(Machine.status == status)
    query = query.order_by(Machine.risk_score.desc())
    return paginate(query, page, page_size)


@router.get("/machines/{mid}")
def machine(mid: str, db: Session = Depends(get_db), _=Depends(get_current_user)):
    m = db.query(Machine).filter(Machine.id == mid).first()
    if not m:
        raise HTTPException(404, "Machine not found")
    readings = db.query(SensorReading).filter(SensorReading.machine_id == mid).order_by(SensorReading.ts.desc()).limit(200).all()
    failures = db.query(Failure).filter(Failure.machine_id == mid).all()
    maint = db.query(MaintenanceTask).filter(MaintenanceTask.machine_id == mid).all()
    risk = db.query(Risk).filter(Risk.machine_id == mid).first()
    recs = db.query(Recommendation).filter(Recommendation.machine_id == mid).all()
    return {"machine": m, "readings": list(reversed(readings)), "failures": failures, "maintenance": maint, "risk": risk, "recommendations": recs}


@router.get("/failures")
def failures(page: int = 1, page_size: int = Query(50, le=200), db: Session = Depends(get_db), _=Depends(get_current_user)):
    return paginate(db.query(Failure).order_by(Failure.detected_at.desc()), page, page_size)


@router.get("/maintenance")
def maintenance(status: str = "", page: int = 1, page_size: int = Query(50, le=200), db: Session = Depends(get_db), _=Depends(get_current_user)):
    q = db.query(MaintenanceTask)
    if status:
        q = q.filter(MaintenanceTask.status == status)
    return paginate(q.order_by(MaintenanceTask.due_date), page, page_size)


@router.get("/risks")
def risks(db: Session = Depends(get_db), _=Depends(get_current_user)):
    return db.query(Risk).order_by(Risk.risk_score.desc()).all()


@router.get("/recommendations")
def recs(page: int = 1, page_size: int = Query(50, le=200), db: Session = Depends(get_db), _=Depends(get_current_user)):
    return paginate(db.query(Recommendation).order_by(Recommendation.generated_at.desc()), page, page_size)


@router.get("/alerts")
def alerts(page: int = 1, page_size: int = Query(50, le=200), db: Session = Depends(get_db), _=Depends(get_current_user)):
    return paginate(db.query(Alert).order_by(Alert.timestamp.desc()), page, page_size)


@router.post("/alerts/{aid}/review")
def review_alert(aid: str, db: Session = Depends(get_db), user=Depends(require_role("ADMIN", "MAINTENANCE_MANAGER", "RELIABILITY_ENGINEER"))):
    a = db.query(Alert).filter(Alert.id == aid).first()
    if not a:
        raise HTTPException(404, "Not found")
    a.status = "Reviewed"
    db.add(AuditEvent(user=user.username, role=user.role, action="review alert", resource=aid, result="Success"))
    db.commit()
    return {"ok": True}


@router.get("/data-sources")
def sources(db: Session = Depends(get_db), _=Depends(get_current_user)):
    return db.query(DataSource).all()


@router.get("/data-quality")
def dq(db: Session = Depends(get_db), _=Depends(get_current_user)):
    return db.query(DQReport).order_by(DQReport.created_at.desc()).limit(20).all()


@router.get("/runs")
def runs(page: int = 1, page_size: int = Query(50, le=200), db: Session = Depends(get_db), _=Depends(get_current_user)):
    return paginate(db.query(Run).order_by(Run.started.desc()), page, page_size)


@router.get("/machines/{mid}/trend")
def machine_trend(mid: str, sensor: str = "vibration", bucket: str = "hour",
                  db: Session = Depends(get_db), _=Depends(get_current_user)):
    from app.services_analytics import SENSORS, trend
    if sensor not in SENSORS:
        raise HTTPException(422, f"sensor must be one of {','.join(SENSORS)}")
    if bucket not in ("raw", "hour", "day"):
        raise HTTPException(422, "bucket must be raw, hour, or day")
    if not db.query(Machine).filter(Machine.id == mid).first():
        raise HTTPException(404, "Machine not found")
    readings = db.query(SensorReading).filter(SensorReading.machine_id == mid).order_by(SensorReading.ts).limit(20000).all()
    return trend(readings, sensor, bucket)


@router.get("/machines/{mid}/anomalies")
def machine_anomalies(mid: str, db: Session = Depends(get_db), _=Depends(get_current_user)):
    from app.models import Anomaly
    if not db.query(Machine).filter(Machine.id == mid).first():
        raise HTTPException(404, "Machine not found")
    return db.query(Anomaly).filter(Anomaly.machine_id == mid).order_by(Anomaly.ts.desc()).limit(500).all()


@router.post("/runs/detect")
def detect_run(db: Session = Depends(get_db), user=Depends(require_role("ADMIN", "MAINTENANCE_MANAGER", "RELIABILITY_ENGINEER"))):
    from app.services_detect import run_detection
    out = run_detection(db, triggered_by=user.username, role=user.role)
    db.query(Run).filter(Run.id == out["run_id"]).update({"trigger": "Manual"})
    db.commit()
    return out


@router.post("/runs/ingest")
def ingest(file: UploadFile, db: Session = Depends(get_db), user=Depends(require_role("ADMIN", "MAINTENANCE_MANAGER", "RELIABILITY_ENGINEER"))):
    from app.ingest import ingest_csv
    if not file.filename.endswith(".csv"):
        raise HTTPException(422, "Only .csv files accepted")
    return ingest_csv(db, file.filename, file.file.read(), user.username, user.role)


@router.post("/runs/train-failure-model")
def train_failure_model(db: Session = Depends(get_db), user=Depends(require_role("ADMIN", "MAINTENANCE_MANAGER", "RELIABILITY_ENGINEER"))):
    from app.services_predict import train
    out = train(db)
    db.add(AuditEvent(user=user.username, role=user.role, action="train failure model", resource=out["run_id"],
                      result="Success", details=json.dumps(out["metrics"])))
    db.commit()
    return out


@router.post("/runs/ingest-ai4i")
def ingest_ai4i(file: UploadFile, db: Session = Depends(get_db), user=Depends(require_role("ADMIN", "MAINTENANCE_MANAGER", "RELIABILITY_ENGINEER"))):
    from app.ingest_ai4i import load_ai4i
    if not file.filename.endswith(".csv"):
        raise HTTPException(422, "Only .csv files accepted")
    return load_ai4i(db, file.filename, file.file.read(), user.username, user.role)


@router.get("/users")
def users(db: Session = Depends(get_db), user=Depends(require_role("ADMIN",))):
    return [{"id": u.id, "username": u.username, "role": u.role, "display_name": u.display_name,
             "email": u.email, "active": bool(u.active)} for u in db.query(User).all()]


@router.get("/audit")
def audit(page: int = 1, page_size: int = Query(100, le=200), db: Session = Depends(get_db), user=Depends(require_role("ADMIN", "MAINTENANCE_MANAGER"))):
    from app.models import AuditEvent as AE
    rows = paginate(db.query(AE).order_by(AE.ts.desc()), page, page_size)
    rows["items"] = [{"id": e.id, "ts": e.ts.isoformat(), "user": e.user, "role": e.role, "action": e.action,
                      "resource": e.resource, "result": e.result, "details": e.details} for e in rows["items"]]
    return rows


DEFAULT_THRESHOLDS = {"tempWarning": 75.0, "tempCritical": 85.0, "vibWarning": 5.5, "vibCritical": 6.5,
                      "pressureWarning": 9.5, "pressureCritical": 11.0, "rpmWarning": 3550.0, "rpmCritical": 3650.0}


@router.get("/settings/thresholds")
def get_thresholds(db: Session = Depends(get_db), _=Depends(get_current_user)):
    import json as _json
    from app.models import Setting
    row = db.query(Setting).filter(Setting.key == "thresholds").first()
    if not row:
        return DEFAULT_THRESHOLDS
    try:
        out = dict(DEFAULT_THRESHOLDS)
        out.update({k: float(v) for k, v in _json.loads(row.value).items() if k in out})
        return out
    except (ValueError, TypeError):
        return DEFAULT_THRESHOLDS


@router.put("/settings/thresholds")
def put_thresholds(payload: dict, db: Session = Depends(get_db), user=Depends(require_role("ADMIN", "MAINTENANCE_MANAGER"))):
    import datetime as dt
    import json as _json
    from app.models import Setting
    clean = {k: float(payload[k]) for k in DEFAULT_THRESHOLDS if k in payload}
    if not clean:
        raise HTTPException(422, "No known threshold fields")
    row = db.query(Setting).filter(Setting.key == "thresholds").first()
    merged = dict(DEFAULT_THRESHOLDS)
    if row:
        try:
            merged.update({k: float(v) for k, v in _json.loads(row.value).items() if k in merged})
        except (ValueError, TypeError):
            pass
    merged.update(clean)
    if row:
        row.value = _json.dumps(merged)
        row.updated_at = dt.datetime.utcnow()
    else:
        db.add(Setting(key="thresholds", value=_json.dumps(merged)))
    db.add(AuditEvent(user=user.username, role=user.role, action="update thresholds", resource="settings",
                      result="Success", details=_json.dumps(clean)))
    db.commit()
    return merged


def _set_alert(aid: str, status: str, action: str, db: Session, user):
    a = db.query(Alert).filter(Alert.id == aid).first()
    if not a:
        raise HTTPException(404, "Not found")
    a.status = status
    db.add(AuditEvent(user=user.username, role=user.role, action=action, resource=aid, result="Success"))
    db.commit()
    return {"ok": True, "status": status}


@router.post("/alerts/{aid}/resolve")
def resolve_alert(aid: str, db: Session = Depends(get_db), user=Depends(require_role("ADMIN", "MAINTENANCE_MANAGER", "RELIABILITY_ENGINEER"))):
    return _set_alert(aid, "Resolved", "resolve alert", db, user)


@router.patch("/recommendations/{rid}")
def update_reco(rid: str, payload: dict, db: Session = Depends(get_db), user=Depends(require_role("ADMIN", "MAINTENANCE_MANAGER"))):
    r = db.query(Recommendation).filter(Recommendation.id == rid).first()
    if not r or payload.get("status") not in ("Approved", "Rejected", "Completed"):
        raise HTTPException(404 if not r else 422, "Not found" if not r else "Bad status")
    r.status = payload["status"]
    db.add(AuditEvent(user=user.username, role=user.role, action=f"recommendation {r.status.lower()}", resource=rid, result="Success"))
    db.commit()
    return {"ok": True, "status": r.status}


@router.patch("/maintenance/{tid}")
def update_maint(tid: str, payload: dict, db: Session = Depends(get_db), user=Depends(require_role("ADMIN", "MAINTENANCE_MANAGER"))):
    t = db.query(MaintenanceTask).filter(MaintenanceTask.id == tid).first()
    if not t or payload.get("status") not in ("Upcoming", "In Progress", "Completed", "Overdue"):
        raise HTTPException(404 if not t else 422, "Not found" if not t else "Bad status")
    t.status = payload["status"]
    db.add(AuditEvent(user=user.username, role=user.role, action=f"maintenance {t.status.lower()}", resource=tid, result="Success"))
    db.commit()
    return {"ok": True, "status": t.status}


@router.post("/users")
def create_user(payload: dict, db: Session = Depends(get_db), user=Depends(require_role("ADMIN",))):
    from app.auth import hash_pw
    if not payload.get("username") or not payload.get("password") or payload.get("role") not in ("ADMIN", "MAINTENANCE_MANAGER", "RELIABILITY_ENGINEER", "ANALYST", "VIEWER"):
        raise HTTPException(422, "username, password, valid role required")
    if db.query(User).filter(User.username == payload["username"]).first():
        raise HTTPException(422, "username taken")
    u = User(username=payload["username"], password_hash=hash_pw(payload["password"]), role=payload["role"],
             display_name=payload.get("display_name", ""), email=payload.get("email", ""))
    db.add(u)
    db.add(AuditEvent(user=user.username, role=user.role, action="create user", resource=payload["username"], result="Success"))
    db.commit()
    return {"id": u.id, "username": u.username, "role": u.role, "display_name": u.display_name, "email": u.email}


@router.patch("/users/{uid}")
def update_user(uid: int, payload: dict, db: Session = Depends(get_db), user=Depends(require_role("ADMIN",))):
    u = db.query(User).filter(User.id == uid).first()
    if not u:
        raise HTTPException(404, "Not found")
    if u.username == user.username and not payload.get("active", 1):
        raise HTTPException(422, "Cannot deactivate self")
    if "active" in payload:
        u.active = 1 if payload["active"] else 0
    db.add(AuditEvent(user=user.username, role=user.role, action="update user", resource=u.username, result="Success"))
    db.commit()
    return {"ok": True}
