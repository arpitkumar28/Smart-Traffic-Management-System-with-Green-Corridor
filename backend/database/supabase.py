from __future__ import annotations

import os
from typing import Any

from supabase import Client, create_client


def get_supabase() -> Client | None:
    url = os.getenv("SUPABASE_URL")
    key = os.getenv("SUPABASE_SERVICE_ROLE_KEY")
    if not url or not key:
        return None
    return create_client(url, key)


class DemoStore:
    def __init__(self) -> None:
        # Delhi Coordinates
        self.signals: list[dict[str, Any]] = [
            {"id": "SIG-01", "name": "Civic Center", "status": "green", "traffic_load": 35, "lat": 28.6328, "lng": 77.2195},
            {"id": "SIG-02", "name": "Metro Spine", "status": "yellow", "traffic_load": 60, "lat": 28.6139, "lng": 77.209},
            {"id": "SIG-03", "name": "Tech Park", "status": "red", "traffic_load": 90, "lat": 28.6448, "lng": 77.2321},
            {"id": "SIG-04", "name": "City Hospital Link", "status": "green", "traffic_load": 20, "lat": 28.6159, "lng": 77.215},
            {"id": "SIG-05", "name": "South Park", "status": "green", "traffic_load": 22, "lat": 28.6000, "lng": 77.2300},
        ]
        self.ambulances: list[dict[str, Any]] = [
            {"id": "AMB-102", "type": "ambulance", "vehicle_no": "DL-1C-AMB-102", "destination": "City Hospital", "eta": 8, "status": "Standby", "lat": 28.6200, "lng": 77.2000}
        ]
        self.fire_brigades: list[dict[str, Any]] = [
            {"id": "FIRE-09", "type": "fire_brigade", "vehicle_no": "DL-1C-FIRE-09", "destination": "None", "eta": 0, "status": "Station", "lat": 28.6250, "lng": 77.2250}
        ]
        self.alerts: list[dict[str, Any]] = [
            {"id": 1, "title": "AI Alert", "description": "AI detected congestion near Tech Park", "created_at": "10:21 PM"},
            {"id": 2, "title": "Signal", "description": "Signal SIG-03 optimized", "created_at": "10:22 PM"},
        ]
        self.analytics: dict[str, Any] = {
            "id": 1,
            "efficiency": 84,
            "response_time": 38,
            "co2_reduction": 27,
            "emergencyVehiclesAssisted": 18,
            "hoursSaved": 42,
            "trafficJamsPrevented": 64,
        }
        self.events: list[dict[str, Any]] = [
            {"id": 1, "message": "AI detected congestion", "type": "ai", "created_at": "10:20 PM"},
            {"id": 2, "message": "SIG-03 optimized", "type": "signal", "created_at": "10:21 PM"},
            {"id": 3, "message": "Emergency vehicle detected", "type": "emergency", "created_at": "10:22 PM"},
            {"id": 4, "message": "Green Corridor activated", "type": "green_corridor", "created_at": "10:23 PM"},
            {"id": 5, "message": "ETA reduced by 4 minutes", "type": "analytics", "created_at": "10:24 PM"},
        ]

    def event(self, message: str, event_type: str) -> dict[str, Any]:
        item = {
            "id": len(self.events) + 1,
            "message": message,
            "type": event_type,
            "created_at": "live",
        }
        self.events.insert(0, item)
        return item


demo_store = DemoStore()
