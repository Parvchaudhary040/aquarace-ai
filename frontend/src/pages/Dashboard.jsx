import React, { useState, useEffect } from 'react';
import Header from '../components/Header';
import ImageUploader from '../components/ImageUploader';
import ConditionCard from '../components/ConditionCard';
import ConfidenceChart from '../components/ConfidenceChart';
import TrendChart from '../components/TrendChart';
import StrategyCard from '../components/StrategyCard';
import RiskIndicator from '../components/RiskIndicator';
import AnalysisHistory from '../components/AnalysisHistory';
import { analyzeImage, getHistory, getTrend, getStrategy } from '../services/api';
import { AlertCircle, RefreshCw } from 'lucide-react';

export default function Dashboard() {
  const [isBackendOnline, setIsBackendOnline] = useState(true);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isLoadingDashboard, setIsLoadingDashboard] = useState(true);
  const [errorBanner, setErrorBanner] = useState(null);

  // Telemetry States
  const [currentAnalysis, setCurrentAnalysis] = useState(null);
  const [historyData, setHistoryData] = useState([]);
  const [trendData, setTrendData] = useState({ sequence: [], trend: 'stable', message: '' });
  const [strategyData, setStrategyData] = useState(null);

  // Fetch all telemetry data
  const fetchDashboardData = async () => {
    setIsLoadingDashboard(true);
    try {
      const [hist, tr, strat] = await Promise.all([
        getHistory().catch(() => []),
        getTrend().catch(() => ({ sequence: [], trend: 'stable', message: '' })),
        getStrategy().catch(() => null)
      ]);

      setHistoryData(hist || []);
      setTrendData(tr || { sequence: [], trend: 'stable', message: '' });
      setStrategyData(strat || null);

      // If no active analysis, set current from latest history record
      if (!currentAnalysis && hist && hist.length > 0) {
        const latest = hist[0];
        setCurrentAnalysis({
          condition: latest.condition,
          confidence: latest.confidence,
          dry_probability: latest.dry_probability,
          damp_probability: latest.damp_probability,
          wet_probability: latest.wet_probability,
          filename: latest.filename,
          timestamp: latest.timestamp
        });
      }
    } catch (err) {
      console.error('Failed to load dashboard data:', err);
    } finally {
      setIsLoadingDashboard(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  // Handle Track Image Analysis Trigger
  const handleAnalyze = async (file) => {
    setIsAnalyzing(true);
    setErrorBanner(null);

    try {
      const result = await analyzeImage(file);
      setCurrentAnalysis(result);

      // Refresh history, trend, and strategy with new observation
      await fetchDashboardData();
    } catch (err) {
      console.error('Analysis error:', err);
      const msg = err.response?.data?.detail || err.message || 'Failed to analyze track image.';
      setErrorBanner(msg);
    } finally {
      setIsAnalyzing(false);
    }
  };

  // Handle Clicking a Historical Record
  const handleSelectHistoryRecord = (record) => {
    setCurrentAnalysis({
      condition: record.condition,
      confidence: record.confidence,
      dry_probability: record.dry_probability,
      damp_probability: record.damp_probability,
      wet_probability: record.wet_probability,
      filename: record.filename,
      timestamp: record.timestamp
    });
  };

  return (
    <div className="min-h-screen p-4 sm:p-6 lg:p-8 max-w-[1600px] mx-auto space-y-6">
      
      {/* Header with System Status */}
      <Header onStatusChange={setIsBackendOnline} />

      {/* Global Error Banner if Backend Error Occurs */}
      {errorBanner && (
        <div className="p-4 rounded-xl bg-rose-500/15 border border-rose-500/40 text-rose-200 text-xs sm:text-sm font-mono flex items-center justify-between gap-3 shadow-[0_0_20px_rgba(244,63,94,0.2)]">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-5 h-5 text-rose-400 shrink-0" />
            <span>{errorBanner}</span>
          </div>
          <button
            onClick={() => setErrorBanner(null)}
            className="text-rose-400 hover:text-white font-bold underline text-xs"
          >
            Dismiss
          </button>
        </div>
      )}

      {!isBackendOnline && (
        <div className="p-4 rounded-xl bg-amber-500/15 border border-amber-500/40 text-amber-200 text-xs sm:text-sm font-mono flex items-center gap-3 shadow-[0_0_20px_rgba(245,158,11,0.2)]">
          <AlertCircle className="w-5 h-5 text-amber-400 shrink-0" />
          <span>
            FastAPI Backend is currently unreachable at <strong className="text-amber-300">http://localhost:8000</strong>. Make sure backend server is started with <code className="bg-amber-950 px-1.5 py-0.5 rounded border border-amber-800 text-amber-300">uvicorn app.main:app --reload</code>.
          </span>
        </div>
      )}

      {/* Main Telemetry Grid Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left Column (5 Cols) - Feed Ingestion & Direct Condition Cards */}
        <div className="lg:col-span-5 space-y-6">
          
          {/* Prominent Track Image Uploader */}
          <ImageUploader onAnalyze={handleAnalyze} isLoading={isAnalyzing} />

          {/* Current Condition Card */}
          <ConditionCard
            condition={currentAnalysis?.condition}
            confidence={currentAnalysis?.confidence}
            isLoading={isAnalyzing}
          />

          {/* Confidence Distribution Breakdown */}
          <ConfidenceChart
            dryProb={currentAnalysis?.dry_probability}
            dampProb={currentAnalysis?.damp_probability}
            wetProb={currentAnalysis?.wet_probability}
            isLoading={isAnalyzing}
          />

        </div>

        {/* Right Column (7 Cols) - Strategy, Risk, & Trend Visualization */}
        <div className="lg:col-span-7 space-y-6">
          
          {/* Tire Strategy Recommendation Card */}
          <StrategyCard
            strategy={strategyData}
            isLoading={isAnalyzing || isLoadingDashboard}
          />

          {/* Telemetry Risk Gauge Indicator */}
          <RiskIndicator
            condition={currentAnalysis?.condition}
            wetProb={currentAnalysis?.wet_probability}
            urgency={strategyData?.pit_stop_urgency}
          />

          {/* Recharts Track Condition Trend Graph */}
          <TrendChart
            sequence={trendData?.sequence}
            trend={trendData?.trend}
            message={trendData?.message}
            isLoading={isLoadingDashboard}
          />

        </div>

      </div>

      {/* Full Width Bottom Panel - Analysis History Table */}
      <div className="w-full pt-2">
        <AnalysisHistory
          history={historyData}
          isLoading={isLoadingDashboard}
          onSelectRecord={handleSelectHistoryRecord}
        />
      </div>

    </div>
  );
}
