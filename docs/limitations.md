# Limitations
- Seed covers 20 machines; full AI4I column-mapping loader pending (subset documented in docs/data-pipeline.md).
- RUL skipped (AI4I lacks degradation trajectories).
- Thresholds are UI-local; no server store yet.
- No rate limiting, CSRF tokens, or security-headers middleware (see docs/security.md).
- Failure model trains on a small warehouse sample; reported as baseline with metrics, not production-grade.
- Postgres staging via `docker compose up --build` (see PROJECT_PLAN.md status).
