import React from 'react';
import { Compass, AlertOctagon, ShieldCheck, Flame, Info, Crosshair, ArrowRight } from 'lucide-react';

export default function StrategyCard({ strategy, isLoading }) {
  if (isLoading) {
    return (
      <div className="telemetry-card corner-bracket rounded-2xl p-6 border border-slate-800 animate-pulse flex flex-col justify-between h-full min-h-[250px]">
        <div className="h-4 bg-slate-800 rounded w-1/3 mb-4"></div>
        <div className="h-8 bg-slate-800 rounded w-1/2 my-4"></div>
        <div className="h-16 bg-slate-800 rounded w-full"></div>
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
    <div className="telemetry-card corner-bracket rounded-2xl p-6 border border-cyan-500/30 bg-gradient-to-b from-slate-900/90 to-slate-950 flex flex-col justify-between relative overflow-hidden shadow-[0_0_30px_rgba(6,182,212,0.08)]">
      
      {/* Card Header */}
      <div className="flex items-center justify-between border-b border-slate-800 pb-4 mb-5">
        <div className="flex items-center gap-2">
          <Compass className="w-5 h-5 text-cyan-400" />
          <h3 className="text-sm font-mono font-bold tracking-wider uppercase text-slate-200">
            Tire Strategy Engine
          </h3>
        </div>

        {/* Urgency Badge */}
        <div className={`flex items-center gap-2 px-3 py-1.5 rounded-md border ${urgencyBadge.border} ${urgencyBadge.bg} ${urgencyBadge.glow} text-xs font-mono font-bold`}>
          {urgencyBadge.icon}
          <span className={urgencyBadge.color}>URGENCY: {urgencyUpper}</span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-5">
        
        {/* Left Col: Recommendation & Reason */}
        <div className="flex flex-col justify-center">
          <span className="text-[10px] font-mono text-cyan-400 uppercase tracking-widest block mb-2">
            RECOMMENDATION
          </span>
          <h4 className="text-2xl sm:text-3xl font-black font-mono text-white tracking-tight uppercase mb-4 leading-tight">
            {recommendation}
          </h4>

          <div className="p-3 rounded-lg bg-slate-950/80 border border-slate-800 text-sm text-slate-300 font-sans leading-relaxed">
            {reason}
          </div>
        </div>

        {/* Right Col: Data Points */}
        <div className="flex flex-col gap-3 justify-center">
          <div className="flex items-center justify-between p-3 rounded-xl bg-slate-900/80 border border-slate-800">
            <span className="text-xs font-mono text-slate-500 uppercase tracking-widest">TIRE WINDOW</span>
            <span className="text-sm font-mono font-bold text-amber-400 uppercase flex items-center gap-2">
              <Crosshair className="w-4 h-4" />
              {current_tire}
            </span>
          </div>

          <div className="flex items-center justify-between p-3 rounded-xl bg-slate-900/80 border border-slate-800">
            <span className="text-xs font-mono text-slate-500 uppercase tracking-widest">CURRENT CONDITION</span>
            <span className="text-sm font-mono font-bold text-slate-200 uppercase">
              {current_condition}
            </span>
          </div>

          <div className="flex items-center justify-between p-3 rounded-xl bg-slate-900/80 border border-slate-800">
            <span className="text-xs font-mono text-slate-500 uppercase tracking-widest">TREND</span>
            <span className="text-sm font-mono font-bold text-sky-400 uppercase flex items-center gap-2">
              {trend} <ArrowRight className="w-4 h-4" />
            </span>
          </div>
        </div>

      </div>

      {/* Decision-Support Prototype Disclaimer */}
      <div className="mt-2 pt-4 border-t border-slate-800/80 flex items-start gap-2 text-[11px] text-slate-400 font-mono bg-slate-950/50 p-3 rounded-lg">
        <Info className="w-4 h-4 text-amber-400 shrink-0" />
        <span>
          Prototype decision-support recommendation. Final pit strategy &amp; tire choice require chief race engineer review.
        </span>
      </div>

    </div>
  );
}
