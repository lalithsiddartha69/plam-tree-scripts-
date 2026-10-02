from typing import Dict, Any
from ml.model_interface import PreservationModelInterface

class MockPreservationModel(PreservationModelInterface):
    """
    Clearly labeled DEMO / MOCK Model.
    Employs botanical preservation heuristics for palm-leaf manuscripts
    until Member 2's trained Random Forest model is plugged in.
    """

    def predict(self, telemetry: Dict[str, Any]) -> Dict[str, Any]:
        temp = float(telemetry.get("temperature", 22.0))
        hum = float(telemetry.get("humidity", 50.0))
        light = float(telemetry.get("light", 50.0))
        uv = float(telemetry.get("uv", 0.10))
        pm25 = float(telemetry.get("pm25", 8.0))

        # Risk scoring
        hum_excess = max(0.0, hum - 55.0) * 2.5
        hum_deficit = max(0.0, 45.0 - hum) * 2.0
        temp_excess = max(0.0, temp - 24.0) * 3.0
        uv_excess = max(0.0, uv - 0.20) * 60.0
        light_excess = max(0.0, light - 100.0) * 0.25
        pm25_excess = max(0.0, pm25 - 15.0) * 1.5

        raw_score = 15.0 + hum_excess + hum_deficit + temp_excess + uv_excess + light_excess + pm25_excess
        risk_score = round(min(100.0, max(10.0, raw_score)), 1)

        factors = {
            "humidity": hum_excess + hum_deficit,
            "temperature": temp_excess,
            "uv": uv_excess,
            "light": light_excess,
            "pm25": pm25_excess,
        }

        main_factor = max(factors, key=factors.get)

        if risk_score > 75.0:
            risk_level = "CRITICAL"
            reason = f"High preservation danger detected primarily driven by {main_factor}."
        elif risk_score > 40.0:
            risk_level = "WARNING"
            reason = f"Preservation conditions sub-optimal due to elevated {main_factor}."
        else:
            risk_level = "SAFE"
            main_factor = "none"
            reason = "Preservation micro-climate is within optimal archival limits."

        return {
            "risk_score": risk_score,
            "risk_level": risk_level,
            "main_factor": main_factor,
            "reason": reason,
            "model_confidence": 0.88,
            "is_mock": True,
            "model_name": "MockPreservationModel (Heuristic Baseline)",
        }
