from fastapi import APIRouter

from database.supabase import demo_store

router = APIRouter()


@router.get("/events")
def get_events() -> list[dict]:
    return demo_store.events
