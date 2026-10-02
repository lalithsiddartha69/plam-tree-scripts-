from pydantic import BaseModel, Field, ConfigDict
from typing import Optional
from datetime import datetime

class TelemetryBase(BaseModel):
    temperature: float = Field(..., description="Temperature in Celsius (e.g. 24.5)")
    humidity: float = Field(..., description="Relative Humidity percentage (e.g. 52.0)")
    light: float = Field(..., description="Light intensity in Lux (e.g. 75.0)")
    uv: float = Field(..., description="UV radiation index / mW/cm2 (e.g. 0.12)")
    pm25: float = Field(..., description="Particulate matter PM2.5 in ug/m3 (e.g. 10.5)")

class TelemetryCreate(TelemetryBase):
    timestamp: Optional[datetime] = None
    source: Optional[str] = "ESP32"

class TelemetryResponse(TelemetryBase):
    id: int
    timestamp: datetime
    source: str

    model_config = ConfigDict(from_attributes=True)

class RiskPredictionBase(BaseModel):
    risk_score: float = Field(..., ge=0.0, le=100.0, description="Risk Score from 0 to 100")
    risk_level: str = Field(..., description="SAFE, WARNING, or CRITICAL")
    main_factor: str = Field(..., description="Primary environmental threat factor")
    reason: str = Field(..., description="Explanation of risk diagnosis")
    exposure_duration: Optional[str] = "0m"
    model_confidence: Optional[float] = 0.90

class RiskPredictionResponse(RiskPredictionBase):
    id: int
    timestamp: datetime

    model_config = ConfigDict(from_attributes=True)

class AlertResponse(BaseModel):
    id: int
    timestamp: datetime
    risk_level: str
    reason: str
    main_factor: str
    acknowledged: bool

    model_config = ConfigDict(from_attributes=True)

class CameraResponse(BaseModel):
    status: str
    last_checked: datetime
    condition: str
    visual_risk: int
    reason: str
