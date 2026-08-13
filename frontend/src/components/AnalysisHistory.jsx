import React from 'react';
import { History, FileText, CheckCircle, Clock } from 'lucide-react';

export default function AnalysisHistory({ history = [], isLoading, onSelectRecord }) {
  
  const formatDate = (isoString) => {
    if (!isoString) return '--';
    try {
      const date = new Date(isoString);
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }) + ' - ' + date.toLocaleDateString([], { month: 'short', day: 'numeric' });
    } catch {
      return isoString;
    }
  };

  const getBadgeClass = (cond) => {
    const uppercase = (cond || '').toUpperCase();
    if (uppercase === 'DRY') return 'text-amber-400 border-amber-500/30';
    if (uppercase === 'DAMP') return 'text-sky-400 border-sky-500/30';
    if (uppercase === 'WET') return 'text-cyan-400 border-cyan-500/30';
    return 'text-slate-500 border-slate-700';
  };

  return (
    <div className="telemetry-card corner-bracket rounded-2xl p-6 border border-slate-800/80 bg-slate-950">
      
      {/* Table Header Title */}
      <div className="flex items-center justify-between pb-4 mb-2">
        <div className="flex items-center gap-3">
          <History className="w-5 h-5 text-cyan-500/60" />
          <h3 className="text-xs font-mono font-bold tracking-widest uppercase text-slate-300">
            Analysis History Log
          </h3>
        </div>
        <span className="text-[10px] font-mono text-slate-500">
          {history.length} RECORDS
        </span>
      </div>

      {/* Table Content */}
      <div className="overflow-x-auto">
        <table className="w-full text-left font-mono text-xs">
          <thead>
            <tr className="text-slate-600 uppercase text-[9px] tracking-widest border-b border-slate-800/50">
              <th className="py-2 px-2 font-normal">ID</th>
              <th className="py-2 px-2 font-normal">Time</th>
              <th className="py-2 px-2 font-normal">File</th>
              <th className="py-2 px-2 font-normal">Result</th>
              <th className="py-2 px-2 font-normal text-right">Conf</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/30">
            {isLoading && history.length === 0 ? (
              <tr>
                <td colSpan="5" className="py-10 text-center text-slate-600">
                  <Clock className="w-5 h-5 animate-spin mx-auto mb-3 text-slate-500" />
                  Loading telemetry logs...
                </td>
              </tr>
            ) : history.length === 0 ? (
              <tr>
                <td colSpan="5" className="py-10 text-center text-slate-600">
                  No analysis records stored in database yet.
                </td>
              </tr>
            ) : (
              history.map((item) => (
                <tr
                  key={item.id}
                  onClick={() => onSelectRecord && onSelectRecord(item)}
                  className="hover:bg-slate-900/50 transition-colors cursor-pointer group"
                >
                  <td className="py-3 px-2 text-slate-600">#{item.id}</td>
                  <td className="py-3 px-2 text-slate-500">{formatDate(item.timestamp)}</td>
                  <td className="py-3 px-2 text-slate-400 flex items-center gap-2">
                    <FileText className="w-3.5 h-3.5 text-slate-700 group-hover:text-cyan-500/50" />
                    <span className="truncate max-w-[150px]">{item.filename}</span>
                  </td>
                  <td className="py-3 px-2">
                    <span className={`inline-block px-2 py-0.5 rounded-sm border text-[9px] font-bold uppercase tracking-wider ${getBadgeClass(item.condition)}`}>
                      {item.condition}
                    </span>
                  </td>
                  <td className="py-3 px-2 text-right font-medium text-slate-400 group-hover:text-slate-200 transition-colors">
                    {item.confidence != null ? `${item.confidence.toFixed(1)}%` : '--'}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

    </div>
  );
}
