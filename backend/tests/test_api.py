import sys
from pathlib import Path

from fastapi.testclient import TestClient

# Add parent directory to path to import main
sys.path.insert(0, str(Path(__file__).parent.parent))
from main import app

client = TestClient(app)


def test_health_and_status_endpoints():
    health = client.get("/health")
    assert health.status_code == 200
    assert health.json()["status"] in {"ok", "online"}

    status = client.get("/status")
    assert status.status_code == 200
    payload = status.json()
    assert payload["service"] == "GreenFlow AI API"
    assert payload["database"] in {"demo", "supabase"}


def test_invalid_ambulance_returns_404():
    response = client.post(
        "/ambulance/activate",
        json={"ambulanceId": "AMB-INVALID", "destination": "City General Hospital"},
    )
    assert response.status_code == 404
    assert "Ambulance" in response.json()["detail"]


def test_duplicate_corridor_activation_is_idempotent():
    first = client.post(
        "/ambulance/activate",
        json={"ambulanceId": "AMB-102", "destination": "City General Hospital"},
    )
    assert first.status_code in {200, 201}

    second = client.post(
        "/ambulance/activate",
        json={"ambulanceId": "AMB-102", "destination": "City General Hospital"},
    )
    assert second.status_code == 200
    assert second.json()["status"] == "Green Corridor Activated"
    assert second.json()["ambulance"] == "AMB-102"


def test_prediction_endpoint_explains_action():
    response = client.get("/prediction")
    assert response.status_code == 200
    payload = response.json()
    assert "recommended_action" in payload
    assert "why" in payload
