from fastapi import APIRouter
from pydantic import BaseModel

from database.supabase import demo_store
from services.websocket_service import manager

router = APIRouter()


class AlertCreate(BaseModel):
    title: str
    description: str


@router.get("/alerts")
def get_alerts() -> list[dict]:
    return demo_store.alerts


@router.post("/alerts")
async def create_alert(alert: AlertCreate) -> dict:
    item = {"id": len(demo_store.alerts) + 1, "title": alert.title, "description": alert.description, "created_at": "live"}
    demo_store.alerts.insert(0, item)
    await manager.broadcast("alert_updates", {"alert": item, "alerts": demo_store.alerts})
    return item
