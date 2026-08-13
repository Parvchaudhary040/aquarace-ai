import { Activity, ArrowDownRight, ArrowUpRight, Gauge, Minus, TrendingDown, TrendingUp } from 'lucide-react';

const CONDITION_META = {
  dry: {
    label: 'Dry',
    moisture: 18,
    detail: 'Low moisture',
    accent: 'emerald',
    hex: '#34d399',
    node: 'border-emerald-400 bg-emerald-400 text-slate-950',
    soft: 'border-emerald-400/25 bg-emerald-400/10 text-emerald-300',
    line: 'from-emerald-400/80 to-emerald-400/20'
  },
  drying: {
    label: 'Drying',
    moisture: 40,
    detail: 'Moisture falling',
    accent: 'sky',
    hex: '#38bdf8',
    node: 'border-sky-400 bg-sky-400 text-slate-950',
    soft: 'border-sky-400/25 bg-sky-400/10 text-sky-300',
    line: 'from-sky-400/80 to-sky-400/20'
  },
  damp: {
    label: 'Damp',
    moisture: 64,
    detail: 'Mixed grip',
    accent: 'amber',
    hex: '#fbbf24',
    node: 'border-amber-400 bg-amber-400 text-slate-950',
    soft: 'border-amber-400/25 bg-amber-400/10 text-amber-300',
    line: 'from-amber-400/80 to-amber-400/20'
  },
  wet: {
    label: 'Wet',
    moisture: 90,
    detail: 'High moisture',
    accent: 'cyan',
    hex: '#22d3ee',
    node: 'border-cyan-400 bg-cyan-400 text-slate-950',
    soft: 'border-cyan-400/25 bg-cyan-400/10 text-cyan-300',
    line: 'from-cyan-400/80 to-cyan-400/20'
  }
};

const DEFAULT_CONDITION = {
  label: 'Unknown',
  moisture: 50,
  detail: 'Awaiting signal',
  accent: 'slate',
  hex: '#94a3b8',
  node: 'border-slate-400 bg-slate-400 text-slate-950',
  soft: 'border-slate-400/25 bg-slate-400/10 text-slate-300',
  line: 'from-slate-400/80 to-slate-400/20'
};

function getConditionMeta(condition) {
  return CONDITION_META[String(condition || '').toLowerCase()] || DEFAULT_CONDITION;
}

function getTrendMeta(trend) {
  const value = String(trend || 'stable').toLowerCase();
  if (value === 'improving') {
    return { label: 'Improving', icon: TrendingUp, iconSmall: ArrowDownRight, className: 'text-emerald-300 border-emerald-400/30 bg-emerald-400/10' };
  }
  if (value === 'deteriorating') {
    return { label: 'Worsening', icon: TrendingDown, iconSmall: ArrowUpRight, className: 'text-rose-300 border-rose-400/30 bg-rose-400/10' };
  }
  return { label: 'Stable', icon: Minus, iconSmall: Minus, className: 'text-sky-300 border-sky-400/30 bg-sky-400/10' };
}

