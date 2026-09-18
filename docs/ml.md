# ML
Status: LogReg failure model trains on warehouse labels via
`POST /api/runs/train-failure-model` (`services_predict`: features risk,
hours, past failures, anomaly count, overdue; precision/recall/F1/ROC-AUC,
no accuracy theater, leakage note stored on the run). Verified on real AI4I
labels (339 failures): precision 1.0 / recall 0.5 / F1 0.67 / ROC-AUC 1.0 on a
7-machine holdout — small sample, reported as baseline, not production-grade. Anomaly stage-1
rolling-z ships (`POST /api/runs/detect` persists machine/sensor/ts/observed/
baseline/z/severity/method/run_id). Risk uses the transparent engine
(`services_risk`); recommendations are rule-based (`services_reco`).
RandomForest/XGBoost and IsolationForest only if they beat these baselines on
labeled data. RUL is out of scope: AI4I has no degradation trajectories.
