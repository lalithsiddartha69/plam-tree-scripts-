import React from 'react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ReferenceLine
} from 'recharts';
import { Activity, ShieldAlert } from 'lucide-react';

export default function RiskHistory({ data = [], selectedRange = '1h' }) {
  // Format data
  const chartData = data.map((item) => ({
    ...item,
    formattedTime: item.time || (item.timestamp ? new Date(item.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ''),
    risk_score: item.risk_score !== undefined ? Number(item.risk_score) : 0,
  }));

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-sm">
      <div className="flex items-center justify-between pb-4 border-b border-slate-800">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-rose-500/10 text-rose-400">
            <Activity className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-white uppercase tracking-wider">
              Preservation Risk History
            </h3>
            <p className="text-xs text-slate-400">
              Evaluated composite risk trajectory (0–100)
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3 text-xs font-mono">
          <span className="flex items-center gap-1.5 text-emerald-400">
            <span className="w-2 h-2 rounded-full bg-emerald-500"></span> Safe (&lt;40)
          </span>
          <span className="flex items-center gap-1.5 text-amber-400">
            <span className="w-2 h-2 rounded-full bg-amber-500"></span> Warn (41–75)
          </span>
          <span className="flex items-center gap-1.5 text-rose-400">
            <span className="w-2 h-2 rounded-full bg-rose-500"></span> Crit (&gt;75)
          </span>
        </div>
      </div>

      {chartData.length === 0 ? (
        <div className="h-60 flex flex-col items-center justify-center text-center p-6 border border-dashed border-slate-800 rounded-lg mt-3">
          <ShieldAlert className="w-8 h-8 text-slate-600 mb-2" />
          <h4 className="text-sm font-semibold text-slate-300">No Risk Predictions Logged</h4>
          <p className="text-xs text-slate-500 mt-1 max-w-sm">
            Risk scores will be plotted chronologically as telemetry is assessed by the AI model.
          </p>
        </div>
      ) : (
        <div className="h-60 w-full mt-3">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="riskGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#f43f5e" stopOpacity={0.6} />
                  <stop offset="50%" stopColor="#f59e0b" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#10b981" stopOpacity={0.05} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
              <XAxis dataKey="formattedTime" stroke="#64748b" fontSize={11} tickLine={false} />
              <YAxis domain={[0, 100]} stroke="#64748b" fontSize={11} tickLine={false} />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#0f172a',
                  borderColor: '#334155',
                  borderRadius: '0.5rem',
                  fontSize: '12px',
                }}
                formatter={(val) => [`${val}/100`, 'Risk Score']}
              />
              <ReferenceLine y={40} stroke="#10b981" strokeDasharray="3 3" />
              <ReferenceLine y={75} stroke="#f43f5e" strokeDasharray="3 3" />
              <Area
                type="monotone"
                dataKey="risk_score"
                stroke="#f59e0b"
                strokeWidth={2.5}
                fillOpacity={1}
                fill="url(#riskGradient)"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  );
}
