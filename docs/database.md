# Database
Tables: users, sessions, machines, sensor_readings, failures, maintenance_tasks, risks, recommendations, alerts, data_sources, dq_reports, runs, audit_events.
Indexes: machines.risk_score, sensor_readings(machine_id, ts), failures.machine_id.
Migrations: Alembic (`backend/alembic/`, `alembic.ini`). Dev default SQLite
(`sqlite:///./maintiq.db`); production `MAINTIQ_DATABASE_URL=postgresql+psycopg://...`
(env override wired in `alembic/env.py`). Verified 2026-09-18: fresh SQLite →
`alembic upgrade head` → `app.seed` → pytest green. App `init_db()`
(create_all) remains only as dev/test convenience; production path is Alembic.
