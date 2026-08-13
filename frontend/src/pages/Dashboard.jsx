import React, { useState, useEffect, useRef } from 'react';
import HeroSection from '../components/Hero/HeroSection';
import ScrollAnalysisParallax from '../components/Hero/ScrollAnalysisParallax';
import AnalysisViewer from '../components/Analysis/AnalysisViewer';
import ConditionCard from '../components/ConditionCard';
import ConfidenceChart from '../components/ConfidenceChart';
import TrendSection from '../components/Trend/TrendSection';
import StrategySection from '../components/Strategy/StrategySection';
import AnalysisTimeline from '../components/History/AnalysisTimeline';
import FooterSection from '../components/Footer/FooterSection';
import { Play } from 'lucide-react';

import { analyzeImage, analyzeVideo, getHistory, getTrend, getStrategy } from '../services/api';
import { useLenis } from '../hooks/useLenis';

const DEMO_ANALYSIS = {
  condition: "WET",
  confidence: 91.2,
  dry_probability: 8.2,
  damp_probability: 0.6,
  wet_probability: 91.2
};
const DEMO_TREND = {
  sequence: ["WET", "DAMP", "DRYING"],
  trend: "IMPROVING",
  message: "Track line drying rapidly across racing apex. Transitioning to slicks window soon."
};
const DEMO_STRATEGY = {
  current_condition: "DRYING",
  trend: "IMPROVING",
  current_tire: "INTERMEDIATE",
  recommendation: "PREPARE FOR SLICK TRANSITION",
  urgency: "HIGH",
  reason: "Track moisture decreasing rapidly. Slick tires will be optimal within 2-3 laps."
};
const DEMO_HISTORY = [
  { id: 1, timestamp: new Date().toISOString(), condition: "WET", confidence: 91.2 },
  { id: 2, timestamp: new Date(Date.now() - 60000).toISOString(), condition: "DAMP", confidence: 85.5 },
  { id: 3, timestamp: new Date(Date.now() - 120000).toISOString(), condition: "DRYING", confidence: 78.4 }
];
const DEMO_VIDEO = {
  filename: "demo_track.mp4",
  frames_analyzed: 5,
  frames: [
    { timestamp: 0, condition: "WET", confidence: 92, dry_probability: 2, damp_probability: 6, wet_probability: 92 },
    { timestamp: 2, condition: "WET", confidence: 88, dry_probability: 2, damp_probability: 10, wet_probability: 88 },
    { timestamp: 4, condition: "DAMP", confidence: 85, dry_probability: 5, damp_probability: 85, wet_probability: 10 },
    { timestamp: 6, condition: "DAMP", confidence: 78, dry_probability: 12, damp_probability: 78, wet_probability: 10 },
    { timestamp: 8, condition: "DRY", confidence: 82, dry_probability: 82, damp_probability: 15, wet_probability: 3 },
  ],
  condition_sequence: ["WET", "WET", "DAMP", "DAMP", "DRY"],
  trend: DEMO_TREND,
  strategy: DEMO_STRATEGY
};

