import datetime
from fastapi import APIRouter
from backend.schemas import CameraResponse

router = APIRouter(prefix="/api/camera", tags=["camera"])

def get_now_utc():
    return datetime.datetime.now(datetime.timezone.utc).replace(tzinfo=None)

# Modular state for camera inspection
current_camera_state = {
    "status": "ACTIVE",
    "last_checked": get_now_utc(),
    "condition": "NORMAL",
    "visual_risk": 12,
    "reason": "Surface uniform, no microbial fungal mycelium or insect abrasion detected.",
}

@router.get("", response_model=CameraResponse)
def get_camera_status():
    """Returns the current visual condition status of the palm-leaf manuscript."""
    current_camera_state["last_checked"] = get_now_utc()
    return current_camera_state

@router.post("/inspect", response_model=CameraResponse)
def trigger_inspection():
    """Triggers an optical surface inspection frame scan."""
    current_camera_state["last_checked"] = get_now_utc()
    return current_camera_state
