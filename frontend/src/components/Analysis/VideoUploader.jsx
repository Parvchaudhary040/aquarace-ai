import React, { useState, useRef } from 'react';
import { UploadCloud, Film, AlertTriangle, RefreshCw, Sparkles, Play, Layers, Clock, TrendingUp, ShieldAlert, ChevronRight } from 'lucide-react';

const ACCEPTED_VIDEO_FORMATS = ['video/mp4', 'video/x-msvideo', 'video/quicktime', 'video/x-matroska', 'video/webm'];
const ACCEPTED_VIDEO_EXTENSIONS = ['.mp4', '.avi', '.mov', '.mkv', '.webm'];

export default function VideoUploader({ onAnalyzeVideo, isLoading, videoResult }) {
  const [dragActive, setDragActive] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [videoPreviewUrl, setVideoPreviewUrl] = useState(null);
  const [errorMsg, setErrorMsg] = useState(null);
  const [activeFrameIndex, setActiveFrameIndex] = useState(null);
  const inputRef = useRef(null);
  const videoRef = useRef(null);

  const validateAndSetVideo = (file) => {
    setErrorMsg(null);
    if (!file) return;

    const fileExt = '.' + file.name.split('.').pop().toLowerCase();
    const isValidFormat = ACCEPTED_VIDEO_FORMATS.includes(file.type) || ACCEPTED_VIDEO_EXTENSIONS.includes(fileExt);

    if (!isValidFormat) {
      setErrorMsg(`Unsupported video format '${file.name}'. Please upload an MP4, AVI, MOV, MKV, or WEBM video file.`);
      return;
    }

    if (file.size > 100 * 1024 * 1024) {
      setErrorMsg('Video file size exceeds 100 MB limit.');
      return;
    }

    setSelectedFile(file);
    const objectUrl = URL.createObjectURL(file);
    setVideoPreviewUrl(objectUrl);
    setActiveFrameIndex(null);
  };

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      validateAndSetVideo(e.dataTransfer.files[0]);
    }
  };

  const handleChange = (e) => {
    e.preventDefault();
    if (e.target.files && e.target.files[0]) {
      validateAndSetVideo(e.target.files[0]);
    }
  };

  const handleClear = () => {
    setSelectedFile(null);
    if (videoPreviewUrl) {
      URL.revokeObjectURL(videoPreviewUrl);
      setVideoPreviewUrl(null);
    }
    setErrorMsg(null);
    setActiveFrameIndex(null);
    if (inputRef.current) inputRef.current.value = '';
  };

  const handleAnalyzeClick = () => {
    if (!selectedFile) {
      setErrorMsg('Please select or drop a track video before analyzing.');
      return;
    }
    if (onAnalyzeVideo) {
      onAnalyzeVideo(selectedFile);
    }
  };

  const handleFrameClick = (idx, timestamp) => {
    setActiveFrameIndex(idx);
    if (videoRef.current) {
      videoRef.current.currentTime = timestamp;
    }
  };

  const getConditionColor = (cond) => {
    const c = (cond || '').toLowerCase();
    if (c === 'wet') return 'bg-cyan-500/20 text-cyan-400 border-cyan-500/40';
    if (c === 'damp') return 'bg-amber-500/20 text-amber-400 border-amber-500/40';
    if (c === 'drying') return 'bg-sky-500/20 text-sky-300 border-sky-500/40';
    return 'bg-emerald-500/20 text-emerald-400 border-emerald-500/40';
  };

  const getConditionBadgeBg = (cond) => {
    const c = (cond || '').toLowerCase();
    if (c === 'wet') return 'bg-cyan-400';
    if (c === 'damp') return 'bg-amber-400';
    if (c === 'drying') return 'bg-sky-400';
    return 'bg-emerald-400';
  };

  return (
    <div className="telemetry-card corner-bracket rounded-2xl p-5 border border-slate-800 relative overflow-hidden space-y-6">
      
      {/* Header */}
      <div className="flex items-center justify-between border-b border-slate-800 pb-3">
        <div className="flex items-center gap-2">
          <Film className="w-5 h-5 text-amber-400" />
          <h2 className="text-base font-bold tracking-wide uppercase text-slate-100 font-mono">
            Track Video Sequence Analysis
          </h2>
        </div>
        <span className="text-[10px] font-mono text-amber-300 bg-amber-950/60 px-2.5 py-1 rounded border border-amber-500/30">
          MULTI-FRAME AI TELEMETRY
        </span>
      </div>

      {/* Main Grid: Left = Video Upload/Preview, Right = Timeline & Data */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* Left Column: Video Dropzone & Player (5 Cols) */}
        <div className="lg:col-span-5 space-y-4">
          {!videoPreviewUrl ? (
            <div
              onDragEnter={handleDrag}
              onDragOver={handleDrag}
              onDragLeave={handleDrag}
              onDrop={handleDrop}
              onClick={() => inputRef.current?.click()}
              className={`relative flex flex-col items-center justify-center p-8 rounded-xl border-2 border-dashed cursor-pointer transition-all min-h-[260px] ${
                dragActive
                  ? 'border-amber-400 bg-amber-500/10 shadow-[0_0_20px_rgba(245,158,11,0.2)]'
                  : 'border-slate-700/80 bg-slate-900/40 hover:border-slate-500 hover:bg-slate-900/70'
              }`}
            >
              <input
                ref={inputRef}
                type="file"
                accept=".mp4,.avi,.mov,.mkv,.webm"
                onChange={handleChange}
                className="hidden"
              />

              <div className="w-14 h-14 rounded-full bg-slate-900 border border-amber-500/30 flex items-center justify-center text-amber-400 mb-3 shadow-[0_0_15px_rgba(245,158,11,0.15)]">
                <Film className="w-7 h-7 stroke-[1.5]" />
              </div>

              <p className="text-sm font-semibold text-slate-200 text-center">
                Drag &amp; drop track video here, or <span className="text-amber-400 underline decoration-amber-400/50">browse</span>
              </p>
              <p className="text-xs text-slate-400 font-mono mt-2 text-center">
                Formats: MP4, AVI, MOV, MKV, WEBM (Max 100MB)
              </p>
            </div>
          ) : (
            <div className="relative rounded-xl overflow-hidden border border-slate-700 bg-slate-950">
              
              {/* Video Player */}
              <div className="relative aspect-video w-full bg-black flex items-center justify-center overflow-hidden">
                <video
                  ref={videoRef}
                  src={videoPreviewUrl}
                  controls
                  playsInline
                  className="w-full h-full object-contain"
                />

                {/* Loading / Processing Overlay */}
                {isLoading && (
                  <div className="absolute inset-0 bg-slate-950/85 backdrop-blur-md flex flex-col items-center justify-center p-6 text-center z-20">
                    <RefreshCw className="w-10 h-10 text-amber-400 animate-spin mb-3" />
                    <span className="text-sm font-mono font-bold tracking-widest text-amber-300 uppercase animate-pulse mb-1">
                      ANALYZING TRACK VIDEO
                    </span>
                    <p className="text-xs font-mono text-slate-400 max-w-xs">
                      SAMPLING MULTI-FRAME SEQUENCE &amp; EVALUATING TEMPORAL TREND
                    </p>
                    <div className="w-48 h-1.5 bg-slate-800 rounded-full mt-4 overflow-hidden border border-slate-700">
                      <div className="h-full bg-gradient-to-r from-amber-500 to-cyan-400 animate-[pulse_1s_infinite] w-full" />
                    </div>
                  </div>
                )}
              </div>

              {/* Video File Info */}
              <div className="p-3 bg-slate-900/80 border-t border-slate-800 flex items-center justify-between text-xs font-mono">
                <div className="flex items-center gap-2 truncate text-slate-300">
                  <Film className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                  <span className="truncate">{selectedFile?.name}</span>
                </div>
                {!isLoading && (
                  <button
                    type="button"
                    onClick={handleClear}
                    className="px-2 py-1 rounded bg-slate-800 hover:bg-rose-900/60 text-slate-400 hover:text-white transition"
                    title="Change Video"
                  >
                    <RefreshCw className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            </div>
          )}

          {/* Error Banner */}
          {errorMsg && (
            <div className="p-3 rounded-lg bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs font-medium flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 shrink-0 text-rose-400" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Action Button */}
          <div className="flex items-center justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={handleAnalyzeClick}
              disabled={!selectedFile || isLoading}
              className={`w-full py-3.5 rounded-xl font-bold font-mono text-xs uppercase tracking-wider flex items-center justify-center gap-2 transition-all shadow-lg ${
                !selectedFile || isLoading
                  ? 'bg-slate-800 text-slate-500 cursor-not-allowed border border-slate-800'
                  : 'bg-gradient-to-r from-amber-500 via-amber-400 to-cyan-400 hover:from-amber-400 hover:to-cyan-300 text-slate-950 border border-amber-300 shadow-[0_0_20px_rgba(245,158,11,0.3)] active:scale-95'
              }`}
            >
              {isLoading ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin text-slate-950" />
                  <span>Processing Video Frames...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4 text-slate-950" />
                  <span>Analyze Track Video</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Right Column: Timeline & Analysis Results (7 Cols) */}
        <div className="lg:col-span-7 space-y-5 flex flex-col justify-between">
          
          {videoResult ? (
            <div className="space-y-6 animate-fadeIn">
              
              {/* Header Stats Badge */}
              <div className="flex flex-wrap items-center justify-between gap-3 p-3 rounded-xl bg-slate-900/90 border border-slate-800 text-xs font-mono">
                <div className="flex items-center gap-2 text-slate-300">
                  <Layers className="w-4 h-4 text-amber-400" />
                  <span>ANALYZED: <strong className="text-white font-bold">{videoResult.frames_analyzed} FRAMES</strong></span>
                </div>
                <div className="flex items-center gap-2 text-slate-400">
                  <Clock className="w-3.5 h-3.5 text-cyan-400" />
                  <span>FILE: <strong className="text-slate-200">{videoResult.filename}</strong></span>
                </div>
              </div>

              {/* 1. VIDEO CONDITION TIMELINE */}
              <div className="space-y-3">
                <div className="flex items-center justify-between text-xs font-mono text-slate-400">
                  <span className="font-bold uppercase tracking-wider text-slate-300 flex items-center gap-2">
                    <Clock className="w-3.5 h-3.5 text-amber-400" />
                    1. Video Condition Timeline
                  </span>
                  <span className="text-[10px] text-slate-500">Click node to seek frame</span>
                </div>

                {/* Horizontal Timeline Bar */}
                <div className="relative p-4 rounded-xl bg-slate-950/80 border border-slate-800 overflow-x-auto">
                  
                  {/* Connecting Line */}
                  <div className="absolute top-1/2 left-6 right-6 h-0.5 bg-slate-800 -translate-y-1/2 z-0" />

                  <div className="relative z-10 flex items-center justify-between min-w-[340px] gap-2 px-2">
                    {videoResult.frames.map((frame, idx) => {
                      const isSelected = activeFrameIndex === idx;
                      const isLatest = idx === videoResult.frames.length - 1;
                      const dotColor = getConditionBadgeBg(frame.condition);

                      return (
                        <div
                          key={idx}
                          onClick={() => handleFrameClick(idx, frame.timestamp)}
                          className="flex flex-col items-center cursor-pointer group transition-transform hover:scale-110 animate-fadeUp"
                          style={{ animationDelay: `${idx * 150}ms`, animationFillMode: 'both' }}
                        >
                          <span className="text-[10px] font-mono text-slate-400 mb-1 group-hover:text-slate-200">
                            {frame.timestamp}s
                          </span>

                          {/* Node Dot */}
                          <div
                            className={`w-5 h-5 rounded-full ${dotColor} flex items-center justify-center shadow-md transition-all ${
                              isSelected || isLatest
                                ? 'ring-4 ring-amber-400/50 scale-125'
                                : 'opacity-80 group-hover:opacity-100'
                            }`}
                          >
                            <div className="w-1.5 h-1.5 rounded-full bg-slate-950" />
                          </div>

                          {/* Condition Badge */}
                          <span
                            className={`mt-2 text-[9px] font-mono font-bold uppercase px-1.5 py-0.5 rounded border ${getConditionColor(
                              frame.condition
                            )}`}
                          >
                            {frame.condition}
                          </span>

                          <span className="text-[9px] font-mono text-slate-400 mt-0.5">
                            {frame.confidence}%
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* 2. CONDITION TRANSITION FLOW */}
              <div className="space-y-2">
                <span className="text-xs font-mono font-bold uppercase tracking-wider text-slate-300 block">
                  2. Condition Transition Sequence
                </span>
                <div className="flex flex-wrap items-center gap-2 p-3 rounded-xl bg-slate-900/60 border border-slate-800/80">
                  {videoResult.condition_sequence.map((cond, i) => (
                    <React.Fragment key={i}>
                      <span
                        className={`text-xs font-mono font-bold uppercase px-2.5 py-1 rounded-md border ${getConditionColor(
                          cond
                        )}`}
                      >
                        {cond}
                      </span>
                      {i < videoResult.condition_sequence.length - 1 && (
                        <ChevronRight className="w-4 h-4 text-slate-600 shrink-0" />
                      )}
                    </React.Fragment>
                  ))}
                </div>
              </div>

              {/* 3. TREND & 4. TIRE STRATEGY */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                
                {/* Trend Summary */}
                <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 space-y-2">
                  <div className="flex items-center justify-between text-xs font-mono text-slate-400">
                    <span className="flex items-center gap-1.5 uppercase font-bold text-slate-300">
                      <TrendingUp className="w-4 h-4 text-cyan-400" />
                      3. Temporal Trend
                    </span>
                    <span className="text-cyan-400 font-bold uppercase">
                      {videoResult.trend?.trend}
                    </span>
                  </div>
                  <p className="text-xs text-slate-300 font-normal">
                    {videoResult.trend?.message}
                  </p>
                </div>

                {/* Strategy Summary */}
                <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 space-y-2">
                  <div className="flex items-center justify-between text-xs font-mono text-slate-400">
                    <span className="flex items-center gap-1.5 uppercase font-bold text-slate-300">
                      <ShieldAlert className="w-4 h-4 text-amber-400" />
                      4. Tire Strategy
                    </span>
                    <span className="text-amber-400 font-bold uppercase">
                      {videoResult.strategy?.urgency} URGENCY
                    </span>
                  </div>
                  <p className="text-xs text-amber-300 font-bold font-mono">
                    {videoResult.strategy?.recommendation}
                  </p>
                </div>

              </div>

            </div>
          ) : (
            <div className="h-full flex flex-col items-center justify-center p-8 rounded-xl border border-dashed border-slate-800 bg-slate-900/30 text-center space-y-3 min-h-[280px]">
              <div className="w-12 h-12 rounded-full bg-slate-900 border border-slate-800 flex items-center justify-center text-slate-500">
                <Film className="w-6 h-6" />
              </div>
              <h3 className="text-sm font-mono font-bold text-slate-300 uppercase">
                Awaiting Video Upload
              </h3>
              <p className="text-xs text-slate-400 max-w-sm">
                Upload a racing track video to extract sampled frame telemetry, evaluate condition transition sequences, and compute tire strategies.
              </p>
            </div>
          )}

        </div>

      </div>

    </div>
  );
}
