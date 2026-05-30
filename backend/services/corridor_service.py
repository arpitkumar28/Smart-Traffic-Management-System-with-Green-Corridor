from __future__ import annotations

from typing import Any

from database.supabase import demo_store, get_supabase
from services.websocket_service import manager


async def activate_green_corridor(ambulance_id: str, destination: str) -> dict[str, Any]:
    eta_before = 8
    eta_after = 4
    route_signal_ids = {"SIG-01", "SIG-02", "SIG-04"} # Civic Center, Metro Spine, Hospital Link

    # Map signal IDs to coordinates for the polyline
    signal_coords = {s["id"]: (s["lat"], s["lng"]) for s in demo_store.signals}
    
    # Simple route: Start at ambulance (28.6200, 77.2000) -> SIG-02 -> SIG-01 -> SIG-04
    route_coords = [
        [28.6200, 77.2000],
        [28.6139, 77.209],  # SIG-02
        [28.6328, 77.2195], # SIG-01
        [28.6159, 77.215],  # SIG-04
    ]

    for signal in demo_store.signals:
        if signal["id"] in route_signal_ids:
            signal["status"] = "priority"
            signal["traffic_load"] = max(10, int(signal["traffic_load"]) - 25)

    for ambulance in demo_store.ambulances:
        if ambulance["id"] == ambulance_id:
            ambulance["destination"] = destination
            ambulance["eta"] = eta_after
            ambulance["status"] = "Green Corridor Active"
            # Move ambulance closer to destination for demo
            ambulance["lat"] = 28.6180
            ambulance["lng"] = 77.2100

    demo_store.analytics["response_time"] = 32
    demo_store.analytics["efficiency"] = 94
    demo_store.analytics["emergencyVehiclesAssisted"] += 1
    demo_store.analytics["hoursSaved"] += 0.5

    event = demo_store.event(f"Green Corridor activated for {ambulance_id}", "green_corridor")
    
    demo_store.alerts.insert(
        0,
        {
            "id": len(demo_store.alerts) + 1,
            "title": "EMERGENCY PRIORITY",
            "description": f"Green Corridor established for {ambulance_id} to {destination}",
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
