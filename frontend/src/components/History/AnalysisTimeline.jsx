import React, { useRef } from 'react';
import { useScrollAnimation } from '../../hooks/useScrollAnimation';
import { History, FileText, Clock, ChevronRight } from 'lucide-react';

export default function AnalysisTimeline({ history = [], isLoading, onSelectRecord }) {
  const containerRef = useRef();
  useScrollAnimation(containerRef, 'fadeUp');

  const formatDate = (isoString) => {
    if (!isoString) return '--';
    try {
      const date = new Date(isoString);
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
    } catch {
      return isoString;
    }
  };

  const getConditionColor = (cond) => {
    const c = (cond || '').toLowerCase();
    if (c === 'dry') return 'text-amber-400 border-amber-500/40 bg-amber-500/10 shadow-[0_0_10px_rgba(245,158,11,0.2)]';
    if (c === 'damp') return 'text-sky-400 border-sky-500/40 bg-sky-500/10 shadow-[0_0_10px_rgba(56,189,248,0.2)]';
    if (c === 'wet') return 'text-cyan-400 border-cyan-500/40 bg-cyan-500/10 shadow-[0_0_10px_rgba(6,182,212,0.2)]';
    if (c === 'drying') return 'text-amber-300 border-amber-400/40 bg-amber-400/10 shadow-[0_0_10px_rgba(251,191,36,0.2)]';
    return 'text-slate-400 border-slate-700 bg-slate-800';
  };

  return (
    <section ref={containerRef} className="w-full my-10">
      
      <div className="telemetry-card corner-bracket rounded-3xl p-6 sm:p-8 border border-slate-800">
        
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-4 mb-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 flex items-center justify-center">
              <History className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[10px] font-mono font-bold text-cyan-400 uppercase tracking-widest block">
                SECTION 06 :: TELEMETRY LOG
              </span>
              <h3 className="text-xl sm:text-2xl font-black font-mono text-white uppercase tracking-tight">
                ANALYSIS HISTORY TIMELINE
              </h3>
            </div>
          </div>

          <span className="text-xs font-mono text-slate-400 bg-slate-900 px-3 py-1.5 rounded-lg border border-slate-800">
            RECORD COUNT: {history.length}
          </span>
        </div>

        {/* Horizontal Timeline Scroll Container */}
        <div className="relative py-6 overflow-x-auto scrollbar-thin">
          
          {/* Background Connecting Timeline Track Line */}
          <div className="absolute top-1/2 left-0 right-0 h-0.5 bg-slate-800 -translate-y-1/2 z-0" />

          <div className="flex items-center gap-8 relative z-10 min-w-max px-4">
            {isLoading && history.length === 0 ? (
              <div className="w-full py-8 text-center text-slate-500 font-mono text-xs flex items-center justify-center gap-2">
                <Clock className="w-4 h-4 animate-spin text-cyan-400" />
                <span>Loading telemetry history timeline...</span>
              </div>
            ) : history.length === 0 ? (
              <div className="w-full py-8 text-center text-slate-500 font-mono text-xs">
                No telemetry records logged yet. Upload a track image above to record inference history.
              </div>
            ) : (
              history.map((item, idx) => (
                <div
                  key={item.id}
                  onClick={() => onSelectRecord && onSelectRecord(item)}
                  className="flex flex-col items-center group cursor-pointer transition transform hover:-translate-y-1.5"
                >
                  {/* Time Badge */}
                  <span className="text-[10px] font-mono text-slate-400 mb-2 group-hover:text-cyan-400">
                    {formatDate(item.timestamp)}
                  </span>

                  {/* Point Marker Sphere */}
                  <div className={`w-10 h-10 rounded-full border-2 flex items-center justify-center text-xs font-mono font-black ${getConditionColor(item.condition)} bg-slate-950`}>
                    #{item.id}
                  </div>

                  {/* Details Card */}
                  <div className="mt-3 p-3 rounded-xl bg-slate-900/90 border border-slate-800 text-center min-w-[130px] group-hover:border-cyan-500/50 transition">
                    <span className="text-xs font-mono font-bold text-white uppercase block">
                      {item.condition}
                    </span>
                    <span className="text-[10px] font-mono text-cyan-400 block mt-0.5">
                      {item.confidence != null ? `${item.confidence.toFixed(1)}%` : '--'}
                    </span>
                    <span className="text-[9px] font-mono text-slate-500 truncate max-w-[110px] block mt-1">
                      {item.filename}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>

        </div>

      </div>

    </section>
  );
}
