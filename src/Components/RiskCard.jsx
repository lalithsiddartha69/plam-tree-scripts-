import React from 'react';
import { 
  ShieldCheck, 
  AlertTriangle, 
  AlertOctagon, 
  Activity, 
  Sparkles, 
  Clock, 
  CheckCircle2,
  TrendingUp,
  Cpu
} from 'lucide-react';

export default function RiskCard({ 
  riskScore = 0, 
  riskLevel = 'SAFE', 
  mainFactor = 'none', 
  reason = 'Environmental conditions are optimal.', 
  exposureDuration = '0m',
  modelConfidence = null,
  isDemo = false,
  isLoading = false 
}) {
  const getLevelConfig = () => {
    switch (riskLevel?.toUpperCase()) {
      case 'CRITICAL':
        return {
          title: 'CRITICAL PRESERVATION RISK',
          subtext: 'Immediate degradation risk. Active intervention required.',
          badgeBg: 'bg-rose-500/20 text-rose-300 border-rose-500/40',
          cardBg: 'bg-gradient-to-br from-slate-900 via-rose-950/20 to-slate-900 border-rose-500/50 shadow-rose-950/40',
          gaugeColor: '#f43f5e',
          textColor: 'text-rose-400',
          factorColor: 'text-rose-300 bg-rose-500/20 border-rose-500/30',
          icon: AlertOctagon,
          pulse: 'animate-pulse',
        };
      case 'WARNING':
        return {
          title: 'PRESERVATION WARNING',
          subtext: 'Parameters outside conservation thresholds. Action recommended.',
          badgeBg: 'bg-amber-500/20 text-amber-300 border-amber-500/40',
          cardBg: 'bg-gradient-to-br from-slate-900 via-amber-950/15 to-slate-900 border-amber-500/40 shadow-amber-950/30',
          gaugeColor: '#f59e0b',
          textColor: 'text-amber-400',
          factorColor: 'text-amber-300 bg-amber-500/20 border-amber-500/30',
          icon: AlertTriangle,
          pulse: '',
        };
      case 'SAFE':
      default:
        return {
          title: 'PRESERVATION ENVIRONMENT SAFE',
          subtext: 'Micro-climate within archival conservation standards.',
          badgeBg: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30',
          cardBg: 'bg-gradient-to-br from-slate-900 via-emerald-950/10 to-slate-900 border-emerald-500/30 shadow-emerald-950/20',
          gaugeColor: '#10b981',
          textColor: 'text-emerald-400',
          factorColor: 'text-emerald-300 bg-emerald-500/20 border-emerald-500/30',
          icon: ShieldCheck,
          pulse: '',
        };
    }
  };

  const config = getLevelConfig();
  const Icon = config.icon;
  const clampedScore = Math.min(100, Math.max(0, Math.round(riskScore)));

  // SVG Gauge calculation
  const radius = 68;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (clampedScore / 100) * circumference;

  return (
    <div className={`rounded-2xl border p-5 sm:p-7 shadow-xl transition-all duration-300 relative overflow-hidden ${config.cardBg}`}>
      
      {/* Decorative background glow */}
      <div 
        className="absolute -top-24 -right-24 w-60 h-60 rounded-full blur-3xl opacity-20 pointer-events-none"
        style={{ backgroundColor: config.gaugeColor }}
      />

      {/* Card Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-5 border-b border-slate-800/80">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold uppercase tracking-widest text-slate-400">
              PRESERVATION RISK ASSESSMENT
            </span>
            {isDemo && (
              <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30">
                SIMULATED AI
              </span>
            )}
          </div>
          <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight mt-0.5">
            {config.title}
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            {config.subtext}
          </p>
        </div>

        {/* Status Badge */}
        <div className="flex items-center gap-2">
          <div className={`inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-black uppercase tracking-wider border shadow-sm ${config.badgeBg}`}>
            <Icon className={`w-4 h-4 ${config.pulse}`} />
            <span>{riskLevel}</span>
          </div>
        </div>
      </div>

      {/* Main Content Grid: Score Gauge + Factors Breakdown */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center pt-6">
        
        {/* Left: Circular Risk Score Meter */}
        <div className="md:col-span-4 flex flex-col items-center justify-center">
          <div className="relative w-44 h-44 flex items-center justify-center">
            <svg className="w-full h-full transform -rotate-90" viewBox="0 0 160 160">
              {/* Background Track */}
              <circle
                cx="80"
                cy="80"
                r={radius}
                stroke="#1e293b"
                strokeWidth="12"
                fill="transparent"
              />
              {/* Animated Progress Ring */}
              <circle
                cx="80"
                cy="80"
                r={radius}
                stroke={config.gaugeColor}
                strokeWidth="12"
                strokeDasharray={circumference}
                strokeDashoffset={strokeDashoffset}
                strokeLinecap="round"
                fill="transparent"
                className="transition-all duration-700 ease-out"
              />
            </svg>

            {/* Score in Center */}
            <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
              {isLoading ? (
                <div className="w-12 h-8 bg-slate-800 rounded animate-pulse"></div>
              ) : (
                <span className={`text-4xl sm:text-5xl font-black font-mono tracking-tight ${config.textColor}`}>
                  {clampedScore}
                </span>
              )}
              <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-widest mt-0.5">
                / 100 Risk
              </span>
            </div>
          </div>
          
          <div className="text-center mt-2">
            <span className="text-xs text-slate-400 font-mono">
              Thresholds: 0–40 Safe | 41–75 Warning | 76–100 Critical
            </span>
          </div>
        </div>

        {/* Right: Primary Factor & AI Reason Panel */}
        <div className="md:col-span-8 flex flex-col justify-center space-y-4">
          
          {/* Main Factor & Reason Box */}
          <div className="p-4 rounded-xl bg-slate-800/60 border border-slate-700/60">
            <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                Primary Threat Factor
              </span>
              <span className={`text-xs font-bold uppercase px-2.5 py-0.5 rounded-full border ${config.factorColor}`}>
                {mainFactor && mainFactor !== 'none' ? mainFactor : 'All Parameters Balanced'}
              </span>
            </div>

            <div className="text-sm sm:text-base font-medium text-slate-100 leading-relaxed">
              {reason || 'Environmental parameters are within acceptable archival limits.'}
            </div>
          </div>

          {/* Exposure Duration & Model Confidence Metrics */}
          <div className="grid grid-cols-2 gap-3 text-xs">
            <div className="p-3 rounded-lg bg-slate-800/40 border border-slate-800 flex items-center gap-2.5">
              <div className="p-2 rounded-md bg-slate-700/50 text-slate-300">
                <Clock className="w-4 h-4" />
              </div>
              <div>
                <div className="text-slate-400 text-[11px]">Exposure Duration</div>
                <div className="font-semibold text-slate-200 font-mono mt-0.5">
                  {exposureDuration || '0m'}
                </div>
              </div>
            </div>

            <div className="p-3 rounded-lg bg-slate-800/40 border border-slate-800 flex items-center gap-2.5">
              <div className="p-2 rounded-md bg-slate-700/50 text-slate-300">
                <Cpu className="w-4 h-4" />
              </div>
              <div>
                <div className="text-slate-400 text-[11px]">Model Confidence</div>
                <div className="font-semibold text-slate-200 font-mono mt-0.5">
                  {modelConfidence !== null ? `${Math.round(modelConfidence * 100)}% Confidence` : '92% Heuristic'}
                </div>
              </div>
            </div>
          </div>

        </div>

      </div>

    </div>
  );
}
