/**
 * PALM GUARD IoT - Demo & Mock Telemetry Engine
 * Designed for hackathon presentations, empty-state testing, and offline fallback.
 * ALL data generated here is explicitly tagged with `is_demo: true` and `source: "DEMO_SIMULATION"`.
 */

export const PRESERVATION_THRESHOLDS = {
  temperature: {
    min: 18.0,
    max: 24.0,
    unit: '°C',
    label: 'Temperature',
    warningLow: 16.0,
    warningHigh: 27.0,
    criticalLow: 14.0,
    criticalHigh: 30.0,
    description: 'Target: 20–24°C. High heat causes desiccation and leaf embrittlement.',
  },
  humidity: {
    min: 45.0,
    max: 55.0,
    unit: '%',
    label: 'Relative Humidity',
    warningLow: 40.0,
    warningHigh: 65.0,
    criticalLow: 35.0,
    criticalHigh: 75.0,
    description: 'Target: 45–55% RH. >65% triggers fungal spores (Aspergillus); <40% causes cracking.',
  },
  light: {
    min: 0.0,
    max: 100.0,
    unit: 'lx',
    label: 'Light Intensity',
    warningHigh: 150.0,
    criticalHigh: 300.0,
    description: 'Target: <100 lux. High illumination photo-oxidizes natural plant leaf cellulose.',
  },
  uv: {
    min: 0.0,
    max: 0.20,
    unit: 'mW/cm²',
    label: 'UV Radiation',
    warningHigh: 0.50,
    criticalHigh: 1.00,
    description: 'Target: <0.20 mW/cm². UV destroys iron-gall and lampblack carbon inks.',
  },
  pm25: {
    min: 0.0,
    max: 15.0,
    unit: 'µg/m³',
    label: 'Particulate Matter (PM2.5)',
    warningHigh: 35.0,
    criticalHigh: 75.0,
    description: 'Target: <15 µg/m³. Acidic particulates settle into micro-grooves causing abrasion.',
  },
};

export const DEMO_SCENARIOS = {
  safe: {
    id: 'safe',
    name: 'Normal Preservation (SAFE)',
    description: 'Optimal archival micro-climate. All metrics within standard palm-leaf museum thresholds.',
    telemetry: {
      timestamp: new Date().toISOString(),
      temperature: 22.3,
      humidity: 51.4,
      light: 48.0,
      uv: 0.08,
      pm25: 8.5,
      is_demo: true,
      source: 'DEMO_SIMULATION',
    },
    risk: {
      timestamp: new Date().toISOString(),
      risk_score: 18.5,
      risk_level: 'SAFE',
      main_factor: 'none',
      reason: 'Environmental parameters are within optimal archival conservation limits.',
      exposure_duration: '0m',
      model_confidence: 0.94,
      is_demo: true,
    },
    camera: {
      status: 'ACTIVE',
      last_checked: new Date().toISOString(),
      condition: 'NORMAL',
      visual_risk: 12,
      reason: 'Surface uniform, no microbial fungal mycelium or insect abrasion detected.',
    },
  },

  warning_humidity: {
    id: 'warning_humidity',
    name: 'Humidity Elevation (WARNING)',
    description: 'Relative humidity rises to 68.4%. Approaching fungal sporulation threshold.',
    telemetry: {
      timestamp: new Date().toISOString(),
      temperature: 25.1,
      humidity: 68.4,
      light: 75.0,
      uv: 0.15,
      pm25: 14.2,
      is_demo: true,
      source: 'DEMO_SIMULATION',
    },
    risk: {
      timestamp: new Date().toISOString(),
      risk_score: 64.0,
      risk_level: 'WARNING',
      main_factor: 'humidity',
      reason: 'Elevated relative humidity (68.4%). Risk of fungal sporulation and fiber swelling.',
      exposure_duration: '1 hour 15 minutes',
      model_confidence: 0.88,
      is_demo: true,
    },
    camera: {
      status: 'ACTIVE',
      last_checked: new Date().toISOString(),
      condition: 'NORMAL',
      visual_risk: 28,
      reason: 'Slight hygroscopic surface sheen detected; no physical mold colonies yet.',
    },
  },

  critical_prolonged: {
    id: 'critical_prolonged',
    name: 'Prolonged Exposure (CRITICAL)',
    description: 'High humidity (>74%) sustained for over 3 hours combined with elevated heat.',
    telemetry: {
      timestamp: new Date().toISOString(),
      temperature: 28.7,
      humidity: 78.2,
      light: 165.0,
      uv: 0.62,
      pm25: 28.0,
      is_demo: true,
      source: 'DEMO_SIMULATION',
    },
    risk: {
      timestamp: new Date().toISOString(),
      risk_score: 88.5,
      risk_level: 'CRITICAL',
      main_factor: 'humidity',
      reason: 'Prolonged high humidity exposure exceeding 3 hours. Severe risk of Aspergillus mold outbreak and leaf delamination.',
      exposure_duration: '3 hours 42 minutes',
      model_confidence: 0.92,
      is_demo: true,
    },
    camera: {
      status: 'ACTIVE',
      last_checked: new Date().toISOString(),
      condition: 'ANOMALY',
      visual_risk: 76,
      reason: 'Micro-discoloration and localized surface bloom spotted along manuscript edge.',
    },
  },

  warning_light_uv: {
    id: 'warning_light_uv',
    name: 'Excessive UV / Light (WARNING)',
    description: 'Display spotlight improperly angled, delivering 260 lux and 0.84 mW/cm² UV.',
    telemetry: {
      timestamp: new Date().toISOString(),
      temperature: 24.8,
      humidity: 52.0,
      light: 260.0,
      uv: 0.84,
      pm25: 11.0,
      is_demo: true,
      source: 'DEMO_SIMULATION',
    },
    risk: {
      timestamp: new Date().toISOString(),
      risk_score: 68.0,
      risk_level: 'WARNING',
      main_factor: 'uv',
      reason: 'Intense UV radiation and light exposure. Accelerated photo-chemical degradation of ink pigment.',
      exposure_duration: '48 minutes',
      model_confidence: 0.87,
      is_demo: true,
    },
    camera: {
      status: 'ACTIVE',
      last_checked: new Date().toISOString(),
      condition: 'NORMAL',
      visual_risk: 35,
      reason: 'Direct glare detected on manuscript upper surface.',
    },
  },
};

