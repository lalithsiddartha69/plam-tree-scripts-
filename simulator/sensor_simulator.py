#!/usr/bin/env python3
"""
PALM GUARD IoT - Sensor Telemetry Simulator
Simulates ESP32 sensor enclosure sending multi-parameter environmental telemetry
to the FastAPI backend via REST API.

Supports:
- baseline: Optimal archival micro-climate (SAFE)
- spike: Humidity increase (WARNING)
- critical: Prolonged high humidity & temperature (CRITICAL)
- story: Automated Hackathon demonstration sequence
"""

import sys
import time
import math
import random
import requests
from datetime import datetime

DEFAULT_API_URL = "http://localhost:8000/api/telemetry"

def send_reading(url: str, temp: float, hum: float, light: float, uv: float, pm25: float, source: str = "SIMULATOR_ESP32"):
    payload = {
        "timestamp": datetime.utcnow().isoformat(),
        "temperature": round(temp, 1),
        "humidity": round(hum, 1),
        "light": round(light, 1),
        "uv": round(uv, 2),
        "pm25": round(pm25, 1),
        "source": source,
    }

    try:
        resp = requests.post(url, json=payload, timeout=3.0)
        if resp.status_code == 201:
            data = resp.json()
            print(f"[{datetime.now().strftime('%H:%M:%S')}] Telemetry Ingested -> Temp: {temp:.1f}°C | Hum: {hum:.1f}% | Light: {light:.0f}lx | UV: {uv:.2f} | PM2.5: {pm25:.1f}")
            return True
        else:
            print(f"Server responded with status {resp.status_code}: {resp.text}")
            return False
    except requests.exceptions.RequestException as e:
        print(f"Could not connect to {url}: {e}")
        return False

def run_baseline(url: str, interval: float = 2.0):
    print("Starting BASELINE SAFE telemetry stream (Optimal preservation)... Press Ctrl+C to stop.")
    step = 0
    while True:
        wave = math.sin(step / 5)
        temp = 22.0 + wave * 0.8 + random.uniform(-0.2, 0.2)
        hum = 51.0 + wave * 2.0 + random.uniform(-0.5, 0.5)
        light = 45.0 + random.uniform(-3, 3)
        uv = 0.08 + random.uniform(-0.01, 0.01)
        pm25 = 8.0 + random.uniform(-1, 1)
        send_reading(url, temp, hum, light, uv, pm25)
        step += 1
        time.sleep(interval)

def run_spike(url: str, interval: float = 2.0):
    print("Starting HUMIDITY SPIKE stream (WARNING demonstration)... Press Ctrl+C to stop.")
    step = 0
    while True:
        temp = 25.2 + random.uniform(-0.2, 0.2)
        hum = 68.5 + math.sin(step / 3) * 2.0 + random.uniform(-0.5, 0.5)
        light = 70.0 + random.uniform(-5, 5)
        uv = 0.15 + random.uniform(-0.02, 0.02)
        pm25 = 14.0 + random.uniform(-1, 1)
        send_reading(url, temp, hum, light, uv, pm25)
        step += 1
        time.sleep(interval)

def run_critical(url: str, interval: float = 2.0):
    print("Starting PROLONGED CRITICAL stream (CRITICAL demonstration)... Press Ctrl+C to stop.")
    step = 0
    while True:
        temp = 28.5 + random.uniform(-0.3, 0.3)
        hum = 78.4 + math.sin(step / 3) * 2.5 + random.uniform(-0.5, 0.5)
        light = 155.0 + random.uniform(-10, 10)
        uv = 0.65 + random.uniform(-0.05, 0.05)
        pm25 = 26.0 + random.uniform(-2, 2)
        send_reading(url, temp, hum, light, uv, pm25)
        step += 1
        time.sleep(interval)

def run_demo_story(url: str):
    print("==================================================================")
    print("PALM GUARD IoT - AUTOMATED HACKATHON DEMO SEQUENCE")
    print("==================================================================")

    print("\n>>> PHASE 1: Baseline Preservation Condition (SAFE)")
    for i in range(5):
        send_reading(url, temp=22.2, hum=51.5, light=48.0, uv=0.08, pm25=8.5)
        time.sleep(2)

    print("\n>>> PHASE 2: Humidity Creeps Upward (WARNING threshold reached)")
    for hum in [57.0, 61.5, 65.2, 68.4, 70.0]:
        send_reading(url, temp=24.5, hum=hum, light=65.0, uv=0.14, pm25=12.0)
        time.sleep(2)

    print("\n>>> PHASE 3: Prolonged High Humidity Exposure (CRITICAL preservation risk)")
    for hum in [73.5, 76.8, 78.5, 80.2, 82.0]:
        send_reading(url, temp=28.4, hum=hum, light=120.0, uv=0.45, pm25=22.0)
        time.sleep(2)

    print("\n>>> PHASE 4: Verification of Triggered Alerts & Real-Time Dashboard Updates")
    for i in range(3):
        send_reading(url, temp=28.5, hum=81.0, light=125.0, uv=0.46, pm25=23.0)
        time.sleep(2)

    print("\n[COMPLETE] Automated Hackathon sequence completed successfully.")

if __name__ == "__main__":
    mode = sys.argv[1] if len(sys.argv) > 1 else "baseline"
    target_url = sys.argv[2] if len(sys.argv) > 2 else DEFAULT_API_URL

    if mode == "baseline":
        run_baseline(target_url)
    elif mode == "spike":
        run_spike(target_url)
    elif mode == "critical":
        run_critical(target_url)
    elif mode == "story":
        run_demo_story(target_url)
    else:
        print(f"Unknown mode '{mode}'. Usage: python sensor_simulator.py [baseline|spike|critical|story] [api_url]")
