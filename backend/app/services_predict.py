"""Supervised failure prediction on warehouse labels. Honest small-data modeling."""
import datetime as dt
import json
import uuid

from sklearn.linear_model import LogisticRegression
from sklearn.metrics import f1_score, precision_score, recall_score, roc_auc_score
from sklearn.model_selection import train_test_split
from sqlalchemy.orm import Session

from app.models import Anomaly, Failure, Machine, MaintenanceTask

FEATURES = ["risk_score", "operating_hours", "past_failures", "anomaly_count", "overdue_maint"]
LEAKAGE_NOTE = ("Features use only pre-failure state (risk, hours, past counts, "
                "anomalies, overdue). Excluded post-failure fields: downtime_hours, "
                "failure_type, maintenance_action, failure status.")


def build_rows(db: Session):
    fail_ids = {f.machine_id for f in db.query(Failure.machine_id).all()}
    rows = []
    for m in db.query(Machine).all():
        past = db.query(Failure).filter(Failure.machine_id == m.id).count()
        anom = db.query(Anomaly).filter(Anomaly.machine_id == m.id).count()
        od = db.query(MaintenanceTask).filter(MaintenanceTask.machine_id == m.id,
                                              MaintenanceTask.status == "Overdue").count()
        rows.append({"machine_id": m.id, "x": [m.risk_score, m.operating_hours, past, anom, od],
                     "y": 1 if m.id in fail_ids else 0})
    return rows


def train(db: Session) -> dict:
    from app.models import Run
    rows = build_rows(db)
    X = [r["x"] for r in rows]
    y = [r["y"] for r in rows]
    run_id = f"RUN-{int(dt.datetime.utcnow().timestamp())}-{uuid.uuid4().hex[:6]}"
    if len(set(y)) < 2 or len(rows) < 10:
        out = {"run_id": run_id, "model": "LogisticRegression", "features": FEATURES,
               "metrics": {"note": "insufficient labeled data", "n": len(rows), "positives": sum(y)},
               "leakage": LEAKAGE_NOTE, "limitations": "Warehouse has <10 labeled machines; model is a baseline scaffold, not production-grade."}
    else:
        Xtr, Xte, ytr, yte = train_test_split(X, y, test_size=0.3, random_state=42, stratify=y)
        clf = LogisticRegression(max_iter=1000)
        clf.fit(Xtr, ytr)
        p = clf.predict(Xte)
        try:
            auc = round(float(roc_auc_score(yte, clf.predict_proba(Xte)[:, 1])), 3)
        except ValueError:
            auc = None
        out = {"run_id": run_id, "model": "LogisticRegression", "features": FEATURES,
               "metrics": {"precision": round(float(precision_score(yte, p, zero_division=0)), 3),
                           "recall": round(float(recall_score(yte, p, zero_division=0)), 3),
                           "f1": round(float(f1_score(yte, p, zero_division=0)), 3),
                           "roc_auc": auc, "n_train": len(ytr), "n_test": len(yte)},
               "leakage": LEAKAGE_NOTE,
               "limitations": "Small warehouse sample; accuracy not reported (imbalanced). Compare RandomForest/XGBoost once AI4I labels land."}
    db.add(Run(id=run_id, completed=dt.datetime.utcnow(), dataset="warehouse", rows=len(rows),
               status="Completed", duration="", trigger="Manual",
               findings=json.dumps(out["metrics"]), log=json.dumps(out)))
    db.commit()
    return out
