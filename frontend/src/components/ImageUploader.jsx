import React, { useState, useRef } from 'react';
import { UploadCloud, Image as ImageIcon, CheckCircle, AlertTriangle, RefreshCw, Scan, Sparkles } from 'lucide-react';

const ACCEPTED_FORMATS = ['image/jpeg', 'image/png', 'image/webp'];
const ACCEPTED_EXTENSIONS = ['.jpg', '.jpeg', '.png', '.webp'];

export default function ImageUploader({ onAnalyze, isLoading, inferenceStatus }) {
  const [dragActive, setDragActive] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [errorMsg, setErrorMsg] = useState(null);
  const inputRef = useRef(null);

  const validateAndSetFile = (file) => {
    setErrorMsg(null);
    if (!file) return;

    const fileExt = '.' + file.name.split('.').pop().toLowerCase();
    const isValidFormat = ACCEPTED_FORMATS.includes(file.type) || ACCEPTED_EXTENSIONS.includes(fileExt);

    if (!isValidFormat) {
      setErrorMsg(`Unsupported format '${file.name}'. Please upload a JPG, JPEG, PNG, or WEBP image.`);
      return;
    }

    setSelectedFile(file);
    const objectUrl = URL.createObjectURL(file);
    setPreviewUrl(objectUrl);
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
      validateAndSetFile(e.dataTransfer.files[0]);
    }
  };

  const handleChange = (e) => {
    e.preventDefault();
    if (e.target.files && e.target.files[0]) {
      validateAndSetFile(e.target.files[0]);
    }
  };

  const handleClear = () => {
    setSelectedFile(null);
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
      setPreviewUrl(null);
    }
    setErrorMsg(null);
    if (inputRef.current) inputRef.current.value = '';
  };

  const handleAnalyzeClick = () => {
    if (!selectedFile) {
      setErrorMsg('Please select or drop a track image before analyzing.');
      return;
    }
    if (onAnalyze) {
      onAnalyze(selectedFile);
    }
  };

  return (
    <div className="telemetry-card corner-bracket rounded-2xl p-5 border border-slate-800 relative overflow-hidden">
      
      {/* Card Title Header */}
      <div className="flex items-center justify-between mb-4 border-b border-slate-800 pb-3">
        <div className="flex items-center gap-2">
          <Scan className="w-5 h-5 text-cyan-400" />
          <h2 className="text-base font-bold tracking-wide uppercase text-slate-100 font-mono">
            Track Feed Ingestion
          </h2>
        </div>
        <span className="text-[10px] font-mono text-slate-400 bg-slate-900 px-2.5 py-1 rounded border border-slate-800">
          RAW IMAGE CAM 01
        </span>
      </div>

      {/* Upload Zone or Preview */}
      {!previewUrl ? (
        <div
          onDragEnter={handleDrag}
          onDragOver={handleDrag}
          onDragLeave={handleDrag}
          onDrop={handleDrop}
          onClick={() => inputRef.current?.click()}
          className={`relative flex flex-col items-center justify-center p-8 rounded-xl border-2 border-dashed cursor-pointer transition-all ${
            dragActive
              ? 'border-cyan-400 bg-cyan-500/10 shadow-[0_0_20px_rgba(6,182,212,0.2)]'
              : 'border-slate-700/80 bg-slate-900/40 hover:border-slate-500 hover:bg-slate-900/70'
          }`}
        >
          <input
            ref={inputRef}
            type="file"
            accept=".jpg,.jpeg,.png,.webp"
            onChange={handleChange}
            className="hidden"
          />

          <div className="w-14 h-14 rounded-full bg-slate-900 border border-cyan-500/30 flex items-center justify-center text-cyan-400 mb-3 shadow-[0_0_15px_rgba(6,182,212,0.15)]">
            <UploadCloud className="w-7 h-7 stroke-[1.5]" />
          </div>

          <p className="text-sm font-semibold text-slate-200 text-center">
            Drag &amp; drop track photo here, or <span className="text-cyan-400 underline decoration-cyan-400/50">browse</span>
          </p>
          <p className="text-xs text-slate-400 font-mono mt-1 text-center">
            Supported Formats: JPG, JPEG, PNG, WEBP
          </p>
        </div>
      ) : (
        <div className="relative rounded-xl overflow-hidden border border-slate-700 bg-slate-950 group">
          
          {/* Prominent Image Preview */}
          <div className="relative aspect-video max-h-72 w-full flex items-center justify-center bg-black/80 overflow-hidden">
            <img
              src={previewUrl}
              alt="Track feed preview"
              className="w-full h-full object-contain transition-transform duration-500 group-hover:scale-105"
            />

            {/* Scanning Overlay Effect when Loading */}
            {isLoading && (
              <div className="absolute inset-0 bg-cyan-950/40 backdrop-blur-[2px] flex flex-col items-center justify-center gap-2 p-4">
                <div className="w-full h-1 bg-gradient-to-r from-transparent via-cyan-400 to-transparent absolute top-0 animate-[bounce_2s_infinite]"></div>
                <RefreshCw className="w-10 h-10 text-cyan-400 animate-spin" />
                <span className="text-xs font-mono font-bold tracking-widest text-cyan-300 uppercase animate-pulse text-center">
                  {inferenceStatus || 'ANALYZING TRACK…'}
                </span>
              </div>
            )}

            {/* Image Overlay Badge */}
            <div className="absolute bottom-2 left-2 px-2.5 py-1 rounded bg-black/80 backdrop-blur-md border border-slate-700 text-[11px] font-mono text-slate-300 flex items-center gap-2">
              <ImageIcon className="w-3.5 h-3.5 text-cyan-400" />
              <span className="truncate max-w-[200px]">{selectedFile?.name}</span>
              <span className="text-slate-500">|</span>
              <span className="text-slate-400">{(selectedFile?.size / 1024).toFixed(1)} KB</span>
            </div>

            {/* Reset Button */}
            {!isLoading && (
              <button
                type="button"
                onClick={handleClear}
                className="absolute top-2 right-2 p-1.5 rounded-lg bg-black/75 text-slate-300 hover:text-white hover:bg-rose-900/80 border border-slate-700 transition"
                title="Change Image"
              >
                <RefreshCw className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
      )}

      {/* Error Banner */}
      {errorMsg && (
        <div className="mt-3 p-3 rounded-lg bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs font-medium flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 shrink-0 text-rose-400" />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* Action Button */}
      <div className="mt-4 flex items-center justify-end gap-3">
        {selectedFile && !isLoading && (
          <button
            type="button"
            onClick={handleClear}
            className="px-4 py-2.5 rounded-xl border border-slate-800 text-slate-400 hover:text-slate-200 hover:bg-slate-900 text-xs font-semibold uppercase tracking-wider transition"
          >
            Clear Selection
          </button>
        )}

        <button
          type="button"
          onClick={handleAnalyzeClick}
          disabled={!selectedFile || isLoading}
          className={`w-full sm:w-auto px-6 py-3 rounded-xl font-bold font-mono text-xs uppercase tracking-wider flex items-center justify-center gap-2 transition-all shadow-lg ${
            !selectedFile || isLoading
              ? 'bg-slate-800 text-slate-500 cursor-not-allowed border border-slate-800'
              : 'bg-gradient-to-r from-cyan-600 to-cyan-500 hover:from-cyan-500 hover:to-cyan-400 text-slate-950 border border-cyan-300 shadow-[0_0_20px_rgba(6,182,212,0.4)] active:scale-95'
          }`}
        >
          {isLoading ? (
            <>
              <RefreshCw className="w-4 h-4 animate-spin text-slate-950" />
              <span>Analyzing Track Condition...</span>
            </>
          ) : (
            <>
              <Sparkles className="w-4 h-4 text-slate-950" />
              <span>Analyze Track Image</span>
            </>
          )}
        </button>
      </div>

    </div>
  );
}
