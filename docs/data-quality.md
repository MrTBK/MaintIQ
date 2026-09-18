# Data Quality
Checks in `backend/app/services_dq.py::dq_report`: completeness (no
null/empty cells), validity (numeric where numeric), consistency (schema
conformance at ingestion), duplicates (exact-row), outliers (vibration > 15
mm/s or temperature > 120C on accepted rows). Every ingest writes a
`dq_reports` row (dataset, records, scores, counts) linked by dataset name to
its `runs` row; `GET /api/data-quality` serves the history. No hardcoded
scores: with zero accepted rows the report records zeros. Thresholds live in
`ingest.py::BOUNDS` (impossible-value rejects) and the DQ outlier rule above.
