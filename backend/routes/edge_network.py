from fastapi import APIRouter, HTTPException
from pydantic import BaseModel

from services.virtual_iot_service import virtual_iot

router = APIRouter(prefix="/edge-network")


class ScenarioRequest(BaseModel):
    scenario: str


@router.get("")
def get_nodes() -> dict:
    return {"mode": "SIMULATION", "scenario": virtual_iot.scenario, "nodes": virtual_iot.snapshot()}


@router.get("/{node_id}")
def get_node(node_id: str) -> dict:
    node = virtual_iot.get(node_id)
    if node is None:
        raise HTTPException(status_code=404, detail=f"IoT node {node_id} not found")
    return node


@router.post("/simulation/scenario")
async def set_scenario(payload: ScenarioRequest) -> dict:
    try:
        nodes = await virtual_iot.apply_scenario(payload.scenario)
    except ValueError as error:
        raise HTTPException(status_code=400, detail=str(error)) from error
    return {"mode": "SIMULATION", "scenario": virtual_iot.scenario, "nodes": nodes}


@router.post("/simulation/reset")
async def reset_simulation() -> dict:
    return {"mode": "SIMULATION", "scenario": virtual_iot.scenario, "nodes": await virtual_iot.reset()}


@router.post("/simulation/node/{node_id}/offline")
async def set_node_offline(node_id: str) -> dict:
    node = await virtual_iot.set_offline(node_id)
    if node is None:
        raise HTTPException(status_code=404, detail=f"IoT node {node_id} not found")
    return node