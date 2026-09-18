# API
- GET /health
- POST /api/auth/login, GET /api/auth/me, POST /api/auth/logout
- GET /api/machines?page=&page_size=&q=&status=
- GET /api/machines/{id} (machine + readings + failures + maintenance + risk + recs)
- GET /api/machines/{id}/trend?sensor=&bucket= (raw/hour/day buckets + min/max/avg/current/baseline)
- GET /api/machines/{id}/anomalies (persisted rolling-z detections)
- POST /api/runs/detect (MANAGER+: rolling-z over all machines/sensors → anomalies + run + audit)
- POST /api/runs/train-failure-model (MANAGER+: LogReg on warehouse labels + metrics + leakage note)
- POST /api/runs/ingest-ai4i (MANAGER+: AI4I 2020 subset mapping — see docs/data-pipeline.md)
- GET /api/settings/thresholds, PUT /api/settings/thresholds (MANAGER+ writes)
- POST /api/alerts/{id}/review|/resolve, PATCH /api/recommendations/{id}, PATCH /api/maintenance/{id}
- POST /api/users, PATCH /api/users/{id} (ADMIN; no self-deactivate)
- GET /api/failures, /api/maintenance?status=, /api/risks, /api/recommendations, /api/alerts
- POST /api/alerts/{id}/review (MANAGER+)
- GET /api/data-sources, /api/data-quality, /api/runs, /api/users (ADMIN), /api/audit (ADMIN/MANAGER)
- POST /api/runs/ingest (multipart .csv, MANAGER+) — see docs/data-pipeline.md
Pagination: page/page_size (max 100). Sorting allowlist: risk_score desc server-side.
