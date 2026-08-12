import React from 'react';
import { BarChart2, Sun, CloudRain, Droplets } from 'lucide-react';

export default function ConfidenceChart({ dryProb = 0, dampProb = 0, wetProb = 0, isLoading }) {
  const items = [
    {
      label: 'Dry Track',
      key: 'dry',
      val: dryProb,
      color: 'bg-amber-500',
      textColor: 'text-amber-400',
      border: 'border-amber-500/30',
      icon: <Sun className="w-4 h-4 text-amber-400" />
    },
    {
      label: 'Damp Track',
      key: 'damp',
      val: dampProb,
      color: 'bg-sky-500',
      textColor: 'text-sky-400',
      border: 'border-sky-500/30',
      icon: <CloudRain className="w-4 h-4 text-sky-400" />
    },
    {
      label: 'Wet Track',
      key: 'wet',
      val: wetProb,
      color: 'bg-cyan-500',
      textColor: 'text-cyan-400',
      border: 'border-cyan-500/30',
      icon: <Droplets className="w-4 h-4 text-cyan-400" />
    }
  ];

  return (
    <div className="telemetry-card corner-bracket rounded-2xl p-5 border border-slate-800 flex flex-col justify-between">
      
      {/* Title */}
      <div className="flex items-center justify-between border-b border-slate-800 pb-3 mb-4">
        <div className="flex items-center gap-2">
          <BarChart2 className="w-4 h-4 text-cyan-400" />
          <h3 className="text-xs font-mono font-bold tracking-wider uppercase text-slate-200">
            Confidence Distribution
          </h3>
        </div>
        <span className="text-[10px] font-mono text-slate-500">PROBABILITY MATRIX</span>
      </div>

      {/* Horizontal Bar Breakdown */}
      <div className="space-y-4">
        {items.map((item) => (
          <div key={item.key} className="space-y-1.5">
            <div className="flex items-center justify-between text-xs font-mono">
              <div className="flex items-center gap-2">
                {item.icon}
                <span className="text-slate-300 font-semibold">{item.label}</span>
              </div>
              <span className={`font-bold ${item.textColor}`}>
                {isLoading ? '--' : `${(item.val || 0).toFixed(2)}%`}
              </span>
            </div>

            {/* Tech Horizontal Progress Bar */}
            <div className="h-3 w-full bg-slate-900 rounded-md p-0.5 border border-slate-800 relative overflow-hidden">
              <div
                className={`h-full rounded-sm ${item.color} transition-all duration-700 ease-out shadow-[0_0_10px_currentColor]`}
                style={{ width: `${Math.min(Math.max(item.val || 0, 0), 100)}%` }}
              ></div>
            </div>
          </div>
        ))}
      </div>

      {/* Footer Info */}
      <div className="mt-4 pt-3 border-t border-slate-800/80 flex items-center justify-between text-[11px] font-mono text-slate-500">
        <span>MODEL: OPENAI CLIP</span>
        <span>ZERO-SHOT SOFTMAX</span>
      </div>

    </div>
  );
}
