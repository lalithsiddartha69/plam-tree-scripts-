import React from 'react';
import { 
  Thermometer, 
  Droplets, 
  Sun, 
  Sparkles, 
  Wind, 
  TrendingUp, 
  TrendingDown, 
  Minus,
  AlertCircle,
  CheckCircle2
} from 'lucide-react';
import { PRESERVATION_THRESHOLDS } from '../services/mockData';

const ICONS = {
  temperature: Thermometer,
  humidity: Droplets,
  light: Sun,
  uv: Sparkles,
  pm25: Wind,
};

export default function SensorCard({ 
  type, 
  value, 
  previousValue = null, 
  isLoading = false 
}) {
  const config = PRESERVATION_THRESHOLDS[type] || {
    label: type,
    unit: '',
    min: 0,
    max: 100,
    description: '',
  };

  const Icon = ICONS[type] || Activity;

  // Determine threshold status
  const getStatus = () => {
    if (value === null || value === undefined) return { level: 'UNKNOWN', label: 'NO DATA', color: 'slate' };

    if (type === 'humidity') {
      if (value >= config.criticalHigh || value <= config.criticalLow) {
        return { level: 'CRITICAL', label: 'CRITICAL', color: 'rose' };
      }
      if (value > config.max || value < config.min) {
        return { level: 'WARNING', label: 'ELEVATED', color: 'amber' };
      }
      return { level: 'SAFE', label: 'OPTIMAL', color: 'emerald' };
    }

    if (type === 'temperature') {
      if (value >= config.criticalHigh || value <= config.criticalLow) {
        return { level: 'CRITICAL', label: 'CRITICAL', color: 'rose' };
      }
      if (value > config.max || value < config.min) {
        return { level: 'WARNING', label: 'SUB-OPTIMAL', color: 'amber' };
      }
      return { level: 'SAFE', label: 'OPTIMAL', color: 'emerald' };
    }

    // Light, UV, PM25 (higher is riskier)
    if (config.criticalHigh && value >= config.criticalHigh) {
      return { level: 'CRITICAL', label: 'CRITICAL', color: 'rose' };
    }
    if (config.warningHigh && value > config.max) {
      return { level: 'WARNING', label: 'ELEVATED', color: 'amber' };
    }
    return { level: 'SAFE', label: 'OPTIMAL', color: 'emerald' };
  };

  const status = getStatus();

  // Compute trend
  const getTrend = () => {
    if (previousValue === null || value === null || previousValue === undefined) return null;
    const diff = value - previousValue;
    if (Math.abs(diff) < 0.05) {
      return { icon: Minus, text: 'Stable', color: 'text-slate-400' };
    }
    if (diff > 0) {
      return { icon: TrendingUp, text: `+${diff.toFixed(1)}`, color: status.level === 'SAFE' ? 'text-slate-400' : 'text-amber-400' };
    }
    return { icon: TrendingDown, text: `${diff.toFixed(1)}`, color: 'text-slate-400' };
  };

  const trend = getTrend();

  const colorStyles = {
    emerald: {
      border: 'border-slate-800 hover:border-emerald-500/30',
      badge: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
      iconBg: 'bg-emerald-500/10 text-emerald-400',
      value: 'text-white',
    },
    amber: {
      border: 'border-amber-500/40 bg-amber-950/10 hover:border-amber-500/60',
      badge: 'bg-amber-500/15 text-amber-300 border-amber-500/30',
      iconBg: 'bg-amber-500/20 text-amber-300',
      value: 'text-amber-200',
    },
    rose: {
      border: 'border-rose-500/50 bg-rose-950/20 hover:border-rose-500/80',
      badge: 'bg-rose-500/20 text-rose-300 border-rose-500/40',
      iconBg: 'bg-rose-500/25 text-rose-300',
      value: 'text-rose-200',
    },
    slate: {
      border: 'border-slate-800',
      badge: 'bg-slate-800 text-slate-400 border-slate-700',
      iconBg: 'bg-slate-800 text-slate-400',
      value: 'text-slate-400',
    },
  }[status.color];

  return (
    <div className={`rounded-xl p-4 bg-slate-900 border transition-all duration-200 shadow-sm ${colorStyles.border}`}>
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <div className={`p-2 rounded-lg ${colorStyles.iconBg}`}>
            <Icon className="w-4 h-4" />
          </div>
          <span className="text-xs font-medium text-slate-300 uppercase tracking-wide">
            {config.label}
          </span>
        </div>

        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${colorStyles.badge}`}>
          {status.label}
        </span>
      </div>

      <div className="flex items-baseline justify-between mt-1">
        <div className="flex items-baseline gap-1">
          {isLoading ? (
            <div className="h-8 w-16 bg-slate-800 rounded animate-pulse"></div>
          ) : (
            <span className={`text-2xl font-bold font-mono tracking-tight ${colorStyles.value}`}>
              {value !== null && value !== undefined ? (typeof value === 'number' ? value.toFixed(1) : value) : '--'}
            </span>
          )}
          <span className="text-xs font-medium text-slate-400 font-mono">
            {config.unit}
          </span>
        </div>

        {trend && (
          <div className={`flex items-center gap-1 text-xs font-mono ${trend.color}`}>
            <trend.icon className="w-3.5 h-3.5" />
            <span>{trend.text}</span>
          </div>
        )}
      </div>

      {/* Target threshold indicator */}
      <div className="mt-3 pt-2.5 border-t border-slate-800/80 flex items-center justify-between text-[11px] text-slate-400">
        <span>Target:</span>
        <span className="font-mono text-slate-300">
          {type === 'humidity' ? `${config.min}–${config.max}%` : ''}
          {type === 'temperature' ? `${config.min}–${config.max}°C` : ''}
          {type === 'light' ? `<${config.max} lx` : ''}
          {type === 'uv' ? `<${config.max} mW/cm²` : ''}
          {type === 'pm25' ? `<${config.max} µg/m³` : ''}
        </span>
      </div>
    </div>
  );
}
