import datetime
from sqlalchemy import Column, Integer, Float, String, Boolean, DateTime, Index
from backend.database import Base

class Telemetry(Base):
    __tablename__ = "telemetry"

    id = Column(Integer, primary_key=True, index=True)
    timestamp = Column(DateTime, default=datetime.datetime.utcnow, index=True)
    temperature = Column(Float, nullable=False)
    humidity = Column(Float, nullable=False)
    light = Column(Float, nullable=False)
    uv = Column(Float, nullable=False)
    pm25 = Column(Float, nullable=False)
    source = Column(String(50), default="ESP32")

    __table_args__ = (
        Index("idx_telemetry_timestamp", "timestamp"),
    )

class RiskPrediction(Base):
    __tablename__ = "risk_predictions"

    id = Column(Integer, primary_key=True, index=True)
    timestamp = Column(DateTime, default=datetime.datetime.utcnow, index=True)
    risk_score = Column(Float, nullable=False)
    risk_level = Column(String(20), nullable=False) # SAFE, WARNING, CRITICAL
    main_factor = Column(String(50), nullable=False)
    reason = Column(String(255), nullable=False)
    exposure_duration = Column(String(50), default="0m")
    model_confidence = Column(Float, default=0.90)

    __table_args__ = (
        Index("idx_risk_timestamp", "timestamp"),
    )

class Alert(Base):
    __tablename__ = "alerts"

    id = Column(Integer, primary_key=True, index=True)
    timestamp = Column(DateTime, default=datetime.datetime.utcnow, index=True)
    risk_level = Column(String(20), nullable=False)
    reason = Column(String(255), nullable=False)
    main_factor = Column(String(50), default="none")
    acknowledged = Column(Boolean, default=False)

    __table_args__ = (
        Index("idx_alert_timestamp", "timestamp"),
    )
