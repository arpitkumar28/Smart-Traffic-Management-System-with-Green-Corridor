from __future__ import annotations

from copy import deepcopy
from datetime import datetime, timezone
from typing import Any

from services.websocket_service import manager

NODE_IDS = ["GF-J01", "GF-J02", "GF-J03", "GF-J04", "GF-J05"]
SCENARIOS = {"NORMAL", "CONGESTION", "EMERGENCY", "NODE_OFFLINE", "SIGNAL_WARNING"}


def _now() -> str:
    return datetime.now(timezone.utc).isoformat()


class VirtualIoTService:
    def __init__(self) -> None:
        self._normal_nodes = [
            self._node("GF-J01", "J01", "Central Avenue", 24, 180, "GREEN", "GO", 24, 28.6139, 77.2090),
            self._node("GF-J02", "J02", "Hospital Link", 17, 120, "GREEN", "GO", 18, 28.6155, 77.2150),
            self._node("GF-J03", "J03", "Civic Center", 19, 160, "RED", "STOP", 31, 28.6328, 77.2195),
            self._node("GF-J04", "J04", "South Park", 14, 100, "GREEN", "GO", 21, 28.6000, 77.2300),
            self._node("GF-J05", "J05", "Transit Square", 11, 80, "RED", "STOP", 12, 28.6060, 77.2180),
        ]
        self.nodes: list[dict[str, Any]] = deepcopy(self._normal_nodes)
        self.scenario = "NORMAL"

    @staticmethod
    def _node(node_id: str, intersection_id: str, name: str, vehicles: int, queue: int, signal: str, phase: str, remaining: int, latitude: float, longitude: float) -> dict[str, Any]:
        return {
            "nodeId": node_id,
            "intersectionId": intersection_id,
            "name": name,
            "status": "ONLINE",
            "mode": "SIMULATION",
            "vehicleCount": vehicles,
            "queueLengthMeters": queue,
            "signalState": signal,
            "signalPhase": phase,
            "phaseRemainingSeconds": remaining,
            "connectivity": "CONNECTED",
            "latitude": latitude,
            "longitude": longitude,
            "lastUpdated": _now(),
            "firmwareVersion": "virtual-1.0",
            "sensorStatus": "SIMULATED",
            "signalControllerStatus": "SIMULATED",
        }

    def snapshot(self) -> list[dict[str, Any]]:
        return deepcopy(self.nodes)

    def get(self, node_id: str) -> dict[str, Any] | None:
        return next((deepcopy(node) for node in self.nodes if node["nodeId"] == node_id), None)

    async def _broadcast(self, nodes: list[dict[str, Any]] | None = None) -> None:
        for node in nodes or self.nodes:
            await manager.broadcast("IOT_NODE_UPDATE", {key: node[key] for key in (
                "nodeId", "intersectionId", "mode", "status", "vehicleCount", "queueLengthMeters",
                "signalState", "signalPhase", "phaseRemainingSeconds", "lastUpdated",
            )})

    async def apply_scenario(self, scenario: str) -> list[dict[str, Any]]:
        selected = scenario.upper()
        if selected not in SCENARIOS:
            raise ValueError(f"Unsupported scenario: {scenario}")
        self.nodes = deepcopy(self._normal_nodes)
        self.scenario = selected
        if selected == "CONGESTION":
            node = self.nodes[2]
            node.update(vehicleCount=42, queueLengthMeters=320, status="WARNING", signalState="RED", signalPhase="STOP")
        elif selected == "EMERGENCY":
            for node in self.nodes:
                node.update(status="WARNING" if node["nodeId"] == "GF-J03" else "ONLINE")
        elif selected == "NODE_OFFLINE":
            self.nodes[2].update(status="OFFLINE", connectivity="DISCONNECTED")
        elif selected == "SIGNAL_WARNING":
            self.nodes[1].update(status="WARNING", signalControllerStatus="WARNING", signalState="YELLOW", signalPhase="CLEARANCE")
        for node in self.nodes:
            node["lastUpdated"] = _now()
        await self._broadcast()
        return self.snapshot()

    async def reset(self) -> list[dict[str, Any]]:
        return await self.apply_scenario("NORMAL")

    async def set_offline(self, node_id: str) -> dict[str, Any] | None:
        node = next((item for item in self.nodes if item["nodeId"] == node_id), None)
        if node is None:
            return None
        node.update(status="OFFLINE", connectivity="DISCONNECTED", lastUpdated=_now())
        await self._broadcast([node])
        return deepcopy(node)


virtual_iot = VirtualIoTService()