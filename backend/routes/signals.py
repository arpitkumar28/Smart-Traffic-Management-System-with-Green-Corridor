from fastapi import APIRouter

from database.supabase import demo_store
from services.websocket_service import manager

router = APIRouter()


@router.get("/signals")
def get_signals() -> list[dict]:
    return demo_store.signals


@router.post("/signals/{signal_id}/state")
async def change_signal_state(signal_id: str, status: str) -> dict:
    for signal in demo_store.signals:
        if signal["id"] == signal_id:
            signal["status"] = status
            await manager.broadcast("signal_updates", {"signals": demo_store.signals})
            return signal
    return {"error": "Signal not found"}
