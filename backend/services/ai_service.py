from __future__ import annotations

from typing import Any


def predict_congestion(signals: list[dict[str, Any]]) -> dict[str, Any]:
    # For Hackathon Demo: Highlight Civic Center specifically as requested
    return {
        "zone": "Civic Center",
        "risk": "High",
        "confidence": 92,
        "currentTraffic": "Moderate",
        "predictedTraffic": "Heavy (in 15 min)",
        "recommendedAction": "Extend green signal by 12 seconds to prevent gridlock",
    }
