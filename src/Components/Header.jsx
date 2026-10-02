import React, { useState, useEffect } from 'react';
import { Shield, Radio, Activity, RefreshCw, Sparkles, Clock, AlertTriangle } from 'lucide-react';

export default function Header({ 
  wsStatus, 
  isDemoMode, 
  onToggleDemoMode, 
  onRefresh, 
  lastUpdated,
  isRefreshing 
}) {
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const getStatusBadge = () => {
    switch (wsStatus) {
      case 'CONNECTED':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
            LIVE STREAM (WS)
          </span>
        );
      case 'FALLBACK_POLLING':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-amber-500/10 text-amber-400 border border-amber-500/20">
            <span className="w-2 h-2 rounded-full bg-amber-400"></span>
            REST POLLING (3s)
          </span>
        );
      case 'CONNECTING':
      default:
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-slate-500/10 text-slate-400 border border-slate-700">
            <span className="w-2 h-2 rounded-full bg-slate-400 animate-ping"></span>
            CONNECTING...
          </span>
        );
    }
  };

  return (
    <header className="bg-slate-900 border-b border-slate-800 sticky top-0 z-30 shadow-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3.5">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
          
          {/* Logo & Title */}
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-700 flex items-center justify-center shadow-lg shadow-emerald-900/30 text-white font-black text-xl tracking-wider">
              <Shield className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl font-bold tracking-tight text-white font-mono">
                  PALM GUARD <span className="text-emerald-400 text-sm font-semibold tracking-normal px-1.5 py-0.5 rounded bg-emerald-950/60 border border-emerald-800/40">IoT</span>
                </h1>
                {isDemoMode && (
                  <span className="inline-flex items-center gap-1 text-[11px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30">
                    <Sparkles className="w-3 h-3" /> DEMO DATA
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-400">
                Smart Palm-Leaf Manuscript Preservation & Environmental Risk System
              </p>
            </div>
          </div>

          {/* Right Action & Diagnostics Group */}
          <div className="flex flex-wrap items-center gap-2.5 sm:gap-3 text-xs">
            {/* Live Clock */}
            <div className="hidden sm:flex items-center gap-1.5 px-3 py-1 rounded-lg bg-slate-800/60 text-slate-300 border border-slate-700/60 font-mono">
              <Clock className="w-3.5 h-3.5 text-slate-400" />
              <span>{currentTime.toLocaleTimeString()}</span>
            </div>

            {/* Socket Status Badge */}
            {getStatusBadge()}

            {/* Demo Toggle Button */}
            <button
              onClick={onToggleDemoMode}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-medium transition-all duration-200 border ${
                isDemoMode
                  ? 'bg-amber-500/20 text-amber-300 border-amber-500/40 hover:bg-amber-500/30'
                  : 'bg-slate-800 text-slate-300 border-slate-700 hover:bg-slate-700 text-slate-200'
              }`}
              title="Toggle interactive Hackathon Demo Scenarios"
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              <span>{isDemoMode ? 'Demo Simulator: ON' : 'Demo Simulator'}</span>
            </button>

            {/* Manual Refresh */}
            <button
              onClick={onRefresh}
              disabled={isRefreshing}
              className="p-1.5 rounded-lg bg-slate-800 border border-slate-700 text-slate-300 hover:bg-slate-700 hover:text-white transition disabled:opacity-50"
              title="Force Sync Telemetry"
            >
              <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin text-emerald-400' : ''}`} />
            </button>
          </div>

        </div>
      </div>
    </header>
  );
}
