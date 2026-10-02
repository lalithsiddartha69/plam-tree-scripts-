import React, { useState } from 'react';
import { Sparkles, Play, FastForward, CheckCircle2, AlertTriangle, AlertOctagon, RotateCcw, Sliders } from 'lucide-react';
import { DEMO_SCENARIOS } from '../services/mockData';

export default function DemoControls({ 
  onApplyScenario, 
  onRunStory, 
  isStoryRunning = false, 
  storyStep = 0,
  activeScenarioId = 'safe',
  onCustomTelemetrySubmit 
}) {
  const [showCustom, setShowCustom] = useState(false);
  const [customForm, setCustomForm] = useState({
    temperature: 24.5,
    humidity: 52.0,
    light: 80.0,
    uv: 0.12,
    pm25: 10.0,
  });

  const handleCustomSubmit = (e) => {
    e.preventDefault();
    if (onCustomTelemetrySubmit) {
      onCustomTelemetrySubmit({
        timestamp: new Date().toISOString(),
        temperature: parseFloat(customForm.temperature),
        humidity: parseFloat(customForm.humidity),
        light: parseFloat(customForm.light),
        uv: parseFloat(customForm.uv),
        pm25: parseFloat(customForm.pm25),
        is_demo: true,
        source: 'MANUAL_TESTER',
      });
    }
  };

  const storySteps = [
    { label: '1. Baseline Safe', desc: 'Optimal climate (22°C, 51% RH) → SAFE' },
    { label: '2. Humidity Spike', desc: 'RH rises to 68.4% → WARNING' },
    { label: '3. Sustained Exposure', desc: 'RH remains elevated >3 hrs → CRITICAL' },
    { label: '4. Alert Deduplication', desc: 'Deduplicated emergency alert logged' },
  ];

  return (
    <div className="bg-slate-900/90 border border-amber-500/30 rounded-xl p-4 sm:p-5 shadow-lg shadow-amber-950/10">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-800">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-amber-500/10 text-amber-400">
            <Sparkles className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-bold text-amber-300 uppercase tracking-wider font-mono">
                HACKATHON DEMO SIMULATOR
              </h3>
              <span className="text-[10px] font-bold px-1.5 py-0.2 rounded bg-amber-500/20 text-amber-300 border border-amber-500/40">
                ACTIVE
              </span>
            </div>
            <p className="text-xs text-slate-400">
              Interactive scenario injector for presentation and judge evaluation
            </p>
          </div>
        </div>

        {/* 4-Step Story Automated Trigger */}
        <button
          onClick={onRunStory}
          disabled={isStoryRunning}
          className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-bold transition shadow-sm ${
            isStoryRunning
              ? 'bg-amber-500 text-slate-950 animate-pulse'
              : 'bg-emerald-600 hover:bg-emerald-500 text-white'
          }`}
        >
          <Play className="w-3.5 h-3.5 fill-current" />
          <span>{isStoryRunning ? `Running Story (Step ${storyStep}/4)...` : 'Run 4-Step Hackathon Demo Story'}</span>
        </button>
      </div>

      {/* Story Progress Bar if running */}
      {isStoryRunning && (
        <div className="mt-3 p-3 bg-slate-950 rounded-lg border border-amber-500/30">
          <div className="flex items-center justify-between text-xs text-amber-300 mb-2 font-mono">
            <span>DEMO PRESENTATION SEQUENCE</span>
            <span>Step {storyStep} of 4</span>
          </div>
          <div className="grid grid-cols-4 gap-2">
            {storySteps.map((s, idx) => (
              <div 
                key={idx}
                className={`p-2 rounded text-[11px] border transition ${
                  storyStep === idx + 1
                    ? 'bg-amber-500/20 border-amber-400 text-amber-200 font-semibold'
                    : storyStep > idx + 1
                      ? 'bg-emerald-950/30 border-emerald-500/40 text-emerald-400'
                      : 'bg-slate-900 border-slate-800 text-slate-500'
                }`}
              >
                <div className="truncate font-mono">{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Preset Scenario Buttons */}
      <div className="mt-4">
        <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2 flex items-center justify-between">
          <span>Preset Environmental Scenarios</span>
          <button
            onClick={() => setShowCustom(!showCustom)}
            className="text-xs text-slate-400 hover:text-white flex items-center gap-1 font-mono"
          >
            <Sliders className="w-3.5 h-3.5" />
            <span>{showCustom ? 'Hide Manual Inputs' : 'Manual Sliders'}</span>
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-2.5">
          {Object.values(DEMO_SCENARIOS).map((scenario) => {
            const isSelected = activeScenarioId === scenario.id;
            const level = scenario.risk.risk_level;
            return (
              <button
                key={scenario.id}
                onClick={() => onApplyScenario(scenario.id)}
                className={`p-3 rounded-lg border text-left transition flex flex-col justify-between ${
                  isSelected
                    ? 'bg-slate-800 border-amber-500 shadow-md ring-1 ring-amber-500/40'
                    : 'bg-slate-800/40 border-slate-800 hover:bg-slate-800 hover:border-slate-700'
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className={`text-[10px] font-black px-2 py-0.5 rounded-full ${
                    level === 'SAFE' 
                      ? 'bg-emerald-500/20 text-emerald-300' 
                      : level === 'WARNING' 
                        ? 'bg-amber-500/20 text-amber-300' 
                        : 'bg-rose-500/20 text-rose-300'
                  }`}>
                    {level}
                  </span>
                  <span className="text-xs font-mono font-bold text-slate-300">
                    Risk {Math.round(scenario.risk.risk_score)}
                  </span>
                </div>
                <div className="text-xs font-bold text-white mt-1">{scenario.name}</div>
                <div className="text-[11px] text-slate-400 line-clamp-2 mt-1">
                  {scenario.description}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Optional Manual Sliders for Custom Telemetry */}
      {showCustom && (
        <form onSubmit={handleCustomSubmit} className="mt-4 p-4 rounded-lg bg-slate-950 border border-slate-800">
          <div className="text-xs font-bold text-slate-200 mb-3">Custom Telemetry Testing</div>
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 text-xs">
            <div>
              <label className="text-slate-400 block mb-1">Temp (°C)</label>
              <input
                type="number"
                step="0.1"
                value={customForm.temperature}
                onChange={(e) => setCustomForm({ ...customForm, temperature: e.target.value })}
                className="w-full bg-slate-900 border border-slate-700 rounded px-2.5 py-1 text-white font-mono"
              />
            </div>
            <div>
              <label className="text-slate-400 block mb-1">Humidity (%)</label>
              <input
                type="number"
                step="0.1"
                value={customForm.humidity}
                onChange={(e) => setCustomForm({ ...customForm, humidity: e.target.value })}
                className="w-full bg-slate-900 border border-slate-700 rounded px-2.5 py-1 text-white font-mono"
              />
            </div>
            <div>
              <label className="text-slate-400 block mb-1">Light (lx)</label>
              <input
                type="number"
                step="1"
                value={customForm.light}
                onChange={(e) => setCustomForm({ ...customForm, light: e.target.value })}
                className="w-full bg-slate-900 border border-slate-700 rounded px-2.5 py-1 text-white font-mono"
              />
            </div>
            <div>
              <label className="text-slate-400 block mb-1">UV (mW/cm²)</label>
              <input
                type="number"
                step="0.01"
                value={customForm.uv}
                onChange={(e) => setCustomForm({ ...customForm, uv: e.target.value })}
                className="w-full bg-slate-900 border border-slate-700 rounded px-2.5 py-1 text-white font-mono"
              />
            </div>
            <div>
              <label className="text-slate-400 block mb-1">PM2.5 (µg/m³)</label>
              <input
                type="number"
                step="0.5"
                value={customForm.pm25}
                onChange={(e) => setCustomForm({ ...customForm, pm25: e.target.value })}
                className="w-full bg-slate-900 border border-slate-700 rounded px-2.5 py-1 text-white font-mono"
              />
            </div>
          </div>
          <div className="flex justify-end mt-3">
            <button
              type="submit"
              className="px-4 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold"
            >
              Inject Values
            </button>
          </div>
        </form>
      )}

    </div>
  );
}
