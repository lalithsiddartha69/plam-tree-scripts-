from abc import ABC, abstractmethod
from typing import Dict, Any

class PreservationModelInterface(ABC):
    """
    Contract interface for Member 2's AI / ML Risk Model.
    Accepts standardized environmental telemetry dictionary:
    {
        "temperature": float,
        "humidity": float,
        "light": float,
        "uv": float,
        "pm25": float
    }
    Returns standardized risk prediction dictionary:
    {
        "risk_score": float (0-100),
        "risk_level": str ("SAFE" | "WARNING" | "CRITICAL"),
        "main_factor": str ("humidity" | "temperature" | "uv" | "light" | "pm25" | "none"),
        "reason": str,
        "model_confidence": float (0.0-1.0)
    }
    """

    @abstractmethod
    def predict(self, telemetry: Dict[str, Any]) -> Dict[str, Any]:
        pass
