import React from 'react';
import { Camera, Eye, AlertTriangle, CheckCircle2, RefreshCw, Sparkles, Scan } from 'lucide-react';

export default function CameraPanel({ 
  cameraData = {}, 
  onTriggerInspection, 
  isInspecting = false 
}) {
  const {
    status = 'ACTIVE',
    last_checked = new Date().toISOString(),
    condition = 'NORMAL',
    visual_risk = 12,
    reason = 'Surface uniform, no microbial fungal spores or leaf embrittlement detected.',
    is_demo = true,
  } = cameraData;

  const isAnomaly = condition?.toUpperCase() === 'ANOMALY';

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-sm">
      {/* Header */}
      <div className="flex items-center justify-between pb-3 border-b border-slate-800">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-indigo-500/10 text-indigo-400">
            <Camera className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-bold text-white uppercase tracking-wider">
                Visual Condition Inspection
              </h3>
              <span className="text-[10px] font-semibold px-1.5 py-0.2 rounded bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                MODULAR CV
              </span>
            </div>
            <p className="text-xs text-slate-400">
              High-resolution optical monitoring of palm-leaf surface texture
            </p>
          </div>
        </div>

        <button
          onClick={onTriggerInspection}
          disabled={isInspecting}
          className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-800 text-slate-300 border border-slate-700 hover:bg-slate-700 text-xs font-medium transition disabled:opacity-50"
          title="Trigger Computer Vision Frame Scan"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${isInspecting ? 'animate-spin text-emerald-400' : ''}`} />
          <span>{isInspecting ? 'Scanning...' : 'Inspect'}</span>
        </button>
      </div>

      {/* Main Grid: Visual Frame + Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-4 mt-4">
        
        {/* Optical Viewport / Frame Mockup */}
        <div className="md:col-span-6 relative aspect-video bg-slate-950 rounded-lg overflow-hidden border border-slate-800 flex items-center justify-center group">
          {/* Subtle archival measurement grid overlay */}
          <div className="absolute inset-0 opacity-15 bg-[radial-gradient(#38bdf8_1px,transparent_1px)] [background-size:16px_16px]"></div>
          
          {/* Simulated Palm Leaf Manuscript Silhouette */}
          <div className="relative w-[85%] h-16 rounded bg-gradient-to-r from-amber-900/40 via-amber-800/50 to-amber-900/40 border border-amber-700/50 flex flex-col justify-center px-4 shadow-inner">
            <div className="flex items-center justify-between text-[9px] font-mono text-amber-300/80">
              <span>FOLIO #042-B</span>
              <span>TALIPOT PALM (CORYPHA)</span>
            </div>
            {/* Sanskrit Grantha script simulation lines */}
            <div className="w-full h-1 bg-amber-400/20 rounded mt-1.5"></div>
            <div className="w-3/4 h-1 bg-amber-400/20 rounded mt-1"></div>
            
            {/* Visual Anomaly Marker if Anomaly detected */}
            {isAnomaly && (
              <div className="absolute right-6 top-3 w-7 h-7 rounded border-2 border-rose-500 bg-rose-500/30 animate-pulse flex items-center justify-center">
                <AlertTriangle className="w-3.5 h-3.5 text-rose-300" />
              </div>
            )}
          </div>

          {/* Camera Frame HUD Elements */}
          <div className="absolute top-2 left-2 flex items-center gap-1.5 px-2 py-0.5 rounded bg-black/60 backdrop-blur-sm text-[10px] font-mono text-emerald-400 border border-emerald-500/20">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping"></span>
            <span>CAM_ENCLOSURE_01: ACTIVE</span>
          </div>

          <div className="absolute bottom-2 right-2 px-2 py-0.5 rounded bg-black/60 backdrop-blur-sm text-[10px] font-mono text-slate-400 border border-slate-800">
            1920x1080 • MACRO 100mm
          </div>
        </div>

        {/* Diagnostic Metadata & Status */}
        <div className="md:col-span-6 flex flex-col justify-between space-y-3">
          
          {/* Status & Visual Risk Badge */}
          <div className="grid grid-cols-2 gap-2 text-xs">
            <div className="p-2.5 rounded-lg bg-slate-800/40 border border-slate-800">
              <span className="text-[10px] text-slate-400 uppercase font-semibold block">Condition</span>
              <div className="flex items-center gap-1.5 mt-1 font-bold">
                {isAnomaly ? (
                  <>
                    <AlertTriangle className="w-3.5 h-3.5 text-rose-400" />
                    <span className="text-rose-400">ANOMALY DETECTED</span>
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                    <span className="text-emerald-400">SURFACE NORMAL</span>
                  </>
                )}
              </div>
            </div>

            <div className="p-2.5 rounded-lg bg-slate-800/40 border border-slate-800">
              <span className="text-[10px] text-slate-400 uppercase font-semibold block">Visual Risk Index</span>
              <div className="flex items-baseline gap-1 mt-1 font-mono">
                <span className={`text-lg font-bold ${visual_risk > 50 ? 'text-rose-400' : 'text-slate-200'}`}>
                  {visual_risk}
                </span>
                <span className="text-xs text-slate-500">/ 100</span>
              </div>
            </div>
          </div>

          {/* Observation Note */}
          <div className="p-3 rounded-lg bg-slate-800/50 border border-slate-700/60 text-xs text-slate-200">
            <div className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider mb-1">
              Visual AI Observation
            </div>
            <p className="leading-relaxed">
              {reason}
            </p>
          </div>

          {/* Timestamp footer */}
          <div className="text-[11px] text-slate-400 font-mono flex items-center justify-between">
            <span>Last Frame Scan:</span>
            <span className="text-slate-300">
              {last_checked ? new Date(last_checked).toLocaleTimeString() : 'Awaiting snapshot'}
            </span>
          </div>

        </div>

      </div>
    </div>
  );
}
