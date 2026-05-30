from __future__ import annotations

from typing import Any

from database.supabase import demo_store, get_supabase
from services.websocket_service import manager


async def activate_green_corridor(ambulance_id: str, destination: str) -> dict[str, Any]:
    eta_before = 8
    eta_after = 3
    # Route: Metro Junction -> Hospital Road
    route_signal_ids = {"SIG-01", "SIG-02"}

    # Signal coords for the route
    route_coords = [
        [28.6100, 77.2000],  # Start
        [28.6139, 77.2090],  # Metro Junction (SIG-01)
        [28.6155, 77.2150],  # Hospital Road (SIG-02)
    ]

    for signal in demo_store.signals:
        if signal["id"] in route_signal_ids:
            signal["status"] = "priority"
            signal["traffic_load"] = max(5, int(signal["traffic_load"]) - 40)

    for ambulance in demo_store.ambulances:
        if ambulance["id"] == ambulance_id:
            ambulance["destination"] = destination
            ambulance["eta"] = eta_after
            ambulance["status"] = "Green Corridor Active"
            # Move ambulance to the middle of the route for demo effect
            ambulance["lat"] = 28.6139
            ambulance["lng"] = 77.2090

    demo_store.analytics["response_time"] = 28
    demo_store.analytics["efficiency"] = 96
    demo_store.analytics["emergencyVehiclesAssisted"] += 1
    demo_store.analytics["hoursSaved"] += 0.8
    demo_store.analytics["co2_reduction"] += 5

    event = demo_store.event(f"EMERGENCY: Green Corridor activated for {ambulance_id} to {destination}", "green_corridor")
    
    demo_store.alerts.insert(
        0,
        {
            "id": len(demo_store.alerts) + 1,
            "title": "🚑 EMERGENCY PRIORITY",
            "description": f"Green Corridor established to {destination}. Signals synchronized.",
            "created_at": "live",
        },
    )

    response = {
        "status": "Green Corridor Activated",
        "type": "green_corridor",
        "ambulance": ambulance_id,
        "vehicleId": ambulance_id,
        "destination": destination,
        "etaBefore": eta_before,
        "etaAfter": eta_after,
        "timeSaved": eta_before - eta_after,
        "signalsOptimized": len(route_signal_ids),
        "signalsSynced": len(route_signal_ids),
        "route": list(route_signal_ids),
        "route_coords": route_coords,
    }
    
    await manager.broadcast("GREEN_CORRIDOR_ACTIVATED", response)
    await manager.broadcast("SIGNAL_UPDATE", {"signals": demo_store.signals})
    await manager.broadcast("ALERT_UPDATE", {"alerts": demo_store.alerts})
    await manager.broadcast("ANALYTICS_UPDATE", demo_store.analytics)
    
    return response
