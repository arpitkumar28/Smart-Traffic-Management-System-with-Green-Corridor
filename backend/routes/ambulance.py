from fastapi import APIRouter
from pydantic import BaseModel

from database.supabase import demo_store
from services.corridor_service import activate_green_corridor

router = APIRouter(prefix="/ambulance")


class AmbulanceActivation(BaseModel):
    ambulanceId: str
    destination: str


@router.get("/")
def get_emergency_vehicles() -> list[dict]:
    return demo_store.ambulances + demo_store.fire_brigades


@router.post("/activate")
async def activate_ambulance(payload: AmbulanceActivation) -> dict:
    return await activate_green_corridor(payload.ambulanceId, payload.destination)