export default function Dashboard() {
  useLenis(); // Lenis inertia smooth scroll

  const overviewRef = useRef(null);
  const analysisSectionRef = useRef(null);
  const trendSectionRef = useRef(null);
  const strategySectionRef = useRef(null);
  const historySectionRef = useRef(null);

  const [currentAnalysis, setCurrentAnalysis] = useState(null);
  const [historyData, setHistoryData] = useState([]);
  const [trendData, setTrendData] = useState(null);
  const [strategyData, setStrategyData] = useState(null);
  const [systemStatus, setSystemStatus] = useState('online');

  const [analysisMode, setAnalysisMode] = useState('image'); // 'image' | 'video'
  const [videoResult, setVideoResult] = useState(null);

  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isAnalyzingVideo, setIsAnalyzingVideo] = useState(false);
  const [isInitialLoading, setIsInitialLoading] = useState(true);
  const [inferenceStatus, setInferenceStatus] = useState('');
  
  const [isDemoMode, setIsDemoMode] = useState(false);
  const [isNavSticky, setIsNavSticky] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsNavSticky(window.scrollY > window.innerHeight * 0.8);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const fetchAllTelemetry = async (activeAnalysis = null) => {
    if (isDemoMode) {
      setHistoryData(DEMO_HISTORY);
      setTrendData(DEMO_TREND);
      setStrategyData(DEMO_STRATEGY);
      setCurrentAnalysis(activeAnalysis || DEMO_ANALYSIS);
      setIsInitialLoading(false);
      return;
    }

    try {
      const [historyRes, trendRes, strategyRes] = await Promise.all([
        getHistory().catch(() => []),
        getTrend().catch(() => null),
        getStrategy().catch(() => null),
      ]);

      setHistoryData(historyRes || []);
      setTrendData((prev) => activeAnalysis?.trend || trendRes || prev);
      setStrategyData((prev) => activeAnalysis?.strategy || strategyRes || prev);

      if (activeAnalysis && activeAnalysis.condition) {
        setCurrentAnalysis(activeAnalysis);
      } else if (historyRes && historyRes.length > 0) {
        setCurrentAnalysis((prev) => prev || historyRes[0]);
      }
    } catch (err) {
      console.error('Failed to fetch initial telemetry:', err);
      // Fallback on error if desired, but we keep it clean.
    } finally {
      setIsInitialLoading(false);
    }
  };

  useEffect(() => {
    fetchAllTelemetry();
  }, [isDemoMode]);

  const handleAnalyze = async (file) => {
    setIsAnalyzing(true);
    setInferenceStatus('');
    try {
      if (isDemoMode) {
        setInferenceStatus('Running demo analysis…');
        await new Promise(r => setTimeout(r, 1500));
        setCurrentAnalysis(DEMO_ANALYSIS);
        setInferenceStatus('Demo complete');
        await fetchAllTelemetry(DEMO_ANALYSIS);
      } else {
        const result = await analyzeImage(file, (msg) => setInferenceStatus(msg));
        setCurrentAnalysis(result);
        await fetchAllTelemetry(result);
      }
    } catch (err) {
      console.error('Analysis failed:', err);
      setInferenceStatus('');
      alert(err.message || 'Analysis failed.');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleAnalyzeVideo = async (file) => {
    setIsAnalyzingVideo(true);
    setInferenceStatus('');
    try {
      if (isDemoMode) {
        setInferenceStatus('Running demo video analysis…');
        await new Promise(r => setTimeout(r, 2000));
        setVideoResult(DEMO_VIDEO);
        setTrendData(DEMO_TREND);
        setStrategyData(DEMO_STRATEGY);
        const lastFrame = DEMO_VIDEO.frames[DEMO_VIDEO.frames.length - 1];
        setCurrentAnalysis(lastFrame);
        setHistoryData(DEMO_HISTORY);
        setInferenceStatus('Demo complete');
      } else {
        const result = await analyzeVideo(file, (msg) => setInferenceStatus(msg));
        setVideoResult(result);
        if (result.trend) setTrendData(result.trend);
        if (result.strategy) setStrategyData(result.strategy);
        if (result.frames && result.frames.length > 0) {
          const lastFrame = result.frames[result.frames.length - 1];
          setCurrentAnalysis(lastFrame);
        }
        await fetchAllTelemetry();
      }
    } catch (err) {
      console.error('Video analysis failed:', err);
      setInferenceStatus('');
      alert(err.message || 'Video analysis failed.');
    } finally {
      setIsAnalyzingVideo(false);
    }
  };

  const scrollToSection = (ref) => {
    if (ref.current) {
      const top = ref.current.getBoundingClientRect().top + window.scrollY - 80;
      window.scrollTo({ top, behavior: 'smooth' });
    }
  };
  
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div ref={overviewRef} className="min-h-screen bg-slate-950 text-slate-100 font-sans selection:bg-cyan-500 selection:text-slate-950 overflow-x-hidden">
      
      {/* Sticky Navigation */}
      <div className={`fixed top-0 left-0 right-0 z-50 bg-slate-950/80 backdrop-blur-xl border-b border-slate-800 transition-transform duration-500 ${isNavSticky ? 'translate-y-0' : '-translate-y-full'}`}>
        <div className="max-w-[1600px] mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-6">
            <span className="text-cyan-400 font-black italic tracking-tighter uppercase cursor-pointer" onClick={scrollToTop}>
              AquaRace AI
            </span>
            <nav className="hidden md:flex items-center gap-6 text-xs font-mono font-bold text-slate-400">
              <button onClick={() => scrollToTop()} className="hover:text-white transition">OVERVIEW</button>
              <button onClick={() => scrollToSection(analysisSectionRef)} className="hover:text-white transition">ANALYSIS</button>
              <button onClick={() => scrollToSection(trendSectionRef)} className="hover:text-white transition">TREND</button>
              <button onClick={() => scrollToSection(strategySectionRef)} className="hover:text-white transition">STRATEGY</button>
              <button onClick={() => scrollToSection(historySectionRef)} className="hover:text-white transition">HISTORY</button>
            </nav>
          </div>
          
          <div className="flex items-center gap-4">
            <button
              onClick={() => setIsDemoMode(!isDemoMode)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-mono font-bold uppercase transition-all ${isDemoMode ? 'bg-amber-500/20 text-amber-400 border border-amber-500/50 shadow-[0_0_15px_rgba(245,158,11,0.2)]' : 'bg-slate-900 text-slate-500 border border-slate-800'}`}
            >
              <Play className="w-3.5 h-3.5" />
              {isDemoMode ? 'DEMO MODE ON' : 'DEMO MODE OFF'}
            </button>
          </div>
        </div>
      </div>

      <HeroSection
        onStatusChange={setSystemStatus}
        onStartAnalysis={() => scrollToSection(analysisSectionRef)}
        onSetMode={(mode) => {
          setAnalysisMode(mode);
          scrollToSection(analysisSectionRef);
        }}
      />

      <ScrollAnalysisParallax />

      <main className="max-w-[1600px] mx-auto px-4 sm:px-6 py-12 space-y-12">
        
        <section ref={analysisSectionRef} className="w-full scroll-mt-24">
          <div className="text-center max-w-2xl mx-auto mb-8 space-y-2">
            <span className="text-xs font-mono font-bold tracking-widest text-cyan-400 uppercase">
              SECTION 03 :: REAL-TIME INGESTION
            </span>
            <h2 className="text-3xl sm:text-4xl font-black text-white uppercase tracking-tight font-mono">
              LIVE TRACK FEED INGESTION
            </h2>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
            
            <div className={`${analysisMode === 'video' ? 'lg:col-span-12' : 'lg:col-span-7'} flex flex-col transition-all duration-300`}>
              <AnalysisViewer
                onAnalyze={handleAnalyze}
                onAnalyzeVideo={handleAnalyzeVideo}
                isLoadingImage={isAnalyzing}
                isLoadingVideo={isAnalyzingVideo}
                videoResult={videoResult}
                analysisMode={analysisMode}
                onModeChange={setAnalysisMode}
                inferenceStatus={inferenceStatus}
              />
            </div>

            {/* Right Column: Live Telemetry & Probabilities (Only visible in image mode or stacked) */}
            {analysisMode === 'image' && (
              <div className="lg:col-span-5 flex flex-col gap-6">
                <ConditionCard analysis={currentAnalysis} isLoading={isAnalyzing || isInitialLoading} />
              </div>
            )}

          </div>
        </section>

        <div ref={trendSectionRef} className="scroll-mt-24">
          <TrendSection trendData={trendData} isLoading={isAnalyzing || isAnalyzingVideo || isInitialLoading} />
        </div>

        <div ref={strategySectionRef} className="scroll-mt-24">
          <StrategySection strategyData={strategyData} isLoading={isAnalyzing || isAnalyzingVideo || isInitialLoading} />
        </div>

        <div ref={historySectionRef} className="scroll-mt-24">
          <AnalysisTimeline
            history={historyData}
            isLoading={isInitialLoading}
            onSelectRecord={(rec) => setCurrentAnalysis(rec)}
          />
        </div>

      </main>

      <FooterSection
        onStatusChange={setSystemStatus}
        onScrollTop={scrollToTop}
      />

    </div>
  );
}

