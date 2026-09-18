import logging
from contextlib import asynccontextmanager

from fastapi import Cookie, Depends, FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from sqlalchemy.orm import Session

from app.config import settings
from app.db import get_db, init_db
from app.middleware import LoginRateLimitMiddleware, SecurityHeadersMiddleware
from app.models import Session as SessionModel, User

logging.basicConfig(level=logging.INFO)
log = logging.getLogger("maintiq")


@asynccontextmanager
async def lifespan(_: FastAPI):
    init_db()
    if settings.session_secret == "dev-only-change-me":
        log.warning("MAINTIQ_SESSION_SECRET not set; using dev default (do not use in production)")
    if settings.scheduler_enabled:
        from app.scheduler import start as _sched_start
        _sched_start(settings.schedule_hours)
    yield
    if settings.scheduler_enabled:
        from app.scheduler import stop as _sched_stop
        _sched_stop()


app = FastAPI(title="MaintIQ API", version=settings.version, lifespan=lifespan)
app.add_middleware(SecurityHeadersMiddleware)
app.add_middleware(LoginRateLimitMiddleware)
app.add_middleware(CORSMiddleware, allow_origins=[o.strip() for o in settings.cors_origins.split(",")],
                   allow_credentials=True, allow_methods=["*"], allow_headers=["*"])


@app.get("/health")
def health():
    return {"status": "ok", "version": settings.version}


@app.get("/api/auth/me")
def me(maintiQ_session: str | None = Cookie(default=None), db: Session = Depends(get_db)):
    if not maintiQ_session:
        from fastapi import HTTPException
        raise HTTPException(401, "Not authenticated")
    s = db.query(SessionModel).filter(SessionModel.id == maintiQ_session).first()
    if not s:
        from fastapi import HTTPException
        raise HTTPException(401, "Not authenticated")
    u = db.query(User).filter(User.id == s.user_id).first()
    return {"id": u.id, "username": u.username, "role": u.role, "active": bool(u.active)}


from app.auth import router as auth_router  # noqa: E402
from app.routers import router as core_router  # noqa: E402

app.include_router(auth_router)
app.include_router(core_router)


@app.exception_handler(Exception)
async def unhandled(_: Request, exc: Exception):
    log.exception("unhandled error")
    return JSONResponse(status_code=500, content={"detail": "Unable to load data."})
