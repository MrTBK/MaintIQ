from app.db import SessionLocal
from app.models import Run
from app.scheduler import scheduled_detect_once


def test_scheduled_detect_creates_scheduled_run():
    run_id = scheduled_detect_once()
    assert run_id
    db = SessionLocal()
    try:
        run = db.query(Run).filter(Run.id == run_id).first()
        assert run is not None and run.trigger == "Scheduled (Cron)"
    finally:
        db.close()
