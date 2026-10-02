import json
import logging
from typing import List
from fastapi import FastAPI, WebSocket, WebSocketDisconnect
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager

from backend.database import engine, Base, SessionLocal
from backend.routes import telemetry, risk, alerts, camera
from backend.models import Telemetry, RiskPrediction, Alert

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("palm_guard")

# WebSocket Connection Manager for live dashboard updates
class ConnectionManager:
    def __init__(self):
        self.active_connections: List[WebSocket] = []

    async def connect(self, websocket: WebSocket):
        await websocket.accept()
        self.active_connections.append(websocket)
        logger.info(f"WebSocket client connected. Total clients: {len(self.active_connections)}")

    def disconnect(self, websocket: WebSocket):
        if websocket in self.active_connections:
            self.active_connections.remove(websocket)
            logger.info(f"WebSocket client disconnected. Total clients: {len(self.active_connections)}")

    async def broadcast(self, message: dict):
        if not self.active_connections:
            return
        payload = json.dumps(message)
        disconnected = []
        for connection in self.active_connections:
            try:
                await connection.send_text(payload)
            except Exception as e:
                logger.warning(f"Error sending to WebSocket client: {e}")
                disconnected.append(connection)
        for dead_conn in disconnected:
            self.disconnect(dead_conn)

ws_manager = ConnectionManager()
telemetry.set_ws_manager(ws_manager)

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup: ensure tables exist
    Base.metadata.create_all(bind=engine)
    logger.info("SQLite database tables verified and initialized.")
    yield
    # Shutdown
    logger.info("Shutting down PALM GUARD IoT backend.")

app = FastAPI(
    title="PALM GUARD IoT API",
    description="Smart Preservation Monitoring System for Palm-Leaf Manuscripts",
    version="1.0.0",
    lifespan=lifespan,
)

# Enable CORS for frontend development
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include Routers
app.include_router(telemetry.router)
app.include_router(risk.router)
app.include_router(alerts.router)
app.include_router(camera.router)

@app.get("/")
def root():
    return {
        "system": "PALM GUARD IoT",
        "description": "Smart Preservation Monitoring System for Palm-Leaf Manuscripts",
        "status": "ONLINE",
        "version": "1.0.0",
        "docs": "/docs",
    }

@app.get("/api/health")
def health_check():
    return {
        "status": "healthy",
        "database": "sqlite_connected",
        "websocket_clients": len(ws_manager.active_connections),
    }

# Live WebSocket Stream endpoint
@app.websocket("/ws/live")
async def websocket_live_endpoint(websocket: WebSocket):
    await ws_manager.connect(websocket)
    try:
        # Send initial welcome and state snapshot
        await websocket.send_text(json.dumps({
            "type": "SYSTEM_STATUS",
            "data": {
                "message": "Connected to PALM GUARD live stream",
                "status": "ONLINE",
            }
        }))

        while True:
            data = await websocket.receive_text()
            try:
                msg = json.loads(data)
                if msg.get("type") == "PING":
                    await websocket.send_text(json.dumps({"type": "PONG"}))
            except Exception:
                pass
    except WebSocketDisconnect:
        ws_manager.disconnect(websocket)
    except Exception as e:
        logger.warning(f"WebSocket exception: {e}")
        ws_manager.disconnect(websocket)
