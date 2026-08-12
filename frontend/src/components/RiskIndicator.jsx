import React from 'react';
import { ShieldAlert, AlertTriangle, CheckCircle2 } from 'lucide-react';

export default function RiskIndicator({ condition = 'Dry', wetProb = 0, urgency = 'Low' }) {
  const cond = (condition || 'Dry').toUpperCase();
  const wetP = wetProb || 0;

  let riskLevel = 'LOW';
  let color = 'text-emerald-400';
  let border = 'border-emerald-500/30';
  let bg = 'bg-emerald-500/10';
  let percent = Math.min(Math.round((wetP / 100) * 100), 100);
  let icon = <CheckCircle2 className="w-5 h-5 text-emerald-400" />;

  if (cond === 'WET' || wetP > 50 || urgency.toUpperCase() === 'HIGH') {
    riskLevel = 'CRITICAL (HIGH AQUAPLANING RISK)';
    color = 'text-rose-400';
    border = 'border-rose-500/40';
    bg = 'bg-rose-500/15';
    icon = <ShieldAlert className="w-5 h-5 text-rose-400 animate-pulse" />;
  } else if (cond === 'DAMP' || wetP > 25 || urgency.toUpperCase() === 'MEDIUM') {
    riskLevel = 'MODERATE (MOISTURE ON RACING LINE)';
    color = 'text-amber-400';
    border = 'border-amber-500/30';
    bg = 'bg-amber-500/10';
    icon = <AlertTriangle className="w-5 h-5 text-amber-400" />;
  }

  return (
    <div className={`telemetry-card corner-bracket rounded-2xl p-4 border ${border} ${bg} flex items-center justify-between gap-4`}>
      <div className="flex items-center gap-3">
        <div className="p-2.5 rounded-xl bg-slate-950 border border-slate-800">
          {icon}
        </div>
        <div>
          <span className="text-[10px] font-mono text-slate-400 uppercase tracking-wider block">
            AQUAPLANING &amp; SLIP TELEMETRY RISK
          </span>
          <span className={`text-xs font-mono font-bold uppercase ${color}`}>
            {riskLevel}
          </span>
        </div>
      </div>

      <div className="text-right font-mono">
        <span className="text-[10px] text-slate-400 uppercase block">Moisture Index</span>
        <span className="text-sm font-bold text-slate-200">{wetP.toFixed(1)}%</span>
      </div>
    </div>
  );
}
