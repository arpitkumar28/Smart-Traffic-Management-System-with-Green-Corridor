from __future__ import annotations

from typing import Any


def classify_risk(traffic_load: int) -> tuple[str, int, str]:
    if traffic_load > 80:
        return "High", 92, "Extend green time by 12 seconds"
    if traffic_load > 50:
        return "Medium", 78, "Balance adjacent intersections and add 6 seconds"
    return "Low", 64, "Maintain adaptive timing"


def predict_congestion(signals: list[dict[str, Any]]) -> dict[str, Any]:
    target = max(signals, key=lambda signal: int(signal["traffic_load"]))
    risk, confidence, action = classify_risk(int(target["traffic_load"]))
    return {
        "zone": target["name"],
        "risk": risk,
        "confidence": confidence,
        "recommendedAction": action,
    }
