# MaintIQ — Industrial Predictive Maintenance Analytics

MaintIQ is a maintenance analytics platform: ingest sensor data, check its
quality, detect anomalies, score machine risk with explainable evidence, and
turn findings into work recommendations. Every number in the UI traces back
through the API to the database — nothing is hardcoded.

## What it does

- **Machines** — fleet table with search, filters, sorting, pagination, and a
  detail page per machine (sensor history, risk evidence, anomalies, failure
  and maintenance history, recommendations).
- **Sensor Trends** — machine/period/sensor selection, bucketed charts
  (raw/hour/day aggregation), statistics, and a rolling-z anomaly table.
- **Failures & Work Orders** — failure history with downtime stats; maintenance
  work-order lifecycle (Upcoming → In Progress → Completed, plus Overdue).
- **Risk** — transparent score per machine with primary driver and contributing
  factors. No black-box scores.
- **Recommendations** — rule-based, evidence-linked; approve/reject with RBAC.
- **Alerts** — Detected → Reviewed → Resolved, auto-created by detection runs.
- **Data Quality & Analysis Runs** — completeness/validity/consistency reports
  per ingestion; manual, CSV-upload, anomaly-detection, model-training, and
  scheduled runs.
- **Auth & Admin** — server-side sessions (HttpOnly cookies), five roles
  enforced in the backend, user management, audit log, server-stored alert
  thresholds.

## Stack

| Layer    | Tech                                                              |
| -------- | ----------------------------------------------------------------- |
| Frontend | React 19, TypeScript, Vite 8, Tailwind 4, Router 7, Recharts, Lucide |
| Backend  | FastAPI, Pydantic, SQLAlchemy, Alembic                            |
| Data/ML  | pandas-style CSV ingestion, scikit-learn (LogReg baseline)        |
| DB       | PostgreSQL (production) / SQLite (zero-setup dev)                 |
| Tests    | Pytest + TestClient, Vitest + RTL, Playwright smoke               |

## Quick start

```bash
bash run.sh
```

This creates the Python venv, installs dependencies, seeds demo data, starts
the API and the web app on free ports (it skips busy ones), prints the URL
plus login accounts, and opens the browser.

Seeded logins: `admin/admin123` (full access), `manager/manager123`
(maintenance actions), `viewer/viewer123` (read-only).

Manual setup and production variables (`MAINTIQ_DATABASE_URL`,
`MAINTIQ_SESSION_SECRET`, `MAINTIQ_CORS_ORIGINS`, `MAINTIQ_COOKIE_SECURE`)
are documented in [`docs/setup.md`](docs/setup.md).

Docker staging (Postgres + API + web):

```bash
API_PORT=8100 WEB_PORT=3100 docker compose up --build
```

## Data lineage

```
CSV → validation → data-quality report → PostgreSQL → trend stats
→ rolling-z anomalies → risk scores → recommendations → FastAPI → React
```

The bundled AI4I 2020 loader (`POST /api/runs/ingest-ai4i`) imports the real
10,000-row dataset (339 labeled failures) with a documented subset mapping —
columns the dataset doesn't have (vibration, pressure, current) are never
invented. Remaining Useful Life is out of scope: the dataset has no
degradation trajectories.

## Tests

```bash
cd backend && PYTHONPATH=. .venv/bin/python -m pytest -q   # backend (24)
npm test        # frontend unit (10)
npx playwright test   # browser smoke (login → overview → machine)
./node_modules/.bin/tsc --noEmit && npm run build
```

## Docs

- [`PROJECT_PLAN.md`](PROJECT_PLAN.md) — architecture decisions (D1–D11),
  phase checklist, known issues
- [`app.txt`](app.txt) — full implementation reference
- `docs/` — setup, architecture, database, API, data pipeline, data quality,
  ML, security, decisions, limitations
