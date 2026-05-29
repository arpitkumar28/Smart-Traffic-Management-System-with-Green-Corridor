from fastapi import APIRouter

from database.supabase import demo_store

router = APIRouter()


@router.get("/analytics")
def get_analytics() -> dict:
    return demo_store.analytics
