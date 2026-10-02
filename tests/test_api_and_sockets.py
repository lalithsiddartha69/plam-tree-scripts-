import pytest
from fastapi.testclient import TestClient
from backend.main import app
from backend.database import Base, engine

# Setup clean database for testing
Base.metadata.create_all(bind=engine)
client = TestClient(app)

def test_root_and_health():
    res = client.get("/")
    assert res.status_code == 200
    assert res.json()["system"] == "PALM GUARD IoT"

    health = client.get("/api/health")
    assert health.status_code == 200
    assert health.json()["status"] == "healthy"

def test_telemetry_post_and_get():
    payload = {
        "temperature": 22.5,
        "humidity": 51.0,
        "light": 50.0,
        "uv": 0.08,
        "pm25": 8.0,
        "source": "UNIT_TEST",
    }
    post_res = client.post("/api/telemetry", json=payload)
    assert post_res.status_code == 201
    data = post_res.json()
    assert data["temperature"] == 22.5
    assert data["humidity"] == 51.0
    assert data["id"] is not None

    # Get latest
    latest_res = client.get("/api/latest")
    assert latest_res.status_code == 200
    assert latest_res.json()["temperature"] == 22.5

    # Get history
    hist_res = client.get("/api/telemetry?hours=1")
    assert hist_res.status_code == 200
    assert len(hist_res.json()) >= 1

def test_risk_assessment_critical():
    # Inject high humidity and temperature
    payload = {
        "temperature": 29.5,
        "humidity": 82.0,
        "light": 180.0,
        "uv": 0.70,
        "pm25": 30.0,
        "source": "UNIT_TEST_CRITICAL",
    }
    res = client.post("/api/telemetry", json=payload)
    assert res.status_code == 201

    risk_res = client.get("/api/risk/latest")
    assert risk_res.status_code == 200
    risk_data = risk_res.json()
    assert risk_data["risk_level"] in ["WARNING", "CRITICAL"]
    assert risk_data["main_factor"] == "humidity"
    assert "humidity" in risk_data["reason"].lower()

def test_alert_generation_and_deduplication():
    # Post critical reading
    crit_payload = {
        "temperature": 31.0,
        "humidity": 85.0,
        "light": 200.0,
        "uv": 0.85,
        "pm25": 40.0,
        "source": "UNIT_TEST_ALERT",
    }
    client.post("/api/telemetry", json=crit_payload)

    alerts_res = client.get("/api/alerts")
    assert alerts_res.status_code == 200
    alerts = alerts_res.json()
    assert len(alerts) >= 1
    alert_id = alerts[0]["id"]

    # Deduplication test: sending immediately again should not create duplicate alert
    initial_count = len(alerts)
    client.post("/api/telemetry", json=crit_payload)
    alerts_after = client.get("/api/alerts").json()
    assert len(alerts_after) == initial_count

    # Acknowledge alert
    ack_res = client.put(f"/api/alerts/{alert_id}/acknowledge")
    assert ack_res.status_code == 200
    assert ack_res.json()["acknowledged"] is True

def test_websocket_connection():
    with client.websocket_connect("/ws/live") as websocket:
        data = websocket.receive_json()
        assert data["type"] == "SYSTEM_STATUS"
        # Test ping-pong
        websocket.send_json({"type": "PING"})
        pong = websocket.receive_json()
        assert pong["type"] == "PONG"
