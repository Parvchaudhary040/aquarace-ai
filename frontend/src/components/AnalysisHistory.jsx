import React from 'react';
import { History, FileText, CheckCircle, Clock } from 'lucide-react';

export default function AnalysisHistory({ history = [], isLoading, onSelectRecord }) {
  
  const formatDate = (isoString) => {
    if (!isoString) return '--';
    try {
      const date = new Date(isoString);
      return date.toLocaleDateString() + ' ' + date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
    } catch {
      return isoString;
    }
  };

  const getBadgeClass = (cond) => {
    const uppercase = (cond || '').toUpperCase();
    if (uppercase === 'DRY') return 'bg-amber-500/10 text-amber-400 border-amber-500/30';
    if (uppercase === 'DAMP') return 'bg-sky-500/10 text-sky-400 border-sky-500/30';
    if (uppercase === 'WET') return 'bg-cyan-500/10 text-cyan-400 border-cyan-500/30';
    return 'bg-slate-800 text-slate-400 border-slate-700';
  };

  return (
    <div className="telemetry-card corner-bracket rounded-2xl p-5 border border-slate-800">
      
      {/* Table Header Title */}
      <div className="flex items-center justify-between border-b border-slate-800 pb-3 mb-4">
        <div className="flex items-center gap-2">
          <History className="w-4 h-4 text-cyan-400" />
          <h3 className="text-xs font-mono font-bold tracking-wider uppercase text-slate-200">
            Telemetry Analysis History Log
          </h3>
        </div>
        <span className="text-[10px] font-mono text-slate-400 bg-slate-900 px-2.5 py-1 rounded border border-slate-800">
          SQLITE AUDIT LOG ({history.length} RECORDS)
        </span>
      </div>

      {/* Table Content */}
      <div className="overflow-x-auto">
        <table className="w-full text-left font-mono text-xs">
          <thead>
            <tr className="border-b border-slate-800 text-slate-400 uppercase text-[10px] tracking-wider bg-slate-900/60">
              <th className="py-2.5 px-3">ID</th>
              <th className="py-2.5 px-3">Timestamp</th>
              <th className="py-2.5 px-3">Filename</th>
              <th className="py-2.5 px-3">Condition</th>
              <th className="py-2.5 px-3 text-right">Confidence</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/60">
            {isLoading && history.length === 0 ? (
              <tr>
                <td colSpan="5" className="py-6 text-center text-slate-500">
                  <Clock className="w-5 h-5 animate-spin mx-auto mb-2 text-cyan-400" />
                  Loading telemetry log history...
                </td>
              </tr>
            ) : history.length === 0 ? (
              <tr>
                <td colSpan="5" className="py-6 text-center text-slate-500">
                  No analysis records stored in database yet. Upload a track image above to record inference telemetry.
                </td>
              </tr>
            ) : (
              history.map((item) => (
                <tr
                  key={item.id}
                  onClick={() => onSelectRecord && onSelectRecord(item)}
                  className="hover:bg-slate-800/40 transition cursor-pointer group"
                >
                  <td className="py-3 px-3 text-slate-500 font-bold">#{item.id}</td>
                  <td className="py-3 px-3 text-slate-400">{formatDate(item.timestamp)}</td>
                  <td className="py-3 px-3 text-slate-200 font-medium flex items-center gap-1.5">
                    <FileText className="w-3.5 h-3.5 text-slate-500 group-hover:text-cyan-400" />
                    <span className="truncate max-w-[180px]">{item.filename}</span>
                  </td>
                  <td className="py-3 px-3">
                    <span className={`inline-block px-2.5 py-0.5 rounded border text-[10px] font-bold ${getBadgeClass(item.condition)}`}>
                      {item.condition}
                    </span>
                  </td>
                  <td className="py-3 px-3 text-right font-bold text-slate-200">
                    {item.confidence != null ? `${item.confidence.toFixed(2)}%` : '--'}
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
