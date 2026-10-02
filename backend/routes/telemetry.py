import datetime
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from typing import List, Optional

from backend.database import get_db
from backend.models import Telemetry, RiskPrediction
from backend.schemas import TelemetryCreate, TelemetryResponse
from backend.services.risk_service import risk_service
from backend.services.alert_service import alert_service

router = APIRouter(prefix="/api", tags=["telemetry"])

# Forward reference to connection manager for WebSocket broadcast
ws_manager = None

def set_ws_manager(manager):
    global ws_manager
    ws_manager = manager

def get_now_utc():
    return datetime.datetime.now(datetime.timezone.utc).replace(tzinfo=None)

@router.get("/latest", response_model=Optional[TelemetryResponse])
def get_latest_telemetry(db: Session = Depends(get_db)):
    """Returns the most recent environmental telemetry reading."""
    reading = db.query(Telemetry).order_by(Telemetry.timestamp.desc()).first()
    return reading

@router.get("/telemetry", response_model=List[TelemetryResponse])
def get_telemetry_history(
    hours: float = Query(1.0, ge=0.1, le=168.0, description="History window in hours"),
    limit: int = Query(100, ge=1, le=1000, description="Max points to return"),
    db: Session = Depends(get_db)
):
    """Returns chronological telemetry history within requested time window."""
    since = get_now_utc() - datetime.timedelta(hours=hours)
    readings = (
        db.query(Telemetry)
        .filter(Telemetry.timestamp >= since)
        .order_by(Telemetry.timestamp.asc())
        .limit(limit)
        .all()
    )
    return readings

@router.post("/telemetry", response_model=TelemetryResponse, status_code=201)
async def post_telemetry(
    payload: TelemetryCreate,
    db: Session = Depends(get_db)
):
    """
    Ingests sensor telemetry from ESP32 / IoT nodes or simulator.
    Processes preservation risk, persists records, and broadcasts in real-time over WebSocket.
    """
    reading_time = payload.timestamp or get_now_utc()

    # 1. Store Telemetry
    telemetry_record = Telemetry(
        timestamp=reading_time,
        temperature=payload.temperature,
        humidity=payload.humidity,
        light=payload.light,
        uv=payload.uv,
        pm25=payload.pm25,
        source=payload.source or "ESP32",
    )
    db.add(telemetry_record)
    db.commit()
    db.refresh(telemetry_record)

    # 2. Run Preservation Risk Assessment
    risk_data = risk_service.calculate_risk(telemetry_record, db)
    risk_record = RiskPrediction(
        timestamp=reading_time,
        risk_score=risk_data["risk_score"],
        risk_level=risk_data["risk_level"],
        main_factor=risk_data["main_factor"],
        reason=risk_data["reason"],
        exposure_duration=risk_data["exposure_duration"],
        model_confidence=risk_data["model_confidence"],
    )
    db.add(risk_record)
    db.commit()
    db.refresh(risk_record)

    # 3. Check and generate deduplicated alert if needed
    alert_record = alert_service.process_risk_and_alert(risk_data, db)

    # 4. Broadcast in real time over WebSockets to all connected React clients
    if ws_manager:
        tele_dict = {
            "id": telemetry_record.id,
            "timestamp": telemetry_record.timestamp.isoformat(),
            "temperature": telemetry_record.temperature,
            "humidity": telemetry_record.humidity,
            "light": telemetry_record.light,
            "uv": telemetry_record.uv,
            "pm25": telemetry_record.pm25,
            "source": telemetry_record.source,
        }
        await ws_manager.broadcast({
            "type": "TELEMETRY_UPDATE",
            "data": tele_dict,
        })

        risk_dict = {
            "id": risk_record.id,
            "timestamp": risk_record.timestamp.isoformat(),
            "risk_score": risk_record.risk_score,
            "risk_level": risk_record.risk_level,
            "main_factor": risk_record.main_factor,
            "reason": risk_record.reason,
            "exposure_duration": risk_record.exposure_duration,
            "model_confidence": risk_record.model_confidence,
        }
        await ws_manager.broadcast({
            "type": "RISK_UPDATE",
            "data": risk_dict,
        })

        if alert_record:
            alert_dict = {
                "id": alert_record.id,
                "timestamp": alert_record.timestamp.isoformat(),
                "risk_level": alert_record.risk_level,
                "reason": alert_record.reason,
                "main_factor": alert_record.main_factor,
                "acknowledged": alert_record.acknowledged,
            }
            await ws_manager.broadcast({
                "type": "ALERT_TRIGGERED",
                "data": alert_dict,
            })

    return telemetry_record
