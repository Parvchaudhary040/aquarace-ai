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

import { analyzeImage, getHistory, getTrend, getStrategy } from '../services/api';
import { useLenis } from '../hooks/useLenis';

export default function Dashboard() {
  useLenis(); // Lenis inertia smooth scroll

  const analysisSectionRef = useRef(null);

  const [currentAnalysis, setCurrentAnalysis] = useState(null);
  const [historyData, setHistoryData] = useState([]);
  const [trendData, setTrendData] = useState(null);
  const [strategyData, setStrategyData] = useState(null);
  const [systemStatus, setSystemStatus] = useState('online');

  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isInitialLoading, setIsInitialLoading] = useState(true);

  // Fetch initial telemetry state from FastAPI backend
  const fetchAllTelemetry = async (activeAnalysis = null) => {
    try {
      const [historyRes, trendRes, strategyRes] = await Promise.all([
        getHistory().catch(() => []),
        getTrend().catch(() => null),
        getStrategy().catch(() => null),
      ]);

      setHistoryData(historyRes || []);
      setTrendData(trendRes);
      setStrategyData(strategyRes);

      if (activeAnalysis) {
        setCurrentAnalysis(activeAnalysis);
      } else if (historyRes && historyRes.length > 0) {
        setCurrentAnalysis((prev) => prev || historyRes[0]);
      }
    } catch (err) {
      console.error('Failed to fetch initial telemetry:', err);
    } finally {
      setIsInitialLoading(false);
    }
  };

  useEffect(() => {
    fetchAllTelemetry();
  }, []);

  // Handle track photo upload & AI inference
  const handleAnalyze = async (file) => {
    setIsAnalyzing(true);
    try {
      const result = await analyzeImage(file);
      setCurrentAnalysis(result);

      // Refresh trend, strategy, and history log with active analysis retained
      await fetchAllTelemetry(result);
    } catch (err) {
      console.error('Analysis failed:', err);
      throw err;
    } finally {
      setIsAnalyzing(false);
    }
  };

  // Scroll smoothly to Analysis Section
  const scrollToAnalysis = () => {
    if (analysisSectionRef.current) {
      analysisSectionRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  };

  // Scroll to top
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans selection:bg-cyan-500 selection:text-slate-950 overflow-x-hidden">
      
      {/* SECTION 1 — CINEMATIC HERO */}
      <HeroSection
        onStatusChange={setSystemStatus}
        onStartAnalysis={scrollToAnalysis}
      />

      {/* SECTION 2 — SCROLL-DRIVEN TRACK ANALYSIS PARALLAX */}
      <ScrollAnalysisParallax />

      {/* MAIN TELEMETRY WORKSPACE */}
      <main className="max-w-[1600px] mx-auto px-4 sm:px-6 py-12 space-y-12">
        
        {/* SECTION 3 — IMAGE ANALYSIS */}
        <section ref={analysisSectionRef} className="w-full">
          <div className="text-center max-w-2xl mx-auto mb-8 space-y-2">
            <span className="text-xs font-mono font-bold tracking-widest text-cyan-400 uppercase">
              SECTION 03 :: REAL-TIME INGESTION
            </span>
            <h2 className="text-3xl sm:text-4xl font-black text-white uppercase tracking-tight font-mono">
              LIVE TRACK FEED INGESTION
            </h2>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
            
            {/* Left Column: Image Ingest Viewer (7 Cols) */}
            <div className="lg:col-span-7 flex flex-col">
              <AnalysisViewer onAnalyze={handleAnalyze} isLoading={isAnalyzing} />
            </div>

            {/* Right Column: Live Telemetry & Probabilities (5 Cols) */}
            <div className="lg:col-span-5 flex flex-col gap-6 justify-between">
              <ConditionCard analysis={currentAnalysis} isLoading={isAnalyzing || isInitialLoading} />
              <ConfidenceChart analysis={currentAnalysis} isLoading={isAnalyzing || isInitialLoading} />
            </div>

          </div>
        </section>

        {/* SECTION 4 — CONDITION INTELLIGENCE (TREND) */}
        <TrendSection trendData={trendData} isLoading={isAnalyzing || isInitialLoading} />

        {/* SECTION 5 — TIRE STRATEGY (VISUAL CENTERPIECE) */}
        <StrategySection strategyData={strategyData} isLoading={isAnalyzing || isInitialLoading} />

        {/* SECTION 6 — ANALYSIS HISTORY TIMELINE */}
        <AnalysisTimeline
          history={historyData}
          isLoading={isInitialLoading}
          onSelectRecord={(rec) => setCurrentAnalysis(rec)}
        />

      </main>

      {/* SECTION 7 — FINAL SYSTEM STATUS & FOOTER */}
      <FooterSection
        onStatusChange={setSystemStatus}
        onScrollTop={scrollToTop}
      />

    </div>
  );
}
