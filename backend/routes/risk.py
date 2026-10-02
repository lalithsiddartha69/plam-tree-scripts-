import datetime
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from typing import List, Optional

from backend.database import get_db
from backend.models import RiskPrediction, Telemetry
from backend.schemas import RiskPredictionResponse, TelemetryBase
from backend.services.risk_service import risk_service

router = APIRouter(prefix="/api/risk", tags=["risk"])

@router.get("/latest", response_model=Optional[RiskPredictionResponse])
def get_latest_risk(db: Session = Depends(get_db)):
    """Returns the most recent risk prediction assessment."""
    prediction = db.query(RiskPrediction).order_by(RiskPrediction.timestamp.desc()).first()
    return prediction

@router.get("", response_model=List[RiskPredictionResponse])
def get_risk_history(
    hours: float = Query(1.0, ge=0.1, le=168.0),
    limit: int = Query(100, ge=1, le=1000),
    db: Session = Depends(get_db)
):
    """Returns chronological risk history within requested hours."""
    since = datetime.datetime.utcnow() - datetime.timedelta(hours=hours)
    records = (
        db.query(RiskPrediction)
        .filter(RiskPrediction.timestamp >= since)
        .order_by(RiskPrediction.timestamp.asc())
        .limit(limit)
        .all()
    )
    return records

@router.post("/assess", response_model=dict)
def assess_custom_risk(payload: TelemetryBase, db: Session = Depends(get_db)):
    """Ad-hoc endpoint to calculate risk on custom input without persisting."""
    mock_tele = Telemetry(
        timestamp=datetime.datetime.utcnow(),
        temperature=payload.temperature,
        humidity=payload.humidity,
        light=payload.light,
        uv=payload.uv,
        pm25=payload.pm25,
    )
    return risk_service.calculate_risk(mock_tele, db)
