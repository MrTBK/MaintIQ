"""Transparent risk engine. No black-box scores."""
import json


def level(score: float) -> str:
    if score >= 80:
        return "Critical"
    if score >= 60:
        return "High"
    if score >= 35:
        return "Medium"
    return "Low"


def score_machine(vib_dev: float, temp_dev: float, fail_prob: float, overdue: bool, past_failures: int) -> dict:
    factors = []
    s = 0.0
    w_vib, w_temp, w_prob = 35.0, 25.0, 25.0
    s += min(w_vib, max(0.0, vib_dev) * 1.0)
    factors.append({"factor": "Vibration deviation %", "contribution": round(min(w_vib, max(0, vib_dev)), 1), "value": f"{vib_dev:.1f}%", "baseline": "0%", "status": "critical" if vib_dev > 25 else "elevated" if vib_dev > 10 else "normal"})
    s += min(w_temp, max(0.0, temp_dev) * 1.0)
    factors.append({"factor": "Temperature deviation %", "contribution": round(min(w_temp, max(0, temp_dev)), 1), "value": f"{temp_dev:.1f}%", "baseline": "0%", "status": "critical" if temp_dev > 20 else "elevated" if temp_dev > 8 else "normal"})
    s += fail_prob * 0.25
    factors.append({"factor": "Failure probability", "contribution": round(fail_prob * 0.25, 1), "value": f"{fail_prob:.0f}%", "baseline": "<20%", "status": "critical" if fail_prob > 60 else "elevated" if fail_prob > 30 else "normal"})
    if overdue:
        s += 10
        factors.append({"factor": "Overdue maintenance", "contribution": 10, "value": "overdue", "baseline": "on-time", "status": "elevated"})
    s += min(5, past_failures * 2.5)
    score = round(min(100.0, s), 1)
    primary = max(factors, key=lambda f: f["contribution"])["factor"]
    return {"risk_score": score, "risk_level": level(score), "primary_driver": primary, "factors": factors, "evidence_json": json.dumps(factors)}
