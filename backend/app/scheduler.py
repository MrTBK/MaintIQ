"""Scheduled analysis runs (stdlib threads, no extra dependency)."""
import logging
import threading
import time

log = logging.getLogger("maintiq.scheduler")
_stop: threading.Event | None = None
_thread: threading.Thread | None = None


def scheduled_detect_once() -> str | None:
    from app.db import SessionLocal
    from app.services_detect import run_detection
    db = SessionLocal()
    try:
        out = run_detection(db)
        log.info("scheduled detect: %s (%s anomalies)", out["run_id"], out["anomalies_found"])
        return out["run_id"]
    except Exception:
        log.exception("scheduled detect failed")
        return None
    finally:
        db.close()


def _loop(interval_hours: float):
    global _stop
    assert _stop is not None
    while not _stop.wait(interval_hours * 3600):
        scheduled_detect_once()


def start(interval_hours: float = 24.0):
    global _stop, _thread
    if _thread is not None:
        return
    _stop = threading.Event()
    _thread = threading.Thread(target=_loop, args=(interval_hours,), daemon=True, name="maintiQ-scheduler")
    _thread.start()
    log.info("scheduler started every %sh", interval_hours)


def stop():
    global _stop, _thread
    if _stop is not None:
        _stop.set()
    _thread = None
