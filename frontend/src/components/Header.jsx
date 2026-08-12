import React, { useState, useEffect } from 'react';
import SystemStatus from './SystemStatus';
import { Gauge, Radio, ShieldAlert } from 'lucide-react';

export default function Header({ onStatusChange }) {
  const [utcTime, setUtcTime] = useState('');

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setUtcTime(now.toISOString().substring(11, 19) + ' UTC');
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <header className="telemetry-card relative z-20 rounded-2xl mb-6 p-4 sm:p-5 border-b border-cyan-500/20">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        
        {/* Left Branding Group */}
        <div className="flex items-center gap-4">
          <div className="relative flex items-center justify-center w-12 h-12 rounded-xl bg-slate-900 border border-cyan-500/30 text-cyan-400 shadow-[0_0_15px_rgba(6,182,212,0.25)]">
            <Gauge className="w-7 h-7 stroke-[1.75]" />
            <span className="absolute -top-1 -right-1 w-3 h-3 bg-cyan-400 rounded-full animate-pulse shadow-[0_0_8px_#22d3ee]"></span>
          </div>

          <div>
            <div className="flex items-center gap-2.5 flex-wrap">
              <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white uppercase italic">
                AquaRace <span className="text-cyan-400 font-extrabold not-italic">AI</span>
              </h1>
              <span className="text-[10px] font-mono font-bold tracking-wider px-2.5 py-0.5 rounded-md bg-cyan-500/10 text-cyan-300 border border-cyan-500/30 uppercase">
                Track Intelligence System
              </span>
            </div>
            <p className="text-xs sm:text-sm text-slate-400 font-medium mt-0.5">
              AI-Powered Track Condition &amp; Tire Strategy Assistant
            </p>
          </div>
        </div>

        {/* Right Telemetry Bar */}
        <div className="flex items-center gap-4 sm:gap-6 self-end md:self-auto">
          <div className="hidden lg:flex items-center gap-2 text-xs font-mono text-slate-400 bg-slate-900/60 px-3 py-1.5 rounded-lg border border-slate-800">
            <Radio className="w-3.5 h-3.5 text-amber-400 animate-pulse" />
            <span>TELEMETRY CH: 04</span>
            <span className="text-slate-600">|</span>
            <span className="text-cyan-400 font-bold">{utcTime}</span>
          </div>

          <SystemStatus onStatusChange={onStatusChange} />
        </div>

      </div>
    </header>
  );
}
