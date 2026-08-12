import React, { useRef } from 'react';
import SystemStatus from '../SystemStatus';
import { Gauge, Sparkles, ChevronUp } from 'lucide-react';
import { useScrollAnimation } from '../../hooks/useScrollAnimation';

export default function FooterSection({ onStatusChange, onScrollTop }) {
  const footerRef = useRef();
  useScrollAnimation(footerRef, 'fadeUp');

  return (
    <footer ref={footerRef} className="w-full py-16 bg-slate-950 border-t border-slate-800/80 mt-12 relative overflow-hidden">
      
      <div className="max-w-[1600px] mx-auto px-4 sm:px-6 flex flex-col items-center justify-center text-center space-y-6">
        
        {/* Brand Icon */}
        <div className="w-14 h-14 rounded-2xl bg-slate-900 border border-cyan-500/40 text-cyan-400 flex items-center justify-center shadow-[0_0_25px_rgba(6,182,212,0.3)]">
          <Gauge className="w-8 h-8" />
        </div>

        <div className="space-y-2">
          <h2 className="text-3xl sm:text-4xl font-black font-mono text-white tracking-tight uppercase">
            AQUARACE <span className="text-cyan-400">AI</span>
          </h2>
          <span className="text-xs font-mono font-bold tracking-widest text-cyan-400 uppercase block">
            TRACK INTELLIGENCE SYSTEM
          </span>
        </div>

        <SystemStatus onStatusChange={onStatusChange} />

        <p className="text-sm font-sans text-slate-400 max-w-md italic">
          "Visual intelligence for changing track conditions."
        </p>

        <div className="pt-4">
          <button
            onClick={onScrollTop}
            className="px-6 py-3 rounded-xl bg-slate-900 hover:bg-slate-800 border border-cyan-500/40 hover:border-cyan-400 text-cyan-400 font-mono text-xs font-bold uppercase tracking-wider transition flex items-center gap-2 shadow-[0_0_15px_rgba(6,182,212,0.15)]"
          >
            <span>Analyze New Track</span>
            <ChevronUp className="w-4 h-4" />
          </button>
        </div>

        <div className="pt-8 border-t border-slate-900 text-[10px] font-mono text-slate-400">
          AQUARACE AI TELEMETRY ENGINE &copy; 2026 :: ALL RIGHTS RESERVED
        </div>

      </div>

    </footer>
  );
}
