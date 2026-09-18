# Data Pipeline

## Sensor readings CSV (implemented)
`POST /api/runs/ingest` (multipart file, roles ADMIN / MAINTENANCE_MANAGER /
RELIABILITY_ENGINEER). Header must be exactly:
`machine_id,ts,temperature,vibration,pressure,rpm,current`.
Steps in `backend/app/ingest.py`: UTF-8 + schema check → per-row type check
(ISO ts, numeric) → business rules (machine must exist; ranges: temp
-50..150C, vibration 0..25 mm/s, pressure 0..20 bar, rpm 0..6000, current
0..500A) → DQ report (`services_dq`) → bulk load `sensor_readings` → `runs`
row (accepted/rejected counts, duration) + `dq_reports` row + audit event.
Bad rows are returned with line-numbered reasons (max 50) — never silently
dropped. Try: `data/demo/readings-sample.csv`.

## AI4I 2020 loader (implemented, verified on the real 10k-row file)
`POST /api/runs/ingest-ai4i` validates the exact UCI schema, then maps a
documented subset: one machine per product type (AI4I-L/M/H) with
failure-rate-derived risk, one `failures` row per `Machine failure = 1`
(typed by cause flag: Tool Wear / Heat Dissipation / Power Fault / Overstrain /
Random Failure), plus DQ report + run + audit rows. Verified 2026-09-18:
10,000 rows accepted, 0 rejected, 339 failures created. Honest limits: the
source has no timestamps (failure detected_at = ingestion time, UDI order is
the sequence) and no vibration/pressure/current sensors — those are never
invented, so `sensor_readings` stay untouched. Parent rows are flushed before
children (see D9).
