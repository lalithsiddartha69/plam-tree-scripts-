import React from 'react';
import { HelpCircle, AlertTriangle, ShieldCheck, Check, Info, ShieldAlert } from 'lucide-react';
import { PRESERVATION_THRESHOLDS } from '../services/mockData';

export default function RiskExplanation({ 
  telemetry = {}, 
  risk = {} 
}) {
  const {
    risk_score = 0,
    risk_level = 'SAFE',
    main_factor = 'none',
    reason = 'Environmental conditions are optimal.',
    exposure_duration = '0m',
    model_confidence = null,
  } = risk;

  // Compute status for each contributing parameter
  const getParamSeverity = (key, value) => {
    if (value === undefined || value === null) return { level: 'NORMAL', label: 'NORMAL', bar: 10, color: 'bg-slate-600', text: 'text-slate-400' };
    const conf = PRESERVATION_THRESHOLDS[key];
    if (!conf) return { level: 'NORMAL', label: 'NORMAL', bar: 10, color: 'bg-slate-600', text: 'text-slate-400' };

    if (key === 'humidity') {
      if (value >= conf.criticalHigh || value <= conf.criticalLow) {
        return { level: 'CRITICAL', label: 'HIGH SEVERITY', bar: 95, color: 'bg-rose-500', text: 'text-rose-400' };
      }
      if (value > conf.max || value < conf.min) {
        return { level: 'WARNING', label: 'MODERATE', bar: 65, color: 'bg-amber-500', text: 'text-amber-400' };
      }
      return { level: 'SAFE', label: 'NORMAL', bar: 20, color: 'bg-emerald-500', text: 'text-emerald-400' };
    }

    if (key === 'temperature') {
      if (value >= conf.criticalHigh || value <= conf.criticalLow) {
        return { level: 'CRITICAL', label: 'HIGH SEVERITY', bar: 90, color: 'bg-rose-500', text: 'text-rose-400' };
      }
      if (value > conf.max || value < conf.min) {
        return { level: 'WARNING', label: 'MODERATE', bar: 60, color: 'bg-amber-500', text: 'text-amber-400' };
      }
      return { level: 'SAFE', label: 'NORMAL', bar: 20, color: 'bg-emerald-500', text: 'text-emerald-400' };
    }

    if (conf.criticalHigh && value >= conf.criticalHigh) {
      return { level: 'CRITICAL', label: 'HIGH SEVERITY', bar: 90, color: 'bg-rose-500', text: 'text-rose-400' };
    }
    if (conf.warningHigh && value > conf.max) {
      return { level: 'WARNING', label: 'MODERATE', bar: 60, color: 'bg-amber-500', text: 'text-amber-400' };
    }
    return { level: 'SAFE', label: 'NORMAL', bar: 20, color: 'bg-emerald-500', text: 'text-emerald-400' };
  };

  const parameters = [
    { key: 'humidity', name: 'Relative Humidity', val: telemetry.humidity, unit: '%' },
    { key: 'uv', name: 'UV Radiation', val: telemetry.uv, unit: 'mW/cm²' },
    { key: 'temperature', name: 'Temperature', val: telemetry.temperature, unit: '°C' },
    { key: 'light', name: 'Display Illumination', val: telemetry.light, unit: 'lx' },
    { key: 'pm25', name: 'Airborne PM2.5', val: telemetry.pm25, unit: 'µg/m³' },
  ];

  // Preservation recommendation based on primary factor
  const getActionRecommendation = () => {
    switch (main_factor?.toLowerCase()) {
      case 'humidity':
        return risk_level === 'CRITICAL'
          ? 'Urgent: Relative humidity exceeds critical threshold. Activate enclosure desiccants/dehumidifier immediately. Inspect leaf surfaces for Aspergillus fungal spores.'
          : 'Advisory: Humidity is creeping upward. Inspect silica gel packets and verify enclosure seal gaskets.';
      case 'temperature':
        return 'Advisory: Thermal elevation accelerates chemical hydrolysis of leaf fibers. Ensure climate control maintains 20–24°C.';
      case 'uv':
      case 'light':
        return 'Advisory: High lux/UV causes photo-oxidation of organic ink pigments. Relocate spotlight or attach UV filtering film to showcase glass.';
      case 'pm25':
        return 'Advisory: Particulate matter detected. Check HEPA air filtration unit in archival storage vault.';
      default:
        return 'Conservation Status: Optimal micro-climate maintained. Continue continuous telemetric monitoring.';
    }
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-sm">
      <div className="flex items-center justify-between pb-3 border-b border-slate-800">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-emerald-500/10 text-emerald-400">
            <HelpCircle className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-white uppercase tracking-wider">
              Why is the manuscript at risk?
            </h3>
            <p className="text-xs text-slate-400">
              Preservation Engine Explainability & Environmental Factor Analysis
            </p>
          </div>
        </div>

        <span className="text-xs font-mono text-slate-400">
          Exposure: <strong className="text-slate-200">{exposure_duration || '0m'}</strong>
        </span>
      </div>

      {/* Main Reason Banner */}
      <div className="mt-4 p-3.5 rounded-lg bg-slate-800/60 border border-slate-700/60">
        <div className="flex items-start gap-2.5">
          <Info className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
          <div className="text-xs sm:text-sm text-slate-200 leading-relaxed">
            <strong className="text-white">Preservation Diagnosis: </strong>
            {reason}
          </div>
        </div>
      </div>

      {/* Contributing Parameters Breakdown */}
      <div className="mt-4 space-y-3">
        <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
          Contributing Environmental Metrics
        </div>

        <div className="space-y-2">
          {parameters.map((param) => {
            const severity = getParamSeverity(param.key, param.val);
            const isMain = main_factor && main_factor.toLowerCase() === param.key.toLowerCase();
            return (
              <div 
                key={param.key} 
                className={`p-2.5 rounded-lg border transition-all ${
                  isMain 
                    ? 'bg-slate-800/80 border-slate-600' 
                    : 'bg-slate-800/30 border-slate-800'
                }`}
              >
                <div className="flex items-center justify-between text-xs mb-1.5">
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-slate-200">{param.name}</span>
                    {isMain && (
                      <span className="text-[10px] font-bold px-1.5 py-0.2 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30">
                        PRIMARY DRIVER
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-2 font-mono">
                    <span className="text-slate-300">
                      {param.val !== undefined && param.val !== null ? `${param.val} ${param.unit}` : '--'}
                    </span>
                    <span className={`text-[10px] font-bold uppercase ${severity.text}`}>
                      {severity.label}
                    </span>
                  </div>
                </div>

                {/* Progress Visual Bar */}
                <div className="w-full bg-slate-700/50 rounded-full h-1.5 overflow-hidden">
                  <div 
                    className={`h-full rounded-full transition-all duration-500 ${severity.color}`} 
                    style={{ width: `${severity.bar}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Action Recommendation */}
      <div className="mt-4 pt-3 border-t border-slate-800 flex items-start gap-2.5 text-xs text-slate-300">
        <ShieldAlert className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
        <div>
          <span className="font-semibold text-slate-200">Recommended Action: </span>
          <span>{getActionRecommendation()}</span>
        </div>
      </div>

    </div>
  );
}
