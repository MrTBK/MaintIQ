import os

from sqlalchemy import create_engine, event
from sqlalchemy.orm import sessionmaker

from app.db import Base
import app.db
import app.models  # noqa: F401


def test_seed_respects_foreign_keys():
    path = "/tmp/mq-seed-fk.db"
    if os.path.exists(path):
        os.remove(path)
    e = create_engine(f"sqlite:///{path}")

    @event.listens_for(e, "connect")
    def _fk(dbapi_conn, _):
        cur = dbapi_conn.cursor()
        cur.execute("PRAGMA foreign_keys=ON")
        cur.close()

    Base.metadata.create_all(e)
    app.db.SessionLocal.configure(bind=e)
    try:
        from app.seed import run
        run()
        db = sessionmaker(bind=e)()
        assert db.query(app.models.Machine).count() == 20
        assert db.query(app.models.Alert).count() >= 1
    finally:
        app.db.SessionLocal.configure(bind=app.db.engine)
