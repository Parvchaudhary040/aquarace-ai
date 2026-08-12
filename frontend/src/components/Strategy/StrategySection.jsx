import React, { useRef } from 'react';
import { useScrollAnimation } from '../../hooks/useScrollAnimation';
import { Compass, AlertOctagon, ShieldCheck, Flame, Info, RotateCw } from 'lucide-react';

export default function StrategySection({ strategyData, isLoading }) {
  const sectionRef = useRef();
  useScrollAnimation(sectionRef, 'scaleUp');

  const {
    current_condition = 'dry',
    trend = 'stable',
    current_tire = 'slick',
    recommendation = 'Recommend dry-weather tire strategy',
    urgency = 'low',
    reason = 'Awaiting track condition analysis.'
  } = strategyData || {};

  const urgencyUpper = (urgency || 'low').toUpperCase();

  // Radial Urgency Gauge Properties
  let gaugeColor = '#06b6d4'; // Cyan for Low
  let urgencyText = 'LOW';
  let percentage = 33;
  let bgClass = 'from-cyan-500/10 to-slate-950 border-cyan-500/30';

  if (urgencyUpper === 'HIGH') {
    gaugeColor = '#ef4444'; // Crimson
    urgencyText = 'HIGH';
    percentage = 100;
    bgClass = 'from-rose-500/15 via-slate-900/90 to-slate-950 border-rose-500/40 shadow-[0_0_35px_rgba(239,68,68,0.2)]';
  } else if (urgencyUpper === 'MEDIUM') {
    gaugeColor = '#f59e0b'; // Amber
    urgencyText = 'MEDIUM';
    percentage = 66;
    bgClass = 'from-amber-500/15 via-slate-900/90 to-slate-950 border-amber-500/40 shadow-[0_0_35px_rgba(245,158,11,0.2)]';
  }

  // SVG Radial Gauge Math
  const strokeWidth = 8;
  const radius = 42;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (percentage / 100) * circumference;

  return (
    <section ref={sectionRef} className="w-full my-10">
      
      <div className={`telemetry-card corner-bracket rounded-3xl p-6 sm:p-8 border bg-gradient-to-b ${bgClass} transition-all duration-700 relative overflow-hidden`}>
        
        {/* Top Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-5 mb-8">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-cyan-500/10 border border-cyan-500/40 text-cyan-400 flex items-center justify-center shadow-[0_0_20px_rgba(6,182,212,0.25)]">
              <Compass className="w-7 h-7" />
            </div>
            <div>
              <span className="text-xs font-mono font-bold text-cyan-400 uppercase tracking-widest block">
                SECTION 05 :: VISUAL CENTERPIECE
              </span>
              <h3 className="text-3xl sm:text-4xl font-black font-mono text-white tracking-tight uppercase">
                TIRE WINDOW &amp; PIT STRATEGY
              </h3>
            </div>
          </div>

          <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-900/90 border border-slate-800 text-xs font-mono text-slate-300 font-bold">
            <RotateCw className="w-4 h-4 text-cyan-400 animate-spin" />
            <span>REAL-TIME ENGINE EVALUATION</span>
          </div>
        </div>

        {/* Center Grid Content */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          
          {/* Left / Main Telemetry Metadata (8 Cols) */}
          <div className="lg:col-span-8 space-y-6">
            
            {/* Top Telemetry Stat Cards */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 font-mono">
              
              <div className="p-3.5 rounded-xl bg-slate-950/80 border border-slate-800">
                <span className="text-[10px] text-slate-400 uppercase block mb-1">CURRENT TIRE</span>
                <span className="text-base font-black text-white uppercase">{current_tire}</span>
              </div>

              <div className="p-3.5 rounded-xl bg-slate-950/80 border border-slate-800">
                <span className="text-[10px] text-slate-400 uppercase block mb-1">TRACK STATE</span>
                <span className="text-base font-black text-cyan-400 uppercase">{current_condition}</span>
              </div>

              <div className="p-3.5 rounded-xl bg-slate-950/80 border border-slate-800">
                <span className="text-[10px] text-slate-400 uppercase block mb-1">TREND</span>
                <span className="text-base font-black text-amber-400 uppercase">{trend}</span>
              </div>

              <div className="p-3.5 rounded-xl bg-slate-950/80 border border-slate-800">
                <span className="text-[10px] text-slate-400 uppercase block mb-1">PIT URGENCY</span>
                <span className={`text-base font-black uppercase ${urgencyUpper === 'HIGH' ? 'text-rose-400' : urgencyUpper === 'MEDIUM' ? 'text-amber-400' : 'text-emerald-400'}`}>
                  {urgencyUpper}
                </span>
              </div>

            </div>

            {/* Recommendation Big Banner */}
            <div className="p-5 rounded-2xl bg-slate-900/90 border border-cyan-500/40 shadow-[0_0_20px_rgba(6,182,212,0.1)]">
              <span className="text-xs font-mono font-bold text-cyan-400 tracking-widest uppercase block mb-1">
                STRATEGIC PIT RECOMMENDATION
              </span>
              <h4 className="text-2xl sm:text-3xl font-black font-mono text-white tracking-tight uppercase leading-tight">
                {recommendation}
              </h4>
            </div>

            {/* Strategy Rationale */}
            <div className="p-4 rounded-xl bg-slate-950/80 border border-slate-800 text-xs text-slate-300 font-sans leading-relaxed">
              <span className="font-bold font-mono text-cyan-400 uppercase block mb-1">
                ENGINEER RATIONALE:
              </span>
              {reason}
            </div>

          </div>

          {/* Right Circular / Radial Urgency Visual (4 Cols) */}
          <div className="lg:col-span-4 flex flex-col items-center justify-center p-6 rounded-2xl bg-slate-950/90 border border-slate-800">
            <div className="relative w-36 h-36 flex items-center justify-center">
              <svg className="w-full h-full transform -rotate-90">
                <circle
                  cx="72"
                  cy="72"
                  r={radius}
                  stroke="#1e293b"
                  strokeWidth={strokeWidth}
                  fill="transparent"
                />
                <circle
                  cx="72"
                  cy="72"
                  r={radius}
                  stroke={gaugeColor}
                  strokeWidth={strokeWidth}
                  fill="transparent"
                  strokeDasharray={circumference}
                  strokeDashoffset={strokeDashoffset}
                  strokeLinecap="round"
                  className="transition-all duration-1000 ease-out"
                />
              </svg>

              <div className="absolute flex flex-col items-center justify-center text-center font-mono">
                <span className="text-[10px] text-slate-400 uppercase">URGENCY</span>
                <span className="text-xl font-black text-white">{urgencyText}</span>
                <span className="text-[9px] text-slate-500">{percentage}% LEVEL</span>
              </div>
            </div>

            <span className="text-[11px] font-mono text-slate-400 uppercase mt-4 text-center">
              DECISION URGENCY METRIC
            </span>
          </div>

        </div>

        {/* Prototype Disclaimer */}
        <div className="mt-6 pt-4 border-t border-slate-800/80 flex items-center gap-2 text-[11px] font-mono text-slate-400">
          <Info className="w-4 h-4 text-amber-400 shrink-0" />
          <span>
            Prototype decision-support telemetry. Final pit strategy &amp; tire choice require chief race engineer oversight.
          </span>
        </div>

      </div>

    </section>
  );
}
