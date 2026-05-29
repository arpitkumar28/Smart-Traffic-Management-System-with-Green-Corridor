from __future__ import annotations

from typing import Any

from database.supabase import demo_store, get_supabase
from services.websocket_service import manager


async def activate_green_corridor(ambulance_id: str, destination: str) -> dict[str, Any]:
    eta_before = 8
    eta_after = 4
    route_signal_ids = {"SIG-01", "SIG-02", "SIG-03", "SIG-04"}

    for signal in demo_store.signals:
        if signal["id"] in route_signal_ids:
            signal["status"] = "green"
            signal["traffic_load"] = max(10, int(signal["traffic_load"]) - 18)

    for ambulance in demo_store.ambulances:
        if ambulance["id"] == ambulance_id:
            ambulance["destination"] = destination
            ambulance["eta"] = eta_after
            ambulance["status"] = "Green Corridor Active"

    demo_store.analytics["response_time"] = 52
    demo_store.analytics["efficiency"] = 91
    demo_store.analytics["emergencyVehiclesAssisted"] += 1
    demo_store.analytics["hoursSaved"] += 1

    event = demo_store.event("Green Corridor activated", "emergency")
    demo_store.event("ETA reduced by 4 minutes", "analytics")
    demo_store.alerts.insert(
        0,
        {
            "id": len(demo_store.alerts) + 1,
            "title": "Green Corridor Active",
            "description": f"Ambulance {ambulance_id} routed to {destination}",
            "created_at": "live",
        },
    )

    supabase = get_supabase()
    if supabase:
        supabase.table("ambulances").upsert(
            {"id": ambulance_id, "vehicle_no": ambulance_id, "destination": destination, "eta": eta_after, "status": "Green Corridor Active"}
        ).execute()
        supabase.table("events").insert({"message": event["message"], "type": event["type"]}).execute()
        supabase.table("alerts").insert({"title": "Green Corridor Active", "description": f"Ambulance {ambulance_id} routed to {destination}"}).execute()

    response = {
        "status": "Green Corridor Activated",
        "etaBefore": eta_before,
        "etaAfter": eta_after,
        "timeSaved": eta_before - eta_after,
    }
    await manager.broadcast("ambulance_updates", response)
    await manager.broadcast("signal_updates", {"signals": demo_store.signals})
    await manager.broadcast("event_updates", {"event": event, "events": demo_store.events})
    await manager.broadcast("analytics_updates", demo_store.analytics)
    return response
