"""Small, key-free adapter for road routing used by the Green Corridor demo.

The public OSRM endpoint is appropriate for demos. Deployments can replace it
with a managed OSRM instance by setting MAP_ROUTING_URL.
"""
from __future__ import annotations

import asyncio
import json
import os
from typing import Any
from urllib.parse import urlencode
from urllib.request import urlopen

DEFAULT_ROUTING_URL = "https://router.project-osrm.org"


async def get_road_route(
    origin: tuple[float, float], destination: tuple[float, float]
) -> dict[str, Any] | None:
    """Return an OSRM road route as Leaflet-compatible [lat, lng] points."""
    base_url = os.getenv("MAP_ROUTING_URL", DEFAULT_ROUTING_URL).rstrip("/")
    coordinates = f"{origin[1]},{origin[0]};{destination[1]},{destination[0]}"
    query = urlencode({"overview": "full", "geometries": "geojson"})
    url = f"{base_url}/route/v1/driving/{coordinates}?{query}"

    def request() -> dict[str, Any]:
        with urlopen(url, timeout=4) as response:  # nosec B310 - configured routing endpoint
            return json.loads(response.read().decode("utf-8"))

    try:
        payload = await asyncio.to_thread(request)
        route = payload.get("routes", [])[0]
        points = [[round(lat, 6), round(lng, 6)] for lng, lat in route["geometry"]["coordinates"]]
        if len(points) < 2:
            return None
        return {
            "route_coords": points,
            "distance_m": round(float(route["distance"]), 1),
            "duration_seconds": round(float(route["duration"]), 1),
            "route_source": "osrm",
        }
    except (OSError, KeyError, IndexError, TypeError, ValueError, json.JSONDecodeError):
        return None
