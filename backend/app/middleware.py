"""Minimal hardening: login rate limit + security headers. No new dependencies."""
import time

from starlette.middleware.base import BaseHTTPMiddleware
from starlette.responses import JSONResponse

LOGIN_LIMIT = 10
LOGIN_WINDOW = 60.0
_hits: dict[str, list[float]] = {}


class SecurityHeadersMiddleware(BaseHTTPMiddleware):
    async def dispatch(self, request, call_next):
        resp = await call_next(request)
        resp.headers["X-Content-Type-Options"] = "nosniff"
        resp.headers["X-Frame-Options"] = "DENY"
        resp.headers["Referrer-Policy"] = "same-origin"
        return resp


class LoginRateLimitMiddleware(BaseHTTPMiddleware):
    async def dispatch(self, request, call_next):
        if request.url.path == "/api/auth/login" and request.method == "POST":
            ip = request.client.host if request.client else "unknown"
            now = time.time()
            window = [t for t in _hits.get(ip, []) if now - t < LOGIN_WINDOW]
            if len(window) >= LOGIN_LIMIT:
                return JSONResponse(status_code=429, content={"detail": "Too many login attempts. Try again later."})
            window.append(now)
            _hits[ip] = window
        return await call_next(request)


def reset_rate_limits():
    _hits.clear()
