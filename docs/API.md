# PALM GUARD IoT - API Specification & Integration Contracts

This document defines the formal API contracts between team members:
- **Member 1**: Sensor Telemetry Dataset & Ingest Schema
- **Member 2**: Machine Learning Model & Risk Engine Interface
- **Member 3**: Dashboard & Visualization System
- **Member 4**: ESP32 Hardware Firmware & Wi-Fi Node

---

## 1. REST Endpoints

### 1.1 System Health
`GET /api/health`
- **Response**:
  ```json
  {
    "status": "healthy",
    "database": "sqlite_connected",
    "websocket_clients": 1
  }
  ```

---

### 1.2 Telemetry Ingestion (ESP32 / IoT Enclosure Node)
`POST /api/telemetry`
- **Description**: Receives live multi-parameter environmental readings from ESP32 or simulator. Evaluates preservation risk, stores in SQLite, and broadcasts immediately over `WS /ws/live`.
- **Request Body**:
  ```json
  {
    "timestamp": "2026-09-28T22:00:00",
    "temperature": 24.2,
    "humidity": 51.5,
    "light": 65.0,
    "uv": 0.12,
    "pm25": 10.4,
    "source": "ESP32_ENCLOSURE_01"
  }
  ```
- **Response** `(201 Created)`:
  ```json
  {
    "id": 42,
    "timestamp": "2026-09-28T22:00:00",
    "temperature": 24.2,
    "humidity": 51.5,
    "light": 65.0,
    "uv": 0.12,
    "pm25": 10.4,
    "source": "ESP32_ENCLOSURE_01"
  }
  ```

---

### 1.3 Telemetry Query & History
`GET /api/latest`
- Returns the latest single environmental reading.

`GET /api/telemetry?hours=1.0&limit=100`
- Query historical samples within requested time window.
- Parameters:
  - `hours`: (float) Time horizon in hours (e.g. `0.5`, `1.0`, `6.0`, `24.0`)
  - `limit`: (int) Maximum records to return (1 to 1000)

---

### 1.4 Preservation Risk Evaluation
`GET /api/risk/latest`
- Returns the latest evaluated preservation risk assessment:
  ```json
  {
    "id": 42,
    "timestamp": "2026-09-28T22:00:00",
    "risk_score": 72.5,
    "risk_level": "WARNING",
    "main_factor": "humidity",
    "reason": "Elevated relative humidity (68.4% RH). Risk of fungal sporulation and fiber swelling.",
    "exposure_duration": "1 hour 15 minutes",
    "model_confidence": 0.92
  }
  ```

`POST /api/risk/assess`
- Ad-hoc test evaluation of arbitrary environmental inputs without database persistence.

---

### 1.5 Preservation Alerts & Deduplication
`GET /api/alerts?acknowledged=false`
- Returns list of generated alerts.

`PUT /api/alerts/{id}/acknowledge`
- Sets `acknowledged: true` on the specified alert.

---

### 1.6 Modular Optical Camera Inspection
`GET /api/camera`
- Returns visual inspection metadata:
  ```json
  {
    "status": "ACTIVE",
    "last_checked": "2026-09-28T22:00:00",
    "condition": "NORMAL",
    "visual_risk": 12,
    "reason": "Surface uniform, no microbial fungal mycelium detected."
  }
  ```

---

## 2. WebSocket Real-Time Stream

### Endpoint:
`WS /ws/live`

### Connection Lifecycle:
1. **Connection Established**:
   Server sends initial status:
   ```json
   {
     "type": "SYSTEM_STATUS",
     "data": { "status": "ONLINE", "message": "Connected to PALM GUARD live stream" }
   }
   ```
2. **Heartbeat / Ping**:
   Client sends: `{"type": "PING"}`
   Server responds: `{"type": "PONG"}`

3. **Live Telemetry Broadcast**:
   Broadcasted immediately when telemetry arrives:
   ```json
   {
     "type": "TELEMETRY_UPDATE",
     "data": {
       "id": 42,
       "timestamp": "2026-09-28T22:00:00",
       "temperature": 27.4,
       "humidity": 68.2,
       "light": 185.0,
       "uv": 0.82,
       "pm25": 17.5
     }
   }
   ```

4. **Risk Update Broadcast**:
   Broadcasted immediately alongside telemetry:
   ```json
   {
     "type": "RISK_UPDATE",
     "data": {
       "risk_score": 64.0,
       "risk_level": "WARNING",
       "main_factor": "humidity",
       "reason": "Elevated relative humidity (68.4% RH).",
       "exposure_duration": "1h 15m"
     }
   }
   ```

5. **Alert Trigger Broadcast**:
   Emitted on threshold transition:
   ```json
   {
     "type": "ALERT_TRIGGERED",
     "data": {
       "id": 14,
       "risk_level": "WARNING",
       "reason": "Humidity exceeded safe preservation threshold.",
       "acknowledged": false
     }
   }
   ```
