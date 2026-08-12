import React from 'react';
import { Compass, AlertOctagon, ShieldCheck, Flame, Info } from 'lucide-react';

export default function StrategyCard({ strategy, isLoading }) {
  if (isLoading) {
    return (
      <div className="telemetry-card corner-bracket rounded-2xl p-5 border border-slate-800 animate-pulse flex flex-col justify-between h-full">
        <div className="h-4 bg-slate-800 rounded w-1/3 mb-4"></div>
        <div className="h-8 bg-slate-800 rounded w-1/2 my-4"></div>
        <div className="h-12 bg-slate-800 rounded w-full"></div>
      </div>
    );
  }

  const {
    current_condition = 'dry',
    trend = 'stable',
    current_tire = 'slick',
    recommendation = 'Recommend dry-weather tire strategy',
    urgency = 'low',
    reason = 'Awaiting track condition analysis.'
  } = strategy || {};

  const urgencyUpper = (urgency || 'low').toUpperCase();

  let urgencyBadge = {
    color: 'text-emerald-400',
    bg: 'bg-emerald-500/10',
    border: 'border-emerald-500/30',
    glow: '',
    icon: <ShieldCheck className="w-4 h-4 text-emerald-400" />
  };

  if (urgencyUpper === 'HIGH') {
    urgencyBadge = {
      color: 'text-rose-400',
      bg: 'bg-rose-500/15',
      border: 'border-rose-500/40',
      glow: 'shadow-[0_0_15px_rgba(244,63,94,0.3)]',
      icon: <AlertOctagon className="w-4 h-4 text-rose-400 animate-pulse" />
    };
  } else if (urgencyUpper === 'MEDIUM') {
    urgencyBadge = {
      color: 'text-amber-400',
      bg: 'bg-amber-500/15',
      border: 'border-amber-500/40',
      glow: 'shadow-[0_0_15px_rgba(245,158,11,0.3)]',
      icon: <Flame className="w-4 h-4 text-amber-400" />
    };
  }

  return (
    <div className="telemetry-card corner-bracket rounded-2xl p-5 border border-cyan-500/30 bg-gradient-to-b from-slate-900/90 to-slate-950 flex flex-col justify-between relative overflow-hidden shadow-[0_0_30px_rgba(6,182,212,0.08)]">
      
      {/* Card Header */}
      <div className="flex items-center justify-between border-b border-slate-800 pb-3 mb-4">
        <div className="flex items-center gap-2">
          <Compass className="w-4 h-4 text-cyan-400" />
          <h3 className="text-xs font-mono font-bold tracking-wider uppercase text-slate-200">
            Tire Strategy Recommendation Engine
          </h3>
        </div>

        {/* Urgency Badge */}
        <div className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md border ${urgencyBadge.border} ${urgencyBadge.bg} ${urgencyBadge.glow} text-xs font-mono font-bold`}>
          {urgencyBadge.icon}
          <span className={urgencyBadge.color}>PIT URGENCY: {urgencyUpper}</span>
        </div>
      </div>

      {/* Main Tire Recommendation */}
      <div className="my-2 p-4 rounded-xl bg-slate-900/90 border border-slate-800 flex items-center justify-between gap-4">
        <div>
          <span className="text-[10px] font-mono text-cyan-400 uppercase tracking-widest block mb-1">
            RECOMMENDED STRATEGY
          </span>
          <h4 className="text-xl sm:text-2xl font-black font-mono text-white tracking-tight uppercase">
            {recommendation}
          </h4>
        </div>

        <div className="px-3 py-2 rounded-lg bg-slate-950 border border-cyan-500/40 text-cyan-300 font-mono text-xs font-bold text-center shrink-0">
          <span className="block text-[9px] text-slate-500 uppercase">TIRE / STATE</span>
          {current_tire.toUpperCase()} / {current_condition} ({trend})
        </div>
      </div>

      {/* Strategy Explanation Reason */}
      <div className="my-3 p-3 rounded-lg bg-slate-950/60 border border-slate-800 text-xs text-slate-300 font-sans leading-relaxed">
        <span className="font-bold text-cyan-400 font-mono uppercase block mb-0.5">
          STRATEGIC RATIONALE:
        </span>
        {reason}
      </div>

      {/* Decision-Support Prototype Disclaimer */}
      <div className="mt-3 pt-3 border-t border-slate-800/80 flex items-start gap-2 text-[10px] text-slate-400 font-mono">
        <Info className="w-3.5 h-3.5 text-amber-400 shrink-0 mt-0.5" />
        <span>
          Prototype decision-support telemetry. Final pit strategy &amp; tire choice require chief race engineer review.
        </span>
      </div>

    </div>
  );
}
