from fastapi import APIRouter, HTTPException
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
    vehicle = next(
        (item for item in demo_store.ambulances if item["id"] == payload.ambulanceId),
        None,
    )
    if vehicle is None:
        raise HTTPException(status_code=404, detail=f"Ambulance {payload.ambulanceId} not found")
    if vehicle["status"] == "Green Corridor Active":
        raise HTTPException(status_code=409, detail=f"Ambulance {payload.ambulanceId} corridor is already active")
    return await activate_green_corridor(payload.ambulanceId, payload.destination)
