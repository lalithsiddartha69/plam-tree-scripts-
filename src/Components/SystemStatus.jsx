import React from 'react';
import { Cpu, Database, Brain, Wifi, Camera, CheckCircle2, AlertCircle } from 'lucide-react';

export default function SystemStatus({ 
  esp32Active = true, 
  aiModelReady = true, 
  dbConnected = true,
  cameraActive = true,
  lastTelemetryTime 
}) {
  const items = [
    {
      label: 'ESP32 IoT Node',
      subtext: esp32Active ? 'WiFi Gateway Active' : 'Offline / Awaiting Link',
      icon: Cpu,
      status: esp32Active ? 'online' : 'offline',
    },
    {
      label: 'AI Risk Engine',
      subtext: aiModelReady ? 'Random Forest v1.2' : 'Fallback Rules',
      icon: Brain,
      status: aiModelReady ? 'online' : 'warning',
    },
    {
      label: 'SQLite Storage',
      subtext: dbConnected ? 'Indexed & Synced' : 'Disconnected',
      icon: Database,
      status: dbConnected ? 'online' : 'offline',
    },
    {
      label: 'Vision Inspection',
      subtext: cameraActive ? 'Optical Module Online' : 'Standby',
      icon: Camera,
      status: cameraActive ? 'online' : 'warning',
    },
  ];

  return (
    <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-3 sm:p-4 backdrop-blur-sm">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4">
        {items.map((item, idx) => {
          const Icon = item.icon;
          const isOnline = item.status === 'online';
          const isWarning = item.status === 'warning';
          return (
            <div key={idx} className="flex items-center gap-3 p-2.5 rounded-lg bg-slate-800/40 border border-slate-800">
              <div className={`p-2 rounded-lg ${
                isOnline 
                  ? 'bg-emerald-500/10 text-emerald-400' 
                  : isWarning 
                    ? 'bg-amber-500/10 text-amber-400' 
                    : 'bg-rose-500/10 text-rose-400'
              }`}>
                <Icon className="w-4 h-4" />
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-1.5">
                  <span className="text-xs font-semibold text-slate-200 truncate">{item.label}</span>
                  {isOnline ? (
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
                  ) : (
                    <span className="w-1.5 h-1.5 rounded-full bg-amber-400"></span>
                  )}
                </div>
                <div className="text-[11px] text-slate-400 truncate">{item.subtext}</div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
