import React, { useState, useEffect } from 'react';
import { getHealth } from '../services/api';
import { Activity, WifiOff } from 'lucide-react';

export default function SystemStatus({ onStatusChange }) {
  const [isOnline, setIsOnline] = useState(null);
  const [lastCheck, setLastCheck] = useState(null);

  const checkStatus = async () => {
    try {
      const data = await getHealth();
      if (data && data.status === 'ok') {
        setIsOnline(true);
        if (onStatusChange) onStatusChange(true);
      } else {
        setIsOnline(false);
        if (onStatusChange) onStatusChange(false);
      }
    } catch (err) {
      setIsOnline(false);
      if (onStatusChange) onStatusChange(false);
    } finally {
      setLastCheck(new Date().toLocaleTimeString());
    }
  };

  useEffect(() => {
    checkStatus();
    const interval = setInterval(checkStatus, 10000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="flex items-center gap-3 px-3.5 py-1.5 rounded-full bg-slate-900/80 border border-slate-800 backdrop-blur-md">
      <div className="flex items-center gap-2">
        <span className="relative flex h-2.5 w-2.5">
          {isOnline ? (
            <>
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500 shadow-[0_0_8px_#10b981]"></span>
            </>
          ) : (
            <>
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-rose-500 shadow-[0_0_8px_#f43f5e]"></span>
            </>
          )}
        </span>
        <span className="text-xs font-semibold tracking-wider font-mono uppercase">
          {isOnline === null ? (
            <span className="text-slate-400">CONNECTING...</span>
          ) : isOnline ? (
            <span className="text-emerald-400">SYSTEM ONLINE</span>
          ) : (
            <span className="text-rose-400">BACKEND OFFLINE</span>
          )}
        </span>
      </div>
      {lastCheck && (
        <span className="text-[10px] text-slate-500 font-mono hidden sm:inline border-l border-slate-800 pl-2.5">
          {lastCheck}
        </span>
      )}
    </div>
  );
}
