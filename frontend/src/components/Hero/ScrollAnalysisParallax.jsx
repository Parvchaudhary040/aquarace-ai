import React, { useRef } from 'react';
import { useScrollAnimation } from '../../hooks/useScrollAnimation';
import { Droplets, Wind, TrendingDown, Layers } from 'lucide-react';

export default function ScrollAnalysisParallax() {
  const card1Ref = useRef();
  const card2Ref = useRef();
  const card3Ref = useRef();

  useScrollAnimation(card1Ref, 'parallax', { speed: 0.5 });
  useScrollAnimation(card2Ref, 'parallax', { speed: 1.0 });
  useScrollAnimation(card3Ref, 'parallax', { speed: 1.5 });

  return (
    <section className="relative w-full py-20 bg-slate-950/90 border-b border-slate-800/80 overflow-hidden">
      
      <div className="max-w-[1600px] mx-auto px-4 sm:px-6">
        
        <div className="text-center max-w-2xl mx-auto mb-12 space-y-2">
          <span className="text-xs font-mono font-bold tracking-widest text-cyan-400 uppercase">
            REAL-TIME TELEMETRY TRANSITION
          </span>
          <h3 className="text-2xl sm:text-3xl font-black text-white uppercase tracking-tight">
            DYNAMIC TRACK STATE EVOLUTION
          </h3>
        </div>

        {/* Parallax Floating Telemetry Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 relative">
          
          {/* Card 1: WET */}
          <div
            ref={card1Ref}
            className="telemetry-card corner-bracket rounded-2xl p-6 border border-cyan-500/30 bg-slate-900/80 shadow-[0_0_25px_rgba(6,182,212,0.15)] flex flex-col justify-between"
          >
            <div className="flex items-center justify-between border-b border-slate-800 pb-3 mb-4">
              <span className="text-xs font-mono text-slate-400 uppercase font-bold">STAGE 01 :: INGESTION</span>
              <Droplets className="w-5 h-5 text-cyan-400 animate-bounce" />
            </div>

            <div className="space-y-1">
              <span className="text-[11px] font-mono text-slate-400 uppercase block">CURRENT CONDITION</span>
              <h4 className="text-4xl font-black font-mono text-cyan-400 uppercase">WET</h4>
              <span className="text-sm font-mono text-emerald-400 font-bold">91.00% CONFIDENCE</span>
            </div>

            <p className="text-xs text-slate-400 mt-4 border-t border-slate-800/80 pt-3">
              Heavy water film detected on asphalt surface.
            </p>
          </div>

          {/* Card 2: DRYING */}
          <div
            ref={card2Ref}
            className="telemetry-card corner-bracket rounded-2xl p-6 border border-amber-500/30 bg-slate-900/80 shadow-[0_0_25px_rgba(245,158,11,0.15)] flex flex-col justify-between"
          >
            <div className="flex items-center justify-between border-b border-slate-800 pb-3 mb-4">
              <span className="text-xs font-mono text-slate-400 uppercase font-bold">STAGE 02 :: TRANSITION</span>
              <Wind className="w-5 h-5 text-amber-400" />
            </div>

            <div className="space-y-1">
              <span className="text-[11px] font-mono text-slate-400 uppercase block">TRACK STATE</span>
              <h4 className="text-4xl font-black font-mono text-amber-400 uppercase">DRYING</h4>
              <span className="text-sm font-mono text-amber-300 font-bold">TEMPORAL EVALUATION</span>
            </div>

            <p className="text-xs text-slate-400 mt-4 border-t border-slate-800/80 pt-3">
              Racing line moisture clearing rapidly across apex.
            </p>
          </div>

          {/* Card 3: IMPROVING */}
          <div
            ref={card3Ref}
            className="telemetry-card corner-bracket rounded-2xl p-6 border border-emerald-500/30 bg-slate-900/80 shadow-[0_0_25px_rgba(16,185,129,0.15)] flex flex-col justify-between"
          >
            <div className="flex items-center justify-between border-b border-slate-800 pb-3 mb-4">
              <span className="text-xs font-mono text-slate-400 uppercase font-bold">STAGE 03 :: INTEL</span>
              <TrendingDown className="w-5 h-5 text-emerald-400" />
            </div>

            <div className="space-y-1">
              <span className="text-[11px] font-mono text-slate-400 uppercase block">TREND STATE</span>
              <h4 className="text-4xl font-black font-mono text-emerald-400 uppercase">IMPROVING</h4>
              <span className="text-sm font-mono text-emerald-300 font-bold">SLICK TIRE WINDOW NEAR</span>
            </div>

            <p className="text-xs text-slate-400 mt-4 border-t border-slate-800/80 pt-3">
              Sequential observations confirm drying trend.
            </p>
          </div>

        </div>

      </div>

    </section>
  );
}
