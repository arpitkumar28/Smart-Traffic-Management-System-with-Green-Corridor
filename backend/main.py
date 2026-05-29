from fastapi import FastAPI, WebSocket, WebSocketDisconnect
from fastapi.middleware.cors import CORSMiddleware

from routes.alerts import router as alerts_router
from routes.ambulance import router as ambulance_router
from routes.analytics import router as analytics_router
from routes.dashboard import router as dashboard_router
from routes.events import router as events_router
from routes.prediction import router as prediction_router
from routes.signals import router as signals_router
from services.websocket_service import manager

app = FastAPI(title="GreenFlow AI API", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(dashboard_router)
app.include_router(signals_router)
app.include_router(alerts_router)
app.include_router(analytics_router)
app.include_router(events_router)
app.include_router(prediction_router)
app.include_router(ambulance_router)


@app.get("/")
def health() -> dict[str, str]:
    return {"status": "GreenFlow AI API online"}


@app.websocket("/ws")
async def websocket_endpoint(websocket: WebSocket) -> None:
    await manager.connect(websocket)
    try:
        while True:
            await websocket.receive_text()
    except WebSocketDisconnect:
        manager.disconnect(websocket)
