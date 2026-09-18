"""Rule-based recommendations. Evidence first."""
import datetime as dt


def recommend(machine_id: str, vibration: float, vib_warn: float, vib_crit: float, temp: float, temp_crit: float) -> list[dict]:
    out = []
    if vibration >= vib_crit and temp >= temp_crit * 0.9:
        out.append({"id": f"REC-{machine_id}-BRG", "machine_id": machine_id, "priority": "High",
                    "recommendation": "Inspect bearing assembly within 48h",
                    "reason": f"Vibration {vibration} mm/s >= critical {vib_crit}; temperature {temp}C near critical",
                    "impact": "Avoid unplanned downtime ~24-48h", "status": "Pending", "window": "Next 48h", "downtime": "4h",
                    "generated_at": dt.datetime.utcnow()})
    elif vibration >= vib_warn:
        out.append({"id": f"REC-{machine_id}-VIB", "machine_id": machine_id, "priority": "Medium",
                    "recommendation": "Check vibration trend and impeller balance",
                    "reason": f"Vibration {vibration} above warning {vib_warn}",
                    "impact": "Early catch of imbalance/wear", "status": "Pending", "window": "Next 7 days", "downtime": "2h",
                    "generated_at": dt.datetime.utcnow()})
    return out
