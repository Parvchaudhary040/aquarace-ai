/**
 * api.js
 *
 * All communication with the Render backend.
 *
 * Image / video inference is now performed locally in the browser
 * using visionService.js (Transformers.js + Xenova/clip-vit-base-patch32).
 * The resulting structured data is persisted to the backend database
 * via lean JSON endpoints so that /api/history, /api/trend, and
 * /api/strategy continue to work exactly as before.
 *
 * Backend APIs kept:
 *   GET  /api/health
 *   GET  /api/history
 *   GET  /api/trend
 *   GET  /api/strategy
 *   POST /api/record-analysis   ← new: accepts pre-computed JSON
 *   POST /api/record-video      ← new: accepts pre-computed JSON
 *
 * The old POST /api/analyze and POST /api/analyze-video endpoints on the
 * backend have been updated to accept pre-computed JSON instead of running
 * Hugging Face inference. This frontend calls them with JSON bodies.
 */

import axios from 'axios';
import { analyzeImageLocally, analyzeVideoLocally } from './visionService';

const API_BASE_URL =
  import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000/api';

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    Accept: 'application/json',
  },
  timeout: 60000,
});

const handleApiError = (err) => {
  console.error('[API Error]', err);

  const message =
    err.response?.data?.detail ||
    err.response?.data?.message ||
    'Unable to connect to the AI backend.';

  throw new Error(message);
};

// ─── Image Analysis ───────────────────────────────────────────────────────────

/**
 * Analyzes a track image using in-browser CLIP inference, then persists the
 * result to the backend database for history / trend / strategy consumption.
 *
 * @param {File} file
 * @param {Function} [onProgress] - optional callback(message: string)
 * @returns {Promise<object>} AnalysisResponse-compatible object
 */
export const analyzeImage = async (file, onProgress) => {
  // 1. Run local CLIP inference (no HF_TOKEN, no server-side vision call)
  const localResult = await analyzeImageLocally(file, onProgress);

  // 2. Persist to backend DB so history/trend/strategy stay accurate
  try {
    onProgress?.('Saving to telemetry database…');
    const response = await apiClient.post('/record-analysis', localResult);
    // Backend returns the full AnalysisResponse (with id, timestamp, etc.)
    return response.data;
  } catch (err) {
    // If backend is unreachable, still return the local inference result
    // so the UI is functional even in an offline/degraded state.
    console.warn('[API] Backend persist failed; returning local result:', err.message);
    return {
      ...localResult,
      id: Date.now(),
      timestamp: new Date().toISOString(),
    };
  }
};

// ─── Video Analysis ───────────────────────────────────────────────────────────

/**
 * Analyzes a track video by sampling frames using in-browser CLIP inference,
 * then sends the structured result to the backend for DB persistence and
 * trend / strategy computation.
 *
 * @param {File} file
 * @param {Function} [onProgress] - optional callback(message: string)
 * @returns {Promise<object>} VideoAnalysisResponse-compatible object
 */
export const analyzeVideo = async (file, onProgress) => {
  // 1. Run local frame-by-frame CLIP inference
  const localResult = await analyzeVideoLocally(file, onProgress);

  // 2. Send to backend for trend/strategy computation and DB persistence
  try {
    onProgress?.('Computing strategy…');
    const response = await apiClient.post('/record-video', localResult, {
      timeout: 30000,
    });
    return response.data;
  } catch (err) {
    // Backend unreachable: compute trend/strategy client-side as fallback
    console.warn('[API] Backend video persist failed; using local fallback:', err.message);
    const trendFallback = computeLocalTrend(localResult.condition_sequence);
    const strategyFallback = computeLocalStrategy(
      trendFallback.condition,
      trendFallback.trend
    );
    return {
      ...localResult,
      trend: trendFallback,
      strategy: strategyFallback,
    };
  }
};

// ─── Fallback local trend / strategy (mirrors backend logic) ──────────────────

