import React from 'react';
import { Sun, CloudRain, Droplets, Zap } from 'lucide-react';

export default function ConditionCard({ condition, confidence, isLoading }) {
  if (isLoading) {
    return (
      <div className="telemetry-card corner-bracket rounded-2xl p-5 border border-slate-800 animate-pulse flex flex-col justify-between h-full">
        <div className="h-4 bg-slate-800 rounded w-1/3 mb-4"></div>
        <div className="h-10 bg-slate-800 rounded w-2/3 my-4"></div>
        <div className="h-4 bg-slate-800 rounded w-1/2"></div>
      </div>
    );
  }

  const cond = condition ? condition.toUpperCase() : 'NO DATA';

  let config = {
    color: 'text-slate-400',
    bg: 'bg-slate-900/60',
    border: 'border-slate-800',
    glow: '',
    icon: <Zap className="w-8 h-8 text-slate-500" />,
    description: 'Awaiting image analysis input...'
  };

  if (cond === 'DRY') {
    config = {
      color: 'text-amber-400',
      bg: 'bg-amber-500/10',
      border: 'border-amber-500/30',
      glow: 'shadow-[0_0_25px_rgba(245,158,11,0.25)]',
      icon: <Sun className="w-10 h-10 text-amber-400 animate-[spin_10s_linear_infinite]" />,
      description: 'Optimal dry grip conditions on racing surface.'
    };
  } else if (cond === 'DAMP') {
    config = {
      color: 'text-sky-400',
      bg: 'bg-sky-500/10',
      border: 'border-sky-500/30',
      glow: 'shadow-[0_0_25px_rgba(56,189,248,0.25)]',
      icon: <CloudRain className="w-10 h-10 text-sky-400" />,
      description: 'Surface moisture detected. Transition zone.'
    };
  } else if (cond === 'WET') {
    config = {
      color: 'text-cyan-400',
      bg: 'bg-cyan-500/10',
      border: 'border-cyan-500/30',
      glow: 'shadow-[0_0_25px_rgba(6,182,212,0.3)]',
      icon: <Droplets className="w-10 h-10 text-cyan-400 animate-bounce" />,
      description: 'Heavy moisture / standing water. High aquaplaning risk.'
    };
  }

  return (
    <div className={`telemetry-card corner-bracket rounded-2xl p-5 border ${config.border} ${config.bg} ${config.glow} flex flex-col justify-between relative overflow-hidden transition-all duration-500`}>
      
      {/* Top Bar */}
      <div className="flex items-center justify-between border-b border-slate-800/80 pb-3">
        <span className="text-xs font-mono font-bold tracking-wider uppercase text-slate-400">
          Live Track Condition
        </span>
        <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-900 border border-slate-800 text-slate-400">
          CLIP VIT-BASE-32
        </span>
      </div>

      {/* Main Condition Banner */}
      <div className="my-5 flex items-center justify-between gap-4">
        <div>
          <h3 className={`text-3xl sm:text-4xl font-black tracking-tight font-mono uppercase ${config.color}`}>
            {cond}
          </h3>
          <p className="text-xs text-slate-400 mt-1 font-medium max-w-[220px]">
            {config.description}
          </p>
        </div>

        <div className="p-3 rounded-2xl bg-slate-950/80 border border-slate-800 shrink-0">
          {config.icon}
        </div>
      </div>

      {/* Confidence Footer */}
      <div className="pt-3 border-t border-slate-800/80 flex items-center justify-between text-xs font-mono">
        <span className="text-slate-400 uppercase">AI Confidence Score</span>
        <span className={`font-bold text-sm ${confidence > 75 ? 'text-emerald-400' : 'text-amber-400'}`}>
          {confidence != null ? `${confidence.toFixed(2)}%` : '--'}
        </span>
      </div>

    </div>
  );
}
