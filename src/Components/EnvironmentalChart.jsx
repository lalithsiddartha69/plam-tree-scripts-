import React, { useState } from 'react';
import { 
  ResponsiveContainer, 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ReferenceLine 
} from 'recharts';
import { BarChart3, Clock, Layers } from 'lucide-react';

export default function EnvironmentalChart({ 
  data = [], 
  selectedRange = '1h', 
  onRangeChange, 
  isLoading = false 
}) {
  const [activeTab, setActiveTab] = useState('climate'); // 'climate' | 'light_uv' | 'pm25' | 'all'

  const ranges = [
    { label: '30 min', value: '30m' },
    { label: '1 hour', value: '1h' },
    { label: '6 hours', value: '6h' },
    { label: '24 hours', value: '24h' },
  ];

  // Formatter for timestamp labels
  const formatTime = (ts) => {
    if (!ts) return '';
    try {
      const d = new Date(ts);
      return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } catch {
      return ts;
    }
  };

  const chartData = data.map((item) => ({
    ...item,
    formattedTime: item.time || formatTime(item.timestamp),
  }));

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-sm">
      {/* Chart Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-800">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-teal-500/10 text-teal-400">
            <BarChart3 className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-white uppercase tracking-wider">
              Environmental Sensor Trends
            </h3>
            <p className="text-xs text-slate-400">
              Micro-climate sensor telemetry across archival time horizons
            </p>
          </div>
        </div>

        {/* Range Controls */}
        <div className="flex items-center gap-1 bg-slate-800/80 p-1 rounded-lg border border-slate-700">
          {ranges.map((r) => (
            <button
              key={r.value}
              onClick={() => onRangeChange && onRangeChange(r.value)}
              className={`px-2.5 py-1 text-xs font-medium rounded-md transition ${
                selectedRange === r.value
                  ? 'bg-emerald-500 text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              {r.label}
            </button>
          ))}
        </div>
      </div>

      {/* Sub-view Category Filter */}
      <div className="flex items-center gap-2 mt-3 mb-4">
        {[
          { id: 'climate', label: 'Temp & Humidity' },
          { id: 'light_uv', label: 'Light & UV' },
          { id: 'pm25', label: 'Airborne PM2.5' },
          { id: 'all', label: 'All Metrics' },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`px-3 py-1 text-xs rounded-lg font-medium transition ${
              activeTab === tab.id
                ? 'bg-slate-800 text-emerald-400 border border-emerald-500/30'
                : 'text-slate-400 hover:text-slate-300'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Empty State */}
      {chartData.length === 0 ? (
        <div className="h-64 flex flex-col items-center justify-center text-center p-6 border border-dashed border-slate-800 rounded-lg">
          <Clock className="w-8 h-8 text-slate-600 mb-2" />
          <h4 className="text-sm font-semibold text-slate-300">No Historical Telemetry Recorded</h4>
          <p className="text-xs text-slate-500 mt-1 max-w-sm">
            Waiting for periodic environmental samples from the ESP32 sensor enclosure.
          </p>
        </div>
      ) : (
        <div className="h-72 w-full mt-2">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
              <XAxis 
                dataKey="formattedTime" 
                stroke="#64748b" 
                fontSize={11} 
                tickLine={false} 
              />
              <YAxis 
                stroke="#64748b" 
                fontSize={11} 
                tickLine={false} 
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#0f172a',
                  borderColor: '#334155',
                  borderRadius: '0.5rem',
                  fontSize: '12px',
                  boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.5)',
                }}
                labelStyle={{ color: '#94a3b8', marginBottom: '4px', fontWeight: 600 }}
              />
              <Legend wrapperStyle={{ fontSize: '12px', paddingTop: '10px' }} />

              {/* Climate Lines */}
              {(activeTab === 'climate' || activeTab === 'all') && (
                <>
                  <Line
                    type="monotone"
                    dataKey="temperature"
                    name="Temperature (°C)"
                    stroke="#38bdf8"
                    strokeWidth={2}
                    dot={false}
                    activeDot={{ r: 4 }}
                  />
                  <Line
                    type="monotone"
                    dataKey="humidity"
                    name="Humidity (%)"
                    stroke="#34d399"
                    strokeWidth={2}
                    dot={false}
                    activeDot={{ r: 4 }}
                  />
                  {/* Reference line for 55% safe max humidity */}
                  <ReferenceLine y={55} stroke="#10b981" strokeDasharray="4 4" label={{ value: 'Safe Hum Max', fill: '#10b981', fontSize: 10 }} />
                </>
              )}

              {/* Light & UV Lines */}
              {(activeTab === 'light_uv' || activeTab === 'all') && (
                <>
                  <Line
                    type="monotone"
                    dataKey="light"
                    name="Light (lx)"
                    stroke="#fbbf24"
                    strokeWidth={2}
                    dot={false}
                    activeDot={{ r: 4 }}
                  />
                  <Line
                    type="monotone"
                    dataKey="uv"
                    name="UV (mW/cm²)"
                    stroke="#c084fc"
                    strokeWidth={2}
                    dot={false}
                    activeDot={{ r: 4 }}
                  />
                </>
              )}

              {/* PM2.5 Line */}
              {(activeTab === 'pm25' || activeTab === 'all') && (
                <Line
                  type="monotone"
                  dataKey="pm25"
                  name="PM2.5 (µg/m³)"
                  stroke="#fb7185"
                  strokeWidth={2}
                  dot={false}
                  activeDot={{ r: 4 }}
                />
              )}
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  );
}
