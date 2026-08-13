import React, { useRef, useMemo, useState } from 'react';
import RaceTrackScene from '../3d/RaceTrackScene';
import Hyperspeed from '../Hyperspeed/Hyperspeed';
import SystemStatus from '../SystemStatus';
import { Gauge, ChevronDown, Sparkles, Radio, Zap, Image as ImageIcon, Film } from 'lucide-react';
import { useScrollAnimation } from '../../hooks/useScrollAnimation';

export default function HeroSection({ onStatusChange, onStartAnalysis, onSetMode }) {
  const contentRef = useRef();
  useScrollAnimation(contentRef, 'fadeUp');

  const [bgMode, setBgMode] = useState('hyperspeed');

  const hyperspeedOptions = useMemo(
    () => ({
      distortion: 'turbulentDistortion',
      length: 400,
      roadWidth: 10,
      islandWidth: 2,
      lanesPerRoad: 4,
      fov: 90,
      fovSpeedUp: 150,
      speedUp: 2,
      carLightsFade: 0.4,
      totalSideLightSticks: 25,
      lightPairsPerRoadWay: 40,
      shoulderLinesWidthPercentage: 0.05,
      brokenLinesWidthPercentage: 0.1,
      brokenLinesLengthPercentage: 0.5,
      lightStickWidth: [0.12, 0.5],
      lightStickHeight: [1.3, 1.7],
      movingAwaySpeed: [60, 80],
      movingCloserSpeed: [-120, -160],
      carLightsLength: [400 * 0.03, 400 * 0.2],
      carLightsRadius: [0.05, 0.14],
      carWidthPercentage: [0.3, 0.5],
      carShiftX: [-0.8, 0.8],
      carFloorSeparation: [0, 5],
      colors: {
        roadColor: 0x080808,
        islandColor: 0x0a0a0a,
        background: 0x020617,
        shoulderLines: 0xffffff,
        brokenLines: 0xffffff,
        leftCars: [0xd856bf, 0x6750a2, 0xc247ac],
        rightCars: [0x03b3c3, 0x0e5ea5, 0x324555],
        sticks: 0x03b3c3
      }
    }),
    []
  );

  return (
    <section className="relative w-full min-h-screen flex flex-col justify-between overflow-hidden bg-slate-950 border-b border-slate-800/80">
      
      {/* Background Visual Scene */}
      <div className="absolute inset-0 z-0 pointer-events-auto">
        {bgMode === 'hyperspeed' ? (
          <div className="relative w-full h-full">
            <Hyperspeed effectOptions={hyperspeedOptions} />
            <div className="absolute inset-0 bg-slate-950/40 pointer-events-none bg-[radial-gradient(ellipse_at_center,_transparent_0%,_#020617_90%)]" />
          </div>
        ) : (
          <RaceTrackScene />
        )}
      </div>

      {/* Top Navbar Overlay */}
      <header className="relative z-20 w-full p-4 sm:p-6 flex items-center justify-between max-w-[1600px] mx-auto">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-slate-900/90 border border-cyan-500/40 flex items-center justify-center text-cyan-400 shadow-[0_0_15px_rgba(6,182,212,0.3)] backdrop-blur-md">
            <Gauge className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl font-black tracking-tight text-white uppercase italic">
              AQUARACE <span className="text-cyan-400 font-extrabold not-italic">AI</span>
            </h1>
            <span className="text-[9px] font-mono font-bold tracking-widest text-cyan-300 uppercase block -mt-1">
              AI-POWERED TRACK INTELLIGENCE
            </span>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <button
            onClick={() => setBgMode((prev) => (prev === 'hyperspeed' ? 'track' : 'hyperspeed'))}
            className="hidden sm:flex items-center gap-1.5 text-xs font-mono px-3 py-1.5 rounded-lg bg-cyan-950/80 text-cyan-300 border border-cyan-500/40 hover:bg-cyan-900/80 transition-all backdrop-blur-md cursor-pointer shadow-[0_0_12px_rgba(6,182,212,0.25)]"
            title="Toggle Background Visual Effect"
          >
            <Zap className="w-3.5 h-3.5 text-amber-400 animate-pulse" />
            <span>BG: {bgMode === 'hyperspeed' ? 'HYPERSPEED' : '3D TRACK'}</span>
          </button>

          <div className="hidden md:flex items-center gap-2 text-xs font-mono text-slate-400 bg-slate-900/80 px-3 py-1.5 rounded-lg border border-slate-800 backdrop-blur-md">
            <Radio className="w-3.5 h-3.5 text-amber-400 animate-pulse" />
            <span>TELEMETRY FEED 01</span>
          </div>
          <SystemStatus onStatusChange={onStatusChange} />
        </div>
      </header>

      {/* Hero Center Text Content */}
      <div ref={contentRef} className="relative z-20 max-w-[1600px] mx-auto w-full px-4 sm:px-6 my-auto py-12">
        <div className="max-w-3xl space-y-6">
          
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-cyan-300 text-xs font-mono font-bold tracking-widest uppercase backdrop-blur-md">
            <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
            <span>PS2 Weather Whiplash Detector</span>
          </div>

          <h2 className="text-4xl sm:text-6xl lg:text-7xl font-black text-white uppercase tracking-tight font-sans leading-[1.05]">
            READ THE TRACK. <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-sky-300 to-amber-400">
              BEFORE THE TRACK CHANGES.
            </span>
          </h2>

          <p className="text-base sm:text-lg text-slate-300 max-w-xl font-normal leading-relaxed">
            AI-powered visual analysis for evolving race conditions and tire strategy.
          </p>

          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 pt-2">
            <div className="flex items-center gap-3 bg-slate-900/60 p-1.5 rounded-2xl border border-slate-700 backdrop-blur-md shadow-[0_0_30px_rgba(6,182,212,0.15)]">
              <button
                onClick={() => onSetMode ? onSetMode('image') : onStartAnalysis()}
                className="px-6 py-3.5 rounded-xl bg-gradient-to-r from-cyan-500 to-cyan-400 hover:from-cyan-400 hover:to-cyan-300 text-slate-950 font-black font-mono text-xs uppercase tracking-widest transition-all transform hover:scale-105 active:scale-95 flex items-center gap-2"
              >
                <ImageIcon className="w-4 h-4" />
                <span>Image Analysis</span>
              </button>

              <button
                onClick={() => onSetMode ? onSetMode('video') : onStartAnalysis()}
                className="px-6 py-3.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-400 hover:from-amber-400 hover:to-amber-300 text-slate-950 font-black font-mono text-xs uppercase tracking-widest transition-all transform hover:scale-105 active:scale-95 flex items-center gap-2"
              >
                <Film className="w-4 h-4" />
                <span>Video Analysis</span>
              </button>
            </div>
          </div>

        </div>
      </div>

      {/* Hero Bottom Telemetry Bar */}
      <div className="relative z-20 w-full max-w-[1600px] mx-auto px-4 sm:px-6 pb-6 flex items-center justify-between text-[11px] font-mono text-slate-400 border-t border-slate-800/60 pt-4 backdrop-blur-sm">
        <div className="flex items-center gap-4">
          <span>LATENCY: &lt; 15ms</span>
          <span className="text-slate-600">|</span>
          <span>PRECISION: ZERO-SHOT VISUAL</span>
        </div>

        <button
          onClick={onStartAnalysis}
          className="flex items-center gap-2 text-cyan-400 hover:text-cyan-300 font-bold uppercase tracking-wider animate-bounce"
        >
          <span>Scroll to Telemetry</span>
          <ChevronDown className="w-4 h-4" />
        </button>
      </div>

    </section>
  );
}
