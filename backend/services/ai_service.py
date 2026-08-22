from __future__ import annotations

from typing import Any


def predict_congestion(signals: list[dict[str, Any]]) -> dict[str, Any]:
    # For Hackathon Demo: Highlight Civic Center specifically as requested
    recommendation = "Extend green signal by 12 seconds to prevent gridlock"
    return {
        "zone": "Civic Center",
        "risk": "High",
        "confidence": 92,
        "currentTraffic": "Moderate",
        "predictedTraffic": "Heavy (in 15 min)",
        "recommendedAction": recommendation,
        "recommended_action": recommendation,
        "why": "Hospital Road traffic is trending toward gridlock within the next 15 minutes.",
    }
