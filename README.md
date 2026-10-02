# PALM GUARD IoT
> **Smart Preservation Monitoring & Explainable Risk Assessment System for Ancient Palm-Leaf Manuscripts**

PALM GUARD IoT is an end-to-end intelligent preservation platform designed to protect delicate historical palm-leaf manuscripts from micro-climate degradation, microbial mold infestation (*Aspergillus* sporulation), photo-chemical ink fading, and particulate erosion.

---

## 🏛️ System Architecture

```text
Palm-Leaf Manuscript
        ↓
IoT Sensor Enclosure (Temperature, Humidity, Light, UV, PM2.5, Camera)
        ↓
ESP32 / ESP32-S3 Microcontroller
        ↓
Wi-Fi (REST Telemetry)
        ↓
FastAPI Backend API
        ↓
Data Processing & Validation (Pydantic)
        ↓
AI / Risk Assessment Engine (Random Forest / Botanical Heuristics)
        ↓
Preservation Risk Score (0–100) & Level (SAFE / WARNING / CRITICAL)
        ↓
Real-Time WebSocket Stream (`/ws/live`)
        ↓
React 19 + Tailwind CSS Dashboard
        ↓
Live Metrics + Explainability ("Why at risk?") + Deduplicated Alerts + History
```

---

## 👥 Team Division of Responsibilities

- **Member 1 (Sensors & Data)**: Sensor enclosure data models and environmental datasets.
- **Member 2 (AI / ML)**: Random Forest Risk Classifier model and prediction confidence.
- **Member 3 (Dashboard, Sockets & Integration)**: React dashboard, real-time WebSocket pipelines, REST API, SQLite storage, alert deduplication, explainability panels, and hackathon presentation controls.
- **Member 4 (Hardware / ESP32)**: ESP32-S3 firmware, sensor enclosure circuitry, and Wi-Fi REST client.

---

## 🛠️ Technology Stack

- **Frontend**: React 19, Vite 7, Tailwind CSS v4, Recharts, Lucide React
- **Real-Time Communication**: WebSockets (`/ws/live`) with automatic REST polling fallback
- **Backend**: FastAPI, Uvicorn, Pydantic v2, SQLAlchemy
- **Database**: SQLite (WAL Mode, indexed timestamps)
- **AI & Analytics**: Scikit-Learn (Random Forest wrapper), botanical preservation heuristic engine
- **Computer Vision (Modular)**: Optical surface condition monitoring contract
- **Testing**: Pytest, FastAPI TestClient

---

## 🚀 Quickstart Guide

### 1. Prerequisites
- Python 3.10+
- Node.js 18+ and npm

### 2. Backend Setup
Install Python dependencies and start the FastAPI server:
```bash
# Install dependencies
pip install fastapi uvicorn sqlalchemy pydantic scikit-learn pytest httpx websockets

# Start backend server with live reload
uvicorn backend.main:app --host 0.0.0.0 --port 8000 --reload
```
The backend API will be live at `http://localhost:8000` (Swagger docs at `http://localhost:8000/docs`).

### 3. Frontend Setup
Start the Vite development server:
```bash
npm run dev
```
Open `http://localhost:5173` in your browser.

### 4. Running the IoT Simulator
Stream realistic telemetry into the live system:
```bash
# Baseline normal conditions (SAFE)
python simulator/sensor_simulator.py baseline

# Humidity spike demonstration (WARNING)
python simulator/sensor_simulator.py spike

# Prolonged high humidity & temperature (CRITICAL)
python simulator/sensor_simulator.py critical

# Run complete automated Hackathon judge demonstration story
python simulator/sensor_simulator.py story
```

---

## 🧪 Running Automated Tests

Run the test suite verifying REST endpoints, database transactions, risk classifications, alert deduplication, and WebSocket handshakes:
```bash
python -m pytest tests/test_api_and_sockets.py -v
```

---

## 🎯 Hackathon Demonstration Sequence

The dashboard includes a built-in **Hackathon Demo Simulator** bar with preset triggers and an automated 4-step sequence:

1. **Step 1: Normal Preservation (SAFE)**:
   - Temperature: 22.3°C, Humidity: 51.4%, Light: 48 lx, UV: 0.08 mW/cm², PM2.5: 8.5 µg/m³.
   - **Risk Score: 18 / 100 (SAFE)**.
   - Status: Micro-climate optimal.
2. **Step 2: Humidity Creeps Upward (WARNING)**:
   - Relative Humidity rises to 68.4%.
   - **Risk Score: 64 / 100 (WARNING)**.
   - Main Threat Factor: **Humidity**.
   - Explanation: "Elevated relative humidity (68.4% RH). Risk of fungal sporulation and fiber swelling."
3. **Step 3: Prolonged High Humidity Exposure (CRITICAL)**:
   - Humidity sustained above 78% for >3 hours.
   - **Risk Score: 88 / 100 (CRITICAL)**.
   - Explanation: "Prolonged high humidity exposure exceeding 3 hours. Severe risk of Aspergillus mold outbreak and leaf delamination."
   - Camera visual condition flags **ANOMALY DETECTED**.
4. **Step 4: Real-Time Alerts & Deduplication**:
   - High-priority deduplicated alert added to the Preservation Alert Feed.
   - Historical trend graph illustrates the exact exposure curve and duration.

---

## 📡 API Contract Highlights

| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `GET` | `/api/health` | System health and connected WebSocket count |
| `POST` | `/api/telemetry` | Ingests sensor enclosure readings from ESP32 |
| `GET` | `/api/latest` | Returns most recent telemetry reading |
| `GET` | `/api/telemetry?hours=1.0` | Chronological telemetry history for graphs |
| `GET` | `/api/risk/latest` | Latest evaluated risk score, level & reason |
| `GET` | `/api/alerts` | Active preservation alert history |
| `PUT` | `/api/alerts/{id}/acknowledge` | Acknowledge active alert |
| `GET` | `/api/camera` | Modular optical condition inspection |
| `WS` | `/ws/live` | Real-time bi-directional telemetry & risk stream |

For full schema details, see [`docs/API.md`](docs/API.md) and [`docs/ARCHITECTURE.md`](docs/ARCHITECTURE.md).
