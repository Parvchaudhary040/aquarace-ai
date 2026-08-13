import React, { useRef } from 'react';
import ImageUploader from '../ImageUploader';
import VideoUploader from './VideoUploader';
import { Image as ImageIcon, Film } from 'lucide-react';
import { useScrollAnimation } from '../../hooks/useScrollAnimation';

export default function AnalysisViewer({
  onAnalyze,
  onAnalyzeVideo,
  isLoadingImage,
  isLoadingVideo,
  videoResult,
  analysisMode = 'image',
  onModeChange
}) {
  const containerRef = useRef();
  useScrollAnimation(containerRef, 'scaleUp');

  return (
    <div ref={containerRef} className="w-full relative space-y-4">
      
      {/* Mode Toggle Switch Bar */}
      <div className="flex items-center justify-between p-1.5 rounded-xl bg-slate-900/90 border border-slate-800 backdrop-blur-md">
        <div className="flex items-center gap-2 w-full sm:w-auto">
          
          <button
            type="button"
            onClick={() => onModeChange && onModeChange('image')}
            className={`flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 py-2 rounded-lg text-xs font-mono font-bold uppercase tracking-wider transition-all cursor-pointer ${
              analysisMode === 'image'
                ? 'bg-cyan-500 text-slate-950 shadow-[0_0_15px_rgba(6,182,212,0.4)]'
                : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
            }`}
          >
            <ImageIcon className="w-3.5 h-3.5" />
            <span>IMAGE ANALYSIS</span>
          </button>

          <button
            type="button"
            onClick={() => onModeChange && onModeChange('video')}
            className={`flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 py-2 rounded-lg text-xs font-mono font-bold uppercase tracking-wider transition-all cursor-pointer ${
              analysisMode === 'video'
                ? 'bg-amber-400 text-slate-950 shadow-[0_0_15px_rgba(245,158,11,0.4)]'
                : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
            }`}
          >
            <Film className="w-3.5 h-3.5" />
            <span>VIDEO ANALYSIS</span>
          </button>

        </div>

        <span className="hidden md:inline-block text-[10px] font-mono text-slate-400 px-3">
          MODE: {analysisMode.toUpperCase()} TELEMETRY
        </span>
      </div>

      {/* Mode View Content */}
      {analysisMode === 'image' ? (
        <ImageUploader onAnalyze={onAnalyze} isLoading={isLoadingImage} />
      ) : (
        <VideoUploader
          onAnalyzeVideo={onAnalyzeVideo}
          isLoading={isLoadingVideo}
          videoResult={videoResult}
        />
      )}

    </div>
  );
}