const CONDITION_SCORES = { wet: 3, damp: 2, drying: 1, dry: 0 };

function computeLocalTrend(sequence) {
  const norm = (sequence || []).map((s) => s.toLowerCase());
  if (norm.length < 2) {
    return {
      sequence,
      trend: 'stable',
      condition: norm[0] || 'dry',
      message: 'Insufficient data to determine trend.',
    };
  }
  const scores = norm.map((c) => CONDITION_SCORES[c] ?? 0);
  const totalDelta = scores[scores.length - 1] - scores[0];
  let trend, condition, message;
  if (totalDelta < 0) {
    trend = 'improving';
    condition = 'drying';
    message = 'Track conditions are progressively drying.';
  } else if (totalDelta > 0) {
    trend = 'deteriorating';
    condition = norm[norm.length - 1];
    message = 'Track conditions are becoming progressively wetter.';
  } else {
    trend = 'stable';
    condition = norm[norm.length - 1];
    message = 'Track conditions are relatively stable.';
  }
  return { sequence, trend, condition, message };
}

function computeLocalStrategy(condition, trend) {
  const cond = (condition || 'dry').toLowerCase();
  const tr = (trend || 'stable').toLowerCase();
  const tireMap = { dry: 'slick', wet: 'wet', damp: 'intermediate', drying: 'intermediate' };
  let recommendation = 'Recommend dry-weather tire strategy';
  let urgency = 'low';
  let reason = 'Track condition analysis complete.';

  if (cond === 'wet') {
    if (tr === 'improving') { recommendation = 'Recommend monitoring the drying transition'; urgency = 'medium'; reason = 'Track is wet but drying. Monitor crossover to intermediate tires.'; }
    else if (tr === 'deteriorating') { recommendation = 'Recommend wet-weather tire strategy'; urgency = 'high'; reason = 'Track conditions are heavily wet and worsening.'; }
    else { recommendation = 'Recommend staying on wet/intermediate setup'; urgency = 'low'; reason = 'Track remains consistently wet with stable moisture.'; }
  } else if (cond === 'damp') {
    if (tr === 'improving') { recommendation = 'Recommend preparing for a tire transition'; urgency = 'medium'; reason = 'Track moisture is decreasing. Prepare for potential slick transition.'; }
    else if (tr === 'deteriorating') { recommendation = 'Recommend wet-weather tire strategy'; urgency = 'high'; reason = 'Track moisture is increasing rapidly.'; }
    else { recommendation = 'Recommend intermediate tire'; urgency = 'low'; reason = 'Track remains damp with stable moisture. Intermediates optimal.'; }
  } else if (cond === 'drying') {
    if (tr === 'improving') { recommendation = 'Prepare for slick-tire transition'; urgency = 'high'; reason = 'Track drying rapidly — slick crossover window approaching.'; }
    else { recommendation = 'Recommend preparing for a tire transition'; urgency = 'medium'; reason = 'Track is drying and stabilizing. Prepare for slick crossover.'; }
  }

  return {
    current_condition: cond,
    trend: tr,
    current_tire: tireMap[cond] || 'slick',
    recommendation,
    urgency,
    reason,
  };
}

// ─── Backend Data APIs (unchanged) ───────────────────────────────────────────

export const getHistory = async () => {
  try {
    const response = await apiClient.get('/history');
    return response.data;
  } catch (err) {
    handleApiError(err);
  }
};

export const getTrend = async () => {
  try {
    const response = await apiClient.get('/trend');
    return response.data;
  } catch (err) {
    handleApiError(err);
  }
};

export const getStrategy = async () => {
  try {
    const response = await apiClient.get('/strategy');
    return response.data;
  } catch (err) {
    handleApiError(err);
  }
};

export const getHealth = async () => {
  try {
    const response = await apiClient.get('/health');
    return response.data;
  } catch (err) {
    handleApiError(err);
  }
};

export default apiClient;