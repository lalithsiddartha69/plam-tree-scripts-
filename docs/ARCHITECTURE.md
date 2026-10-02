# PALM GUARD IoT - Architecture & Preservation Design

## 1. System Overview & Problem Statement

Ancient palm-leaf manuscripts (*Corypha talipot* and *Borassus flabellifer*) represent irreplaceable historical heritage. Composed of natural dried plant fibers inscribed with organic soot or iron-gall inks, they are acutely sensitive to environmental micro-climates:
- **Excessive Humidity (>65% RH)** triggers rapid sporulation of *Aspergillus* and *Penicillium* molds, enzymatic digestion of cellulose, and leaf fiber swelling.
- **Low Humidity (<40% RH)** causes cellular desiccation, micro-fracturing, and brittle delamination.
- **Elevated Temperature (>24°C)** exponentially accelerates acidic hydrolysis.
- **UV Radiation & High Lux (>100 lx, >0.20 mW/cm²)** photochemically oxidizes lampblack and carbon inks, resulting in permanent contrast degradation.
- **Airborne Particulate (PM2.5)** settles into microscopic leaf grain grooves, introducing abrasive grit and acidic sulfates.

PALM GUARD IoT transitions preservation from passive periodic manual inspection to **continuous automated micro-climate sensing with explainable AI risk assessment**.

---

## 2. System Flow Diagram

```
                 PALM-LEAF MANUSCRIPT
                          │
                          ▼
                   SENSOR ENCLOSURE
        ┌─────────────────┼─────────────────┐
        ↓                 ↓                 ↓
   Temperature        Humidity           Light
   UV Radiation       PM2.5 Airborne     Optical Camera
        │                 │                 │
        └─────────────────┼─────────────────┘
                          ↓
                    ESP32 / ESP32-S3
                          │
                     Wi-Fi (REST)
                          ↓
                 FastAPI Backend API
                          │
          ┌───────────────┴───────────────┐
          ↓                               ↓
    SQLite Storage                 AI / Risk Engine
    (WAL Mode + Index)       (Random Forest / Heuristics)
          │                               │
          └───────────────┬───────────────┘
                          ↓
                 Preservation Risk Engine
             (Score: 0-100, SAFE/WARN/CRIT)
                          ↓
              Deduplicated Alert Manager
                          │
               ┌──────────┴──────────┐
               ↓                     ↓
         WebSocket /ws/live     REST /api/latest
               │                     │
               └──────────┬──────────┘
                          ↓
              React 19 Dashboard UI
        ┌─────────────────┼─────────────────┐
        ↓                 ↓                 ↓
   Live Telemetry   Hero Risk Gauge    Explainability
   5 Sensor Cards   SAFE/WARN/CRIT     "Why at risk?"
        ↓                 ↓                 ↓
   Historical Trends   Alert Feed      Optical Vision
   30m / 1h / 6h / 24h (Deduplicated)  Condition Stream
```

---

## 3. Preservation Micro-Climate Thresholds

| Parameter | Optimal Archival Range | Warning Boundary | Critical Danger | Preservation Impact |
| :--- | :--- | :--- | :--- | :--- |
| **Temperature** | 20.0 – 24.0 °C | 24.1 – 27.0 °C | > 27.0 °C or < 16 °C | Thermal desiccation & fiber embrittlement |
| **Relative Humidity** | 45.0 – 55.0 % | 55.1 – 65.0 % | > 65.0 % or < 40 % | Mold sporulation (*Aspergillus*) / leaf cracking |
| **Display Illumination** | < 100 lx | 100 – 150 lx | > 150 lx | Photo-oxidation of cellulose |
| **UV Radiation** | < 0.20 mW/cm² | 0.20 – 0.50 mW/cm² | > 0.50 mW/cm² | Photochemical bleaching of historic ink |
| **Particulate (PM2.5)** | < 15.0 µg/m³ | 15.1 – 35.0 µg/m³ | > 35.0 µg/m³ | Micro-abrasion and acidic chemical decay |

---

## 4. Multi-Layer Fault Tolerance

1. **WebSocket Auto-Reconnect with Polling Fallback**:
   If the WebSocket stream is disconnected, the React frontend activates an integrated REST fallback loop (querying `/api/latest` every 3–5 seconds), ensuring the dashboard never goes blank.
2. **Offline Simulation Mode**:
   If the backend is not yet started, the frontend falls back seamlessly to an internal simulated preservation telemetry generator with realistic baseline oscillations.
3. **Alert Deduplication**:
   Repeated incoming sensor readings exceeding a threshold will not generate duplicate alerts. An alert is only recorded when transitioning into a new threat state or after 15 minutes of sustained unacknowledged danger.
