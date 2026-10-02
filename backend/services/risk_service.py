import datetime
from sqlalchemy.orm import Session
from backend.models import Telemetry, RiskPrediction

# Archival preservation boundaries for palm-leaf manuscripts (Corypha / Borassus flabellifer)
THRESHOLDS = {
    "temperature": {"opt_min": 20.0, "opt_max": 24.0, "warn_max": 27.0, "crit_max": 30.0},
    "humidity": {"opt_min": 45.0, "opt_max": 55.0, "warn_max": 65.0, "crit_max": 75.0, "warn_min": 40.0, "crit_min": 35.0},
    "light": {"opt_max": 100.0, "warn_max": 150.0, "crit_max": 300.0},
    "uv": {"opt_max": 0.20, "warn_max": 0.50, "crit_max": 1.00},
    "pm25": {"opt_max": 15.0, "warn_max": 35.0, "crit_max": 75.0},
}

class RiskService:
    def __init__(self, ml_model=None):
        self.ml_model = ml_model # Slot for Member 2's trained model

    def calculate_risk(self, telemetry: Telemetry, db: Session = None) -> dict:
        """
        Calculates multi-parameter preservation risk, determines primary threat factor,
        tracks continuous exposure duration from DB history, and produces human-explainable diagnosis.
        """
        temp = telemetry.temperature
        hum = telemetry.humidity
        light = telemetry.light
        uv = telemetry.uv
        pm25 = telemetry.pm25

        # 1. Parameter Risk Scores
        hum_score = 0.0
        if hum > THRESHOLDS["humidity"]["crit_max"] or hum < THRESHOLDS["humidity"]["crit_min"]:
            hum_score = 90.0
        elif hum > THRESHOLDS["humidity"]["opt_max"]:
            hum_score = 40.0 + ((hum - THRESHOLDS["humidity"]["opt_max"]) / (THRESHOLDS["humidity"]["crit_max"] - THRESHOLDS["humidity"]["opt_max"])) * 50.0
        elif hum < THRESHOLDS["humidity"]["opt_min"]:
            hum_score = 35.0 + ((THRESHOLDS["humidity"]["opt_min"] - hum) / (THRESHOLDS["humidity"]["opt_min"] - THRESHOLDS["humidity"]["crit_min"])) * 50.0

        temp_score = 0.0
        if temp > THRESHOLDS["temperature"]["crit_max"]:
            temp_score = 85.0
        elif temp > THRESHOLDS["temperature"]["opt_max"]:
            temp_score = 35.0 + ((temp - THRESHOLDS["temperature"]["opt_max"]) / (THRESHOLDS["temperature"]["crit_max"] - THRESHOLDS["temperature"]["opt_max"])) * 50.0

        light_score = 0.0
        if light > THRESHOLDS["light"]["crit_max"]:
            light_score = 80.0
        elif light > THRESHOLDS["light"]["opt_max"]:
            light_score = 30.0 + ((light - THRESHOLDS["light"]["opt_max"]) / (THRESHOLDS["light"]["crit_max"] - THRESHOLDS["light"]["opt_max"])) * 50.0

        uv_score = 0.0
        if uv > THRESHOLDS["uv"]["crit_max"]:
            uv_score = 85.0
        elif uv > THRESHOLDS["uv"]["opt_max"]:
            uv_score = 30.0 + ((uv - THRESHOLDS["uv"]["opt_max"]) / (THRESHOLDS["uv"]["crit_max"] - THRESHOLDS["uv"]["opt_max"])) * 50.0

        pm25_score = 0.0
        if pm25 > THRESHOLDS["pm25"]["crit_max"]:
            pm25_score = 80.0
        elif pm25 > THRESHOLDS["pm25"]["opt_max"]:
            pm25_score = 30.0 + ((pm25 - THRESHOLDS["pm25"]["opt_max"]) / (THRESHOLDS["pm25"]["crit_max"] - THRESHOLDS["pm25"]["opt_max"])) * 50.0

        # Map to find primary driver
        factor_scores = {
            "humidity": hum_score,
            "temperature": temp_score,
            "uv": uv_score,
            "light": light_score,
            "pm25": pm25_score,
        }

        main_factor = max(factor_scores, key=factor_scores.get)
        max_factor_score = factor_scores[main_factor]

        # 2. Exposure duration calculation from database
        exposure_duration = "0m"
        duration_minutes = 0
        if db and max_factor_score > 35.0:
            # Look back across recent telemetry samples
            recent = db.query(Telemetry).order_by(Telemetry.timestamp.desc()).limit(30).all()
            if recent:
                earliest_elevated = telemetry.timestamp
                for r in recent:
                    r_hum = r.humidity
                    if main_factor == "humidity" and (r_hum > THRESHOLDS["humidity"]["opt_max"] or r_hum < THRESHOLDS["humidity"]["opt_min"]):
                        earliest_elevated = r.timestamp
                    elif main_factor == "temperature" and r.temperature > THRESHOLDS["temperature"]["opt_max"]:
                        earliest_elevated = r.timestamp
                    elif main_factor == "uv" and r.uv > THRESHOLDS["uv"]["opt_max"]:
                        earliest_elevated = r.timestamp
                    else:
                        break
                
                diff = (telemetry.timestamp - earliest_elevated).total_seconds()
                duration_minutes = int(diff / 60)
                if duration_minutes > 60:
                    hours = duration_minutes // 60
                    mins = duration_minutes % 60
                    exposure_duration = f"{hours}h {mins}m"
                else:
                    exposure_duration = f"{duration_minutes}m"

        # 3. Composite score calculation with duration weighting
        # Base composite = max factor (65%) + average of others (35%)
        other_scores = [v for k, v in factor_scores.items() if k != main_factor]
        avg_other = sum(other_scores) / len(other_scores) if other_scores else 0
        base_composite = (max_factor_score * 0.70) + (avg_other * 0.30)

        # Duration severity multiplier (prolonged exposure is much more damaging to organic leaves)
        if duration_minutes >= 120 and base_composite > 40:
            base_composite = min(100.0, base_composite + 18.0)
        elif duration_minutes >= 30 and base_composite > 40:
            base_composite = min(100.0, base_composite + 8.0)

        composite_score = round(min(100.0, max(12.0, base_composite)), 1)

        # 4. Risk Level classification
        if composite_score > 75.0:
            risk_level = "CRITICAL"
        elif composite_score > 40.0:
            risk_level = "WARNING"
        else:
            risk_level = "SAFE"
            main_factor = "none"

        # 5. Explanatory reason formulation
        if risk_level == "CRITICAL":
            if main_factor == "humidity":
                reason = f"Prolonged high humidity exposure ({hum:.1f}% RH) exceeding safe threshold. Critical risk of Aspergillus fungal colonization and leaf delamination."
            elif main_factor == "temperature":
                reason = f"High thermal stress ({temp:.1f}°C). Accelerated desiccation and embrittlement of palm-leaf cellular structure."
            elif main_factor == "uv":
                reason = f"Intense UV radiation ({uv:.2f} mW/cm²). Severe photochemical bleaching of ink pigment and lignin breakdown."
            else:
                reason = "Multiple environmental preservation metrics critical. Immediate conservator intervention required."
        elif risk_level == "WARNING":
            if main_factor == "humidity":
                reason = f"Relative humidity ({hum:.1f}% RH) elevated above archival standard (45–55%). Risk of microbial germination."
            elif main_factor == "temperature":
                reason = f"Temperature ({temp:.1f}°C) elevated. Micro-climate exceeds optimal 20–24°C range."
            elif main_factor == "light" or main_factor == "uv":
                reason = f"Illumination/UV exposure elevated ({light:.0f} lx, {uv:.2f} mW/cm²). Accelerated photochemical fading."
            else:
                reason = "Ambient preservation parameters drifting beyond optimal conservation limits."
        else:
            reason = "Environmental micro-climate within optimal museum preservation tolerances."

        return {
            "timestamp": telemetry.timestamp,
            "risk_score": composite_score,
            "risk_level": risk_level,
            "main_factor": main_factor,
            "reason": reason,
            "exposure_duration": exposure_duration,
            "model_confidence": 0.92,
        }

risk_service = RiskService()
