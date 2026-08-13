import React from 'react';
import { Sun, CloudRain, Droplets, Zap, ShieldCheck } from 'lucide-react';

export default function ConditionCard({ condition: propCond, confidence: propConf, analysis, isLoading }) {
  if (isLoading) {
    return (
      <div className="telemetry-card corner-bracket rounded-2xl p-5 border border-slate-800 animate-pulse flex flex-col justify-between h-full min-h-[320px]">
        <div className="h-4 bg-slate-800 rounded w-1/3 mb-4"></div>
        <div className="h-12 bg-slate-800 rounded w-2/3 my-4"></div>
        <div className="h-4 bg-slate-800 rounded w-1/2"></div>
        <div className="mt-8 space-y-3">
          <div className="h-3 bg-slate-800 rounded w-full"></div>
          <div className="h-3 bg-slate-800 rounded w-5/6"></div>
        </div>
      </div>
    );
  }

  const rawCond = analysis?.condition || propCond;
  const confidence = analysis?.confidence ?? propConf;
  const dryProb = analysis?.dry_probability ?? 0;
  const dampProb = analysis?.damp_probability ?? 0;
  const wetProb = analysis?.wet_probability ?? 0;

  const cond = rawCond ? String(rawCond).toUpperCase() : 'NO DATA';

  let config = {
    color: 'text-slate-400',
    bg: 'bg-slate-900/60',
    border: 'border-slate-800',
    glow: '',
    icon: <Zap className="w-12 h-12 text-slate-500" />,
    description: 'Awaiting image analysis input...'
  };

  if (cond === 'DRY') {
    config = {
      color: 'text-amber-400',
      bg: 'bg-amber-500/10',
      border: 'border-amber-500/30',
      glow: 'shadow-[0_0_30px_rgba(245,158,11,0.2)]',
      icon: <Sun className="w-12 h-12 text-amber-400 animate-[spin_10s_linear_infinite]" />,
      description: 'Optimal dry grip conditions on racing surface.'
    };
  } else if (cond === 'DAMP') {
    config = {
      color: 'text-sky-400',
      bg: 'bg-sky-500/10',
      border: 'border-sky-500/30',
      glow: 'shadow-[0_0_30px_rgba(56,189,248,0.2)]',
      icon: <CloudRain className="w-12 h-12 text-sky-400" />,
      description: 'Surface moisture detected. Transition zone.'
    };
  } else if (cond === 'WET') {
    config = {
      color: 'text-cyan-400',
      bg: 'bg-cyan-500/10',
      border: 'border-cyan-500/30',
      glow: 'shadow-[0_0_30px_rgba(6,182,212,0.25)]',
      icon: <Droplets className="w-12 h-12 text-cyan-400 animate-bounce" />,
      description: 'Heavy moisture / standing water. High aquaplaning risk.'
    };
  } else if (cond === 'DRYING') {
    config = {
      color: 'text-amber-300',
      bg: 'bg-amber-400/10',
      border: 'border-amber-400/30',
      glow: 'shadow-[0_0_30px_rgba(251,191,36,0.2)]',
      icon: <Sun className="w-12 h-12 text-amber-300" />,
      description: 'Track line drying rapidly across racing apex.'
    };
  }

  // Filter out the primary condition to display secondary probabilities
  const secondaries = [
    { label: 'DRY', val: dryProb, color: 'text-amber-400' },
    { label: 'DAMP', val: dampProb, color: 'text-sky-400' },
    { label: 'WET', val: wetProb, color: 'text-cyan-400' }
  ].filter(s => s.label !== cond.replace('DRYING', 'DAMP') && s.label !== cond); 
  // Just a simple filter. Usually cond is WET/DAMP/DRY. If DRYING, we might still show them. Let's just sort them.

  const sortedProbs = [
    { label: 'DRY', val: dryProb, color: 'text-amber-400' },
    { label: 'DAMP', val: dampProb, color: 'text-sky-400' },
    { label: 'WET', val: wetProb, color: 'text-cyan-400' }
  ].sort((a, b) => b.val - a.val).filter(s => s.label !== cond && s.label !== 'DRYING');

  return (
    <div className={`telemetry-card corner-bracket rounded-2xl p-6 border ${config.border} ${config.bg} ${config.glow} flex flex-col justify-between relative overflow-hidden transition-all duration-500 h-full min-h-[320px]`}>
      
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
      <div className="my-6 flex items-center justify-between gap-4">
        <div>
          <h3 className={`text-5xl sm:text-6xl font-black tracking-tight font-mono uppercase ${config.color} leading-none mb-2`}>
            {cond}
          </h3>
          <div className="flex items-center gap-3">
            <span className={`text-2xl font-black font-mono ${confidence > 75 ? 'text-emerald-400' : 'text-amber-400'}`}>
              {confidence != null ? `${Number(confidence).toFixed(1)}%` : '--'}
            </span>
            {confidence > 80 && (
              <span className="flex items-center gap-1 text-[10px] font-mono font-bold uppercase tracking-widest text-emerald-400 bg-emerald-500/10 px-2 py-1 rounded border border-emerald-500/20">
                <ShieldCheck className="w-3 h-3" />
                HIGH CONFIDENCE
              </span>
            )}
          </div>
        </div>

        <div className="p-4 rounded-3xl bg-slate-950/80 border border-slate-800 shrink-0 shadow-inner">
          {config.icon}
        </div>
      </div>

      {/* Secondary Probabilities */}
      {cond !== 'NO DATA' && (
        <div className="mt-4 pt-4 border-t border-slate-800/60 space-y-3">
          <span className="text-[10px] font-mono text-slate-500 uppercase tracking-widest block">
            SECONDARY PROBABILITY MATRIX
          </span>
          <div className="grid grid-cols-2 gap-4">
            {sortedProbs.map(prob => (
              <div key={prob.label} className="bg-slate-900/50 p-2.5 rounded-lg border border-slate-800/80 flex items-center justify-between">
                <span className={`text-xs font-mono font-bold uppercase ${prob.color}`}>{prob.label}</span>
                <span className="text-sm font-mono text-slate-300 font-bold">{prob.val?.toFixed(1)}%</span>
              </div>
            ))}
          </div>
        </div>
      )}

    </div>
  );
}
