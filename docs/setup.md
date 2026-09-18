# Setup
Prereqs: Python 3.10+, Node 20+. Quickest: `bash run.sh` (builds venv,
installs deps, seeds, starts API :8000 + web :3000).
Manual backend: `python3 -m venv backend/.venv &&
backend/.venv/bin/pip install -r backend/requirements.txt &&
cd backend && PYTHONPATH=. .venv/bin/python -m app.seed &&
PYTHONPATH=. .venv/bin/uvicorn app.main:app --port 8000`.
Manual frontend: `npm install --legacy-peer-deps &&
VITE_API_URL=http://localhost:8000 npm run dev`.
Production DB: `MAINTIQ_DATABASE_URL=postgresql+psycopg://user:pass@host/db`
then `alembic upgrade head`. Docker: `docker compose up --build`.
Seed logins: admin/admin123 (ADMIN), manager/manager123
(MAINTENANCE_MANAGER), viewer/viewer123 (VIEWER).
