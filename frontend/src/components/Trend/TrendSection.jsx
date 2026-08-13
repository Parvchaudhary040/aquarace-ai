import { useRef } from 'react';
import TrendChart from '../TrendChart';
import { useScrollAnimation } from '../../hooks/useScrollAnimation';
import { Layers } from 'lucide-react';

export default function TrendSection({ trendData, isLoading }) {
  const sectionRef = useRef();
  useScrollAnimation(sectionRef, 'fadeUp');

  return (
    <section ref={sectionRef} className="w-full my-8">
      
      <div className="telemetry-card corner-bracket rounded-2xl p-6 border border-slate-800">
        
        {/* Section Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-4 mb-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 flex items-center justify-center">
              <Layers className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[10px] font-mono font-bold text-cyan-400 uppercase tracking-widest block">
                SECTION 04 :: CONDITION INTELLIGENCE
              </span>
              <h3 className="text-xl sm:text-2xl font-black font-mono text-white uppercase tracking-tight">
                TRACK MOISTURE &amp; TEMPORAL TREND
              </h3>
            </div>
          </div>

          <div className="flex items-center gap-2 text-xs font-mono text-slate-400 bg-slate-900 px-3 py-1.5 rounded-lg border border-slate-800">
            <span>SEQUENCE DRIFT RECOGNITION</span>
          </div>
        </div>

        {/* Recharts Component */}
        <TrendChart
          sequence={trendData?.sequence}
          trend={trendData?.trend}
          message={trendData?.message}
          isLoading={isLoading}
        />

      </div>

    </section>
  );
}