export default function TrendChart({ sequence = [], trend = 'stable', message = '', isLoading }) {
  if (isLoading) {
    return (
      <div className="rounded-2xl border border-slate-800 bg-slate-950/35 p-6 animate-pulse min-h-[300px]">
        <div className="h-4 w-40 rounded bg-slate-800" />
        <div className="mt-8 h-36 rounded-xl bg-slate-800/80" />
        <div className="mt-5 grid grid-cols-3 gap-3">
          <div className="h-16 rounded-xl bg-slate-800/70" />
          <div className="h-16 rounded-xl bg-slate-800/70" />
          <div className="h-16 rounded-xl bg-slate-800/70" />
        </div>
      </div>
    );
  }

  const observations = Array.isArray(sequence) ? sequence : [];
  const latest = getConditionMeta(observations.at(-1));
  const first = getConditionMeta(observations[0]);
  const trendMeta = getTrendMeta(trend);
  const TrendIcon = trendMeta.icon;
  const DeltaIcon = trendMeta.iconSmall;
  const moistureDelta = observations.length > 1 ? latest.moisture - first.moisture : 0;
  const chartWidth = 760;
  const chartHeight = 270;
  const chartPadding = { left: 54, right: 30, top: 24, bottom: 46 };
  const plotWidth = chartWidth - chartPadding.left - chartPadding.right;
  const plotHeight = chartHeight - chartPadding.top - chartPadding.bottom;
  const chartPoints = observations.map((condition, index) => {
    const meta = getConditionMeta(condition);
    const x = chartPadding.left + (observations.length === 1 ? plotWidth / 2 : (index / (observations.length - 1)) * plotWidth);
    const y = chartPadding.top + ((100 - meta.moisture) / 100) * plotHeight;
    return { ...meta, x, y, index };
  });
  const linePoints = chartPoints.map(({ x, y }) => `${x},${y}`).join(' ');
  const areaPoints = `${chartPadding.left},${chartPadding.top + plotHeight} ${linePoints} ${chartPadding.left + plotWidth},${chartPadding.top + plotHeight}`;

  return (
    <div className="relative overflow-hidden rounded-2xl border border-slate-800 bg-slate-950/45 p-4 sm:p-6">
      <div className="pointer-events-none absolute -right-20 -top-24 h-64 w-64 rounded-full bg-cyan-400/10 blur-3xl" />
      <div className="pointer-events-none absolute -left-20 -bottom-32 h-56 w-56 rounded-full bg-emerald-400/5 blur-3xl" />

      <div className="relative flex flex-col gap-4 border-b border-slate-800 pb-5 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-2 text-[11px] font-mono font-bold uppercase tracking-[0.18em] text-cyan-300">
            <Activity className="h-4 w-4" />
            Moisture transition map
          </div>
          <p className="mt-1 text-sm text-slate-400">Sequential observations plotted from saturated to dry track surface.</p>
        </div>
        <div className={`inline-flex w-fit items-center gap-2 rounded-full border px-3 py-2 text-xs font-mono font-bold uppercase tracking-wider ${trendMeta.className}`}>
          <TrendIcon className="h-4 w-4" />
          {trendMeta.label}
        </div>
      </div>

      {observations.length > 0 ? (
        <>
          <div className="relative mt-6 overflow-x-auto rounded-2xl border border-slate-800/90 bg-slate-900/55 p-3 sm:p-5">
            <div className="mb-2 flex min-w-[640px] items-center justify-between px-2 text-[10px] font-mono font-bold uppercase tracking-[0.16em] text-slate-500">
              <span>Observed sequence</span>
              <span className="text-cyan-300">Surface moisture / %</span>
            </div>
            <svg viewBox={`0 0 ${chartWidth} ${chartHeight}`} className="min-w-[640px] w-full" role="img" aria-label="Track moisture by observation">
              <defs>
                <linearGradient id="moisture-area" x1="0" x2="0" y1="0" y2="1">
                  <stop offset="0%" stopColor="#22d3ee" stopOpacity="0.28" />
                  <stop offset="100%" stopColor="#22d3ee" stopOpacity="0" />
                </linearGradient>
              </defs>
              {[0, 25, 50, 75, 100].map((mark) => {
                const y = chartPadding.top + ((100 - mark) / 100) * plotHeight;
                return (
                  <g key={mark}>
                    <line x1={chartPadding.left} x2={chartPadding.left + plotWidth} y1={y} y2={y} stroke="rgba(148,163,184,0.16)" strokeDasharray="4 6" />
                    <text x={chartPadding.left - 12} y={y + 4} textAnchor="end" fill="#64748b" fontSize="10" fontFamily="ui-monospace, SFMono-Regular, monospace">{mark}%</text>
                  </g>
                );
              })}
              <polygon points={areaPoints} fill="url(#moisture-area)" />
              <polyline points={linePoints} fill="none" stroke="#67e8f9" strokeWidth="3" strokeLinejoin="round" strokeLinecap="round" />
              {chartPoints.map((point) => {
                const isLatest = point.index === chartPoints.length - 1;
                return (
                  <g key={`${point.label}-${point.index}`}>
                    {isLatest && <circle cx={point.x} cy={point.y} r="15" fill={point.hex} opacity="0.16" />}
                    <circle cx={point.x} cy={point.y} r={isLatest ? '7' : '5'} fill="#0f172a" stroke={point.hex} strokeWidth={isLatest ? '4' : '3'} />
                    <text x={point.x} y={point.y - 14} textAnchor="middle" fill={point.hex} fontSize="11" fontWeight="700" fontFamily="ui-monospace, SFMono-Regular, monospace">{point.label.toUpperCase()}</text>
                    <text x={point.x} y={chartPadding.top + plotHeight + 24} textAnchor="middle" fill="#94a3b8" fontSize="10" fontFamily="ui-monospace, SFMono-Regular, monospace">OBS {String(point.index + 1).padStart(2, '0')}</text>
                  </g>
                );
              })}
            </svg>
            <div className="mt-1 flex min-w-[640px] items-center justify-between border-t border-slate-800 px-2 pt-3 text-[10px] font-mono uppercase tracking-[0.16em] text-slate-500">
              <span>Dry / 0%</span>
              <span className={`rounded-full border px-2 py-1 font-bold ${latest.soft}`}>Latest: {latest.label} · {latest.moisture}%</span>
              <span>100% / saturated</span>
            </div>
          </div>

          <div className="relative mt-4 grid grid-cols-1 gap-3 sm:grid-cols-3">
            <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-4">
              <span className="text-[10px] font-mono font-bold uppercase tracking-[0.16em] text-slate-500">Observations</span>
              <div className="mt-2 flex items-end justify-between">
                <span className="text-2xl font-mono font-black text-white">{String(observations.length).padStart(2, '0')}</span>
                <Activity className="h-5 w-5 text-cyan-400" />
              </div>
            </div>
            <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-4">
              <span className="text-[10px] font-mono font-bold uppercase tracking-[0.16em] text-slate-500">Current surface</span>
              <div className="mt-2 flex items-end justify-between gap-2">
                <span className="text-xl font-mono font-black uppercase text-white">{latest.label}</span>
                <span className={`rounded-md border px-2 py-1 text-[10px] font-mono font-bold ${latest.soft}`}>{latest.moisture}%</span>
              </div>
            </div>
            <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-4">
              <span className="text-[10px] font-mono font-bold uppercase tracking-[0.16em] text-slate-500">Moisture shift</span>
              <div className="mt-2 flex items-end justify-between">
                <span className="text-2xl font-mono font-black text-white">{moistureDelta > 0 ? '+' : ''}{moistureDelta}%</span>
                <DeltaIcon className={`h-5 w-5 ${trendMeta.className.split(' ')[0]}`} />
              </div>
            </div>
          </div>
        </>
      ) : (
        <div className="relative mt-6 flex min-h-48 flex-col items-center justify-center rounded-2xl border border-dashed border-slate-700 bg-slate-900/40 text-center">
          <Gauge className="h-8 w-8 text-slate-600" />
          <p className="mt-3 text-sm font-mono font-bold uppercase tracking-widest text-slate-500">No transition data available</p>
        </div>
      )}

      {message && (
        <div className="relative mt-4 flex gap-3 rounded-xl border border-cyan-400/15 bg-cyan-400/[0.04] p-4">
          <div className="mt-0.5 rounded-lg bg-cyan-400/10 p-2 text-cyan-300"><Activity className="h-4 w-4" /></div>
          <div>
            <span className="text-[10px] font-mono font-bold uppercase tracking-[0.16em] text-cyan-300">Track readout</span>
            <p className="mt-1 text-sm leading-relaxed text-slate-300">{message}</p>
          </div>
        </div>
      )}
    </div>
  );
}
