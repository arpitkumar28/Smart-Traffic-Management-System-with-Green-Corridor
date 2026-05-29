from fastapi import APIRouter

from database.supabase import demo_store

router = APIRouter()


@router.get("/dashboard")
def dashboard() -> dict:
    active_signals = sum(1 for signal in demo_store.signals if signal["status"] == "green")
    traffic_flow = round(100 - sum(int(signal["traffic_load"]) for signal in demo_store.signals) / len(demo_store.signals) * 0.42)
    return {
        "trafficFlow": traffic_flow,
        "vehiclesPerMinute": 1284,
        "avgWait": 42,
        "activeSignals": active_signals,
        "emergencyVehiclesActive": sum(1 for ambulance in demo_store.ambulances if ambulance["status"] != "Standby"),
        "aiPredictionConfidence": 92,
    }
