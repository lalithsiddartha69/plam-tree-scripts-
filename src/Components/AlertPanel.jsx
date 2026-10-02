import React, { useState } from 'react';
import { 
  Bell, 
  AlertTriangle, 
  AlertOctagon, 
  CheckCircle2, 
  Check, 
  Clock, 
  Filter,
  ShieldCheck 
} from 'lucide-react';

export default function AlertPanel({ 
  alerts = [], 
  onAcknowledge, 
  isLoading = false 
}) {
  const [filter, setFilter] = useState('active'); // 'all' | 'active' | 'acknowledged'

  const filteredAlerts = alerts.filter((a) => {
    if (filter === 'active') return !a.acknowledged;
    if (filter === 'acknowledged') return a.acknowledged;
    return true;
  });

  const formatTimestamp = (ts) => {
    if (!ts) return '';
    try {
      const d = new Date(ts);
      return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
    } catch {
      return ts;
    }
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-sm flex flex-col h-full">
      {/* Panel Header */}
      <div className="flex items-center justify-between pb-3 border-b border-slate-800">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-rose-500/10 text-rose-400">
            <Bell className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-white uppercase tracking-wider">
              Preservation Alert Feed
            </h3>
            <p className="text-xs text-slate-400">
              Threshold violations & prolonged exposure incidents
            </p>
          </div>
        </div>

        {/* Filter Pills */}
        <div className="flex items-center gap-1 bg-slate-800/80 p-0.5 rounded-lg border border-slate-700 text-xs">
          {[
            { id: 'active', label: 'Active' },
            { id: 'all', label: 'All' },
            { id: 'acknowledged', label: 'Ack' },
          ].map((f) => (
            <button
              key={f.id}
              onClick={() => setFilter(f.id)}
              className={`px-2 py-0.5 rounded-md font-medium transition ${
                filter === f.id
                  ? 'bg-slate-700 text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      {/* Alert List */}
      <div className="mt-3 flex-1 overflow-y-auto space-y-2.5 max-h-[380px] pr-1">
        {filteredAlerts.length === 0 ? (
          <div className="py-10 flex flex-col items-center justify-center text-center text-slate-500">
            <ShieldCheck className="w-8 h-8 text-emerald-500/40 mb-2" />
            <p className="text-xs font-semibold text-slate-400">No active preservation alerts</p>
            <p className="text-[11px] text-slate-500 mt-0.5">
              Enclosure environment is within safe preservation thresholds.
            </p>
          </div>
        ) : (
          filteredAlerts.map((alert) => {
            const isCritical = alert.risk_level === 'CRITICAL';
            const Icon = isCritical ? AlertOctagon : AlertTriangle;

            return (
              <div
                key={alert.id}
                className={`p-3 rounded-lg border transition-all ${
                  isCritical
                    ? 'bg-rose-950/20 border-rose-500/30 text-rose-200'
                    : 'bg-amber-950/20 border-amber-500/30 text-amber-200'
                } ${alert.acknowledged ? 'opacity-50' : ''}`}
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-start gap-2.5">
                    <div className={`p-1.5 rounded-md shrink-0 mt-0.5 ${
                      isCritical ? 'bg-rose-500/20 text-rose-300' : 'bg-amber-500/20 text-amber-300'
                    }`}>
                      <Icon className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className={`text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full ${
                          isCritical ? 'bg-rose-500/30 text-rose-200' : 'bg-amber-500/30 text-amber-200'
                        }`}>
                          {alert.risk_level}
                        </span>
                        <span className="text-[11px] text-slate-400 font-mono flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {formatTimestamp(alert.timestamp)}
                        </span>
                      </div>
                      <p className="text-xs font-medium text-slate-200 mt-1 leading-snug">
                        {alert.reason}
                      </p>
                    </div>
                  </div>

                  {/* Acknowledge Button */}
                  {!alert.acknowledged ? (
                    <button
                      onClick={() => onAcknowledge && onAcknowledge(alert.id)}
                      className="shrink-0 p-1.5 rounded-lg bg-slate-800 hover:bg-emerald-500/20 text-slate-300 hover:text-emerald-300 border border-slate-700 transition"
                      title="Acknowledge alert"
                    >
                      <Check className="w-3.5 h-3.5" />
                    </button>
                  ) : (
                    <span className="shrink-0 text-[10px] text-slate-400 px-2 py-0.5 rounded bg-slate-800">
                      Acknowledged
                    </span>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