/**
 * Generates realistic historical points for time ranges
 */
export function generateMockHistory(hours = 1, pointsCount = 20) {
  const now = Date.now();
  const stepMs = (hours * 3600 * 1000) / pointsCount;
  const history = [];

  for (let i = pointsCount - 1; i >= 0; i--) {
    const t = new Date(now - i * stepMs);
    const timeLabel = t.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    // Slight sine-wave oscillation to mimic natural indoor enclosure fluctuations
    const wave = Math.sin(i / 3);
    const temp = Number((22.0 + wave * 1.8 + (Math.random() * 0.4 - 0.2)).toFixed(1));
    const hum = Number((52.0 + wave * 5.2 + (Math.random() * 1.0 - 0.5)).toFixed(1));
    const light = Number(Math.max(10, (50 + wave * 25 + Math.random() * 10)).toFixed(0));
    const uv = Number(Math.max(0.02, (0.09 + wave * 0.05 + Math.random() * 0.02)).toFixed(2));
    const pm25 = Number(Math.max(4, (9.0 + wave * 2.5 + Math.random() * 1.5)).toFixed(1));

    // Dynamic mock risk calculation for history
    let risk = 15 + Math.max(0, (hum - 55) * 2.2) + Math.max(0, (temp - 24) * 3.0) + (uv > 0.3 ? 20 : 0);
    risk = Number(Math.min(100, Math.max(10, risk)).toFixed(1));

    history.push({
      timestamp: t.toISOString(),
      time: timeLabel,
      temperature: temp,
      humidity: hum,
      light,
      uv,
      pm25,
      risk_score: risk,
      is_demo: true,
    });
  }

  return history;
}

export const INITIAL_ALERTS = [
  {
    id: 1,
    timestamp: new Date(Date.now() - 42 * 60 * 1000).toISOString(),
    risk_level: 'WARNING',
    reason: 'Relative humidity exceeded 65% safe threshold for 30 consecutive minutes.',
    main_factor: 'humidity',
    acknowledged: false,
  },
  {
    id: 2,
    timestamp: new Date(Date.now() - 95 * 60 * 1000).toISOString(),
    risk_level: 'WARNING',
    reason: 'Ambient display lighting exceeded 150 lux archival limit.',
    main_factor: 'light',
    acknowledged: true,
  },
];
