# Architecture
React -> FastAPI REST -> Service layer -> SQLAlchemy repos -> PostgreSQL (SQLite dev fallback).
Services: ingest (validated CSV), services_dq (completeness/validity/duplicates/outliers),
services_analytics (bucketed trends + stats), services_anomaly (rolling-z),
services_risk (transparent score), services_reco (rule-based), services_predict (LogReg).
Detection runs refresh risk levels and create recommendations, keeping one lineage.
Auth: server sessions + HttpOnly SameSite=Lax cookie (+Secure in prod), bcrypt, RBAC enforced server-side.
Migrations: single metadata-driven Alembic init; clean-DB upgrade verified.
