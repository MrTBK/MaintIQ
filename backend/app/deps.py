from fastapi import Cookie, Depends, HTTPException
from sqlalchemy.orm import Session

from app.db import get_db
from app.models import Session as SessionModel, User

COOKIE = "maintiQ_session"
ROLES = ["ADMIN", "MAINTENANCE_MANAGER", "RELIABILITY_ENGINEER", "ANALYST", "VIEWER"]


def get_current_user(maintiQ_session: str | None = Cookie(default=None), db: Session = Depends(get_db)) -> User:
    if not maintiQ_session:
        raise HTTPException(401, "Not authenticated")
    s = db.query(SessionModel).filter(SessionModel.id == maintiQ_session).first()
    if not s:
        raise HTTPException(401, "Not authenticated")
    u = db.query(User).filter(User.id == s.user_id, User.active == 1).first()
    if not u:
        raise HTTPException(401, "Not authenticated")
    return u


def require_role(*allowed: str):
    def check(user: User = Depends(get_current_user)):
        if user.role not in allowed and user.role != "ADMIN":
            raise HTTPException(403, "Forbidden")
        return user

    return check
