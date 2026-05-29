from fastapi import APIRouter

from database.supabase import demo_store
from services.ai_service import predict_congestion

router = APIRouter()


@router.get("/prediction")
def prediction() -> dict:
    return predict_congestion(demo_store.signals)
