# Security
- No tokens in localStorage (verified via grep).
- HttpOnly SameSite=Lax session cookie, Secure flag via MAINTIQ_COOKIE_SECURE (set true in production); bcrypt hashes, server-side RBAC (deps.require_role).
- CORS allowlist via MAINTIQ_CORS_ORIGINS (default localhost:3000); parameterized SQLAlchemy queries only; generic 500 messages.
- Startup warns when MAINTIQ_SESSION_SECRET is left on the dev default.
- Known gaps (documented, not hidden): rate limiting is login-scoped only, no CSRF tokens (SameSite=Lax only), no CSP/HSTS headers — add before internet exposure.
