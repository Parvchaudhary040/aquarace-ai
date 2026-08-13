import React from 'react';
import { TrendingUp, TrendingDown, Minus, Activity, ChevronRight } from 'lucide-react';

export default function TrendChart({ sequence = [], trend = 'stable', message = '', isLoading }) {
  
  if (isLoading) {
    return (
      <div className="telemetry-card corner-bracket rounded-2xl p-5 border border-slate-800 animate-pulse flex flex-col justify-between h-full min-h-[200px]">
        <div className="h-4 bg-slate-800 rounded w-1/3 mb-4"></div>
        <div className="h-8 bg-slate-800 rounded w-full my-4"></div>
        <div className="h-16 bg-slate-800 rounded w-full"></div>
      </div>
    );
  }

  const trendLower = (trend || 'stable').toLowerCase();

  let trendBadge = {
    label: 'STABLE',
    color: 'text-sky-400',
    bg: 'bg-sky-500/10',
    border: 'border-sky-500/30',
    icon: <Minus className="w-6 h-6 text-sky-400" />
  };

  if (trendLower === 'improving') {
    trendBadge = {
      label: '↑ IMPROVING',
      color: 'text-emerald-400',
      bg: 'bg-emerald-500/10',
      border: 'border-emerald-500/30',
      icon: <TrendingUp className="w-6 h-6 text-emerald-400" />
    };
  } else if (trendLower === 'deteriorating') {
    trendBadge = {
      label: '↓ WORSENING',
      color: 'text-rose-400',
      bg: 'bg-rose-500/10',
      border: 'border-rose-500/30',
      icon: <TrendingDown className="w-6 h-6 text-rose-400" />
    };
  }

  const getConditionColor = (cond) => {
    const c = (cond || '').toLowerCase();
    if (c === 'wet') return 'bg-cyan-500/20 text-cyan-400 border-cyan-500/40';
    if (c === 'damp') return 'bg-amber-500/20 text-amber-400 border-amber-500/40';
    if (c === 'drying') return 'bg-sky-500/20 text-sky-300 border-sky-500/40';
    if (c === 'dry') return 'bg-emerald-500/20 text-emerald-400 border-emerald-500/40';
    return 'bg-slate-500/20 text-slate-400 border-slate-500/40';
  };

  return (
    <div className="telemetry-card corner-bracket rounded-2xl p-6 border border-slate-800 flex flex-col justify-between h-full relative overflow-hidden">
      
      {/* Background Glow based on trend */}
      <div className={`absolute top-0 right-0 w-64 h-64 rounded-full blur-3xl opacity-10 pointer-events-none ${trendBadge.color.replace('text', 'bg')}`} />

      {/* Header & Trend Status */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-4 mb-6 relative z-10">
        <div className="flex items-center gap-2">
          <Activity className="w-5 h-5 text-cyan-400" />
          <h3 className="text-sm font-mono font-bold tracking-wider uppercase text-slate-200">
            Condition Transition Flow
          </h3>
        </div>

        {/* Big Trend Badge */}
        <div className={`flex items-center gap-2 px-4 py-2 rounded-lg border ${trendBadge.border} ${trendBadge.bg} text-sm font-mono font-black shadow-lg`}>
          {trendBadge.icon}
          <span className={trendBadge.color}>{trendBadge.label}</span>
        </div>
      </div>

      {/* Flowchart Sequence */}
      <div className="my-4 relative z-10">
        {sequence && sequence.length > 0 ? (
          <div className="flex flex-wrap items-center justify-center gap-3 p-6 rounded-xl bg-slate-900/80 border border-slate-800/80 shadow-inner">
            {sequence.map((cond, i) => (
              <React.Fragment key={i}>
                <div className={`text-lg sm:text-xl font-mono font-black uppercase px-6 py-3 rounded-xl border-2 ${getConditionColor(cond)} shadow-lg transform transition-transform hover:scale-105`}>
                  {cond}
                </div>
                {i < sequence.length - 1 && (
                  <ChevronRight className="w-8 h-8 text-slate-600 shrink-0" strokeWidth={3} />
                )}
              </React.Fragment>
            ))}
          </div>
        ) : (
          <div className="p-8 flex items-center justify-center border border-dashed border-slate-800 rounded-xl bg-slate-900/40 text-slate-500 text-sm font-mono uppercase tracking-widest">
            No sequence data available
          </div>
        )}
      </div>

      {/* Backend Explanation Message */}
      {message && (
        <div className="mt-4 p-4 rounded-xl bg-slate-950/80 border border-slate-800 text-sm text-slate-300 font-sans leading-relaxed relative z-10">
          <span className="font-bold text-cyan-400 font-mono uppercase block mb-1">
            Backend Analysis:
          </span>
          {message}
        </div>
      )}

    </div>
  );
}
