import React from 'react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  ReferenceLine
} from 'recharts';
import { TrendingUp, TrendingDown, Minus, Activity } from 'lucide-react';

const SCORE_MAP = {
  Dry: 0,
  Damp: 1,
  Wet: 2
};

export default function TrendChart({ sequence = [], trend = 'stable', message = '', isLoading }) {

  // Prepare chart data from sequence array
  const chartData = sequence.map((cond, idx) => ({
    step: `Sample #${idx + 1}`,
    condition: cond,
    score: SCORE_MAP[cond] != null ? SCORE_MAP[cond] : 0,
  }));

  const trendLower = (trend || 'stable').toLowerCase();

  let trendBadge = {
    label: 'STABLE',
    color: 'text-sky-400',
    bg: 'bg-sky-500/10',
    border: 'border-sky-500/30',
    icon: <Minus className="w-4 h-4 text-sky-400" />
  };

  if (trendLower === 'improving') {
    trendBadge = {
      label: 'IMPROVING (DRYING)',
      color: 'text-emerald-400',
      bg: 'bg-emerald-500/10',
      border: 'border-emerald-500/30',
      icon: <TrendingDown className="w-4 h-4 text-emerald-400" />
    };
  } else if (trendLower === 'deteriorating') {
    trendBadge = {
      label: 'DETERIORATING (WETTING)',
      color: 'text-rose-400',
      bg: 'bg-rose-500/10',
      border: 'border-rose-500/30',
      icon: <TrendingUp className="w-4 h-4 text-rose-400" />
    };
  }

  // Custom tooltip for Recharts
  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="telemetry-card p-2.5 rounded-lg border border-slate-700 bg-slate-900/90 text-xs font-mono">
          <p className="text-slate-400">{data.step}</p>
          <p className="font-bold text-cyan-400">Condition: {data.condition}</p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="telemetry-card corner-bracket rounded-2xl p-5 border border-slate-800 flex flex-col justify-between">
      
      {/* Header & Trend Status */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-3 mb-4">
        <div className="flex items-center gap-2">
          <Activity className="w-4 h-4 text-cyan-400" />
          <h3 className="text-xs font-mono font-bold tracking-wider uppercase text-slate-200">
            Track Moisture Trend Analysis
          </h3>
        </div>

        {/* Trend Badge */}
        <div className={`flex items-center gap-1.5 px-3 py-1 rounded-md border ${trendBadge.border} ${trendBadge.bg} text-xs font-mono font-bold`}>
          {trendBadge.icon}
          <span className={trendBadge.color}>{trendBadge.label}</span>
        </div>
      </div>

      {/* Message Rationale */}
      {message && (
        <p className="text-xs text-slate-400 font-mono mb-3 bg-slate-900/80 p-2.5 rounded-lg border border-slate-800/80">
          <span className="text-cyan-400 font-bold">STATUS:</span> {message}
        </p>
      )}

      {/* Recharts Area Visualization */}
      <div className="h-44 w-full my-2">
        {chartData.length > 0 ? (
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
              <defs>
                <linearGradient id="moistureGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#06b6d4" stopOpacity={0.4} />
                  <stop offset="95%" stopColor="#06b6d4" stopOpacity={0.0} />
                </linearGradient>
              </defs>

              <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
              
              <XAxis
                dataKey="step"
                stroke="#64748b"
                fontSize={10}
                fontFamily="monospace"
                tickLine={false}
              />

              <YAxis
                domain={[0, 2]}
                ticks={[0, 1, 2]}
                tickFormatter={(val) => (val === 0 ? 'Dry' : val === 1 ? 'Damp' : 'Wet')}
                stroke="#64748b"
                fontSize={10}
                fontFamily="monospace"
                tickLine={false}
              />

              <Tooltip content={<CustomTooltip />} />

              <Area
                type="monotone"
                dataKey="score"
                stroke="#06b6d4"
                strokeWidth={2.5}
                fillOpacity={1}
                fill="url(#moistureGradient)"
                dot={{ r: 4, fill: '#06b6d4', stroke: '#0f172a', strokeWidth: 2 }}
                activeDot={{ r: 6, fill: '#38bdf8', stroke: '#06b6d4', strokeWidth: 2 }}
              />
            </AreaChart>
          </ResponsiveContainer>
        ) : (
          <div className="h-full w-full flex items-center justify-center border border-dashed border-slate-800 rounded-xl bg-slate-900/40 text-slate-500 text-xs font-mono">
            No sequence data available yet
          </div>
        )}
      </div>

      {/* Legend / Info */}
      <div className="pt-3 border-t border-slate-800/80 flex items-center justify-between text-[11px] font-mono text-slate-500">
        <span>SEQUENCE STEPS: {sequence.length}</span>
        <span>SEVERITY INDEX: DRY(0) &rarr; WET(2)</span>
      </div>

    </div>
  );
}
