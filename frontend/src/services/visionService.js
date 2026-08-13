/**
 * visionService.js
 *
 * In-browser CLIP zero-shot image classification using Transformers.js.
 * Model: Xenova/clip-vit-base-patch32 (ONNX, q4 quantized)
 *
 * Design principles:
 * - Singleton pipeline — only one CLIP instance ever loaded
 * - Lazy initialization — model loads only when first analysis is requested
 * - Memory-efficient — frames processed sequentially, canvases released immediately
 * - No HF_TOKEN required — Xenova models are public
 */

import { pipeline } from '@huggingface/transformers';

// ─── Constants ────────────────────────────────────────────────────────────────

const MODEL_ID = 'Xenova/clip-vit-base-patch32';

// Each class is represented by two complementary prompts. This is more robust
// than relying on one wording for a zero-shot model, while still requiring one
// image embedding and a small set of text embeddings per inference.
const CONDITION_PROMPTS = {
  Dry: [
    'a dry asphalt racing track',
    'a race circuit with a dry racing line',
  ],
  Damp: [
    'a damp asphalt racing track',
    'a race circuit with a moist dark track surface',
  ],
  Wet: [
    'a wet asphalt racing track with standing water',
    'a race circuit with rain puddles and reflections',
  ],
};

const CANDIDATE_LABELS = Object.values(CONDITION_PROMPTS).flat();
const PROMPT_CONDITION = Object.fromEntries(
  Object.entries(CONDITION_PROMPTS).flatMap(([condition, prompts]) =>
    prompts.map((prompt) => [prompt, condition])
  )
);

/** Max dimension (px) to resize a frame before inference to reduce memory usage */
const FRAME_MAX_DIM = 224;

/** Number of frames to sample from a video (1 frame every ~1.5 s, capped) */
const MAX_SAMPLE_FRAMES = 16;

// ─── Singleton pipeline state ─────────────────────────────────────────────────

let _classifier = null;
let _initPromise = null;

/**
 * Lazily initializes and returns the singleton CLIP pipeline.
 * Subsequent calls return the cached promise — the model is only
 * downloaded / initialized once per browser session.
 *
 * @param {Function} [onProgress] - optional callback(message: string)
 * @returns {Promise<Function>} the Transformers.js pipeline function
 */
export async function getClassifier(onProgress) {
  if (_classifier) return _classifier;

  if (_initPromise) return _initPromise;

  _initPromise = (async () => {
    onProgress?.('Loading vision model…');

    _classifier = await pipeline(
      'zero-shot-image-classification',
      MODEL_ID,
      {
        dtype: 'q4',
      }
    );

    onProgress?.('Vision model ready');
    return _classifier;
  })();

  return _initPromise;
}

// ─── Core inference helpers ───────────────────────────────────────────────────

/**
 * Converts a raw pipeline result array into the standard AquaRace analysis
 * object, matching the shape expected by the frontend and backend API contracts.
 *
 * @param {Array<{label: string, score: number}>} results
 * @param {string} [filename]
 * @returns {{ condition, confidence, dry_probability, damp_probability, wet_probability, filename }}
 */
function parseResults(results, filename = 'image') {
  const probabilities = { Dry: 0, Damp: 0, Wet: 0 };
  for (const result of results) {
    const condition = PROMPT_CONDITION[result.label];
    if (condition) probabilities[condition] += result.score;
  }

  const total = Object.values(probabilities).reduce((sum, score) => sum + score, 0) || 1;
  for (const condition of Object.keys(probabilities)) {
    probabilities[condition] = (probabilities[condition] / total) * 100;
  }

  const [condition, confidence] = Object.entries(probabilities)
    .sort(([, left], [, right]) => right - left)[0];

  return {
    filename,
    condition,
    confidence: Math.round(confidence * 100) / 100,
    dry_probability: Math.round(probabilities.Dry * 100) / 100,
    damp_probability: Math.round(probabilities.Damp * 100) / 100,
    wet_probability: Math.round(probabilities.Wet * 100) / 100,
  };
}

/**
 * Runs CLIP zero-shot classification on a single image source.
 *
 * @param {string|HTMLImageElement|HTMLCanvasElement} imageSource - URL or element
 * @param {Function} classifier - initialized pipeline function
 * @returns {Promise<Array>} raw pipeline results
 */
async function runClip(imageSource, classifier) {
  return classifier(imageSource, CANDIDATE_LABELS);
}

/**
 * Reduces single-frame flicker in video classifications by applying a
 * weighted, three-frame moving average to class probabilities.
 * The first and last frames use the available neighbours only.
 */
function stabilizeVideoFrames(frames) {
  const probabilityKeys = ['dry_probability', 'damp_probability', 'wet_probability'];
  const labels = ['Dry', 'Damp', 'Wet'];

  return frames.map((frame, index) => {
    const blended = Object.fromEntries(probabilityKeys.map((key) => [key, 0]));
    let weightTotal = 0;

    for (let offset = -1; offset <= 1; offset++) {
      const neighbour = frames[index + offset];
      if (!neighbour) continue;

      const weight = offset === 0 ? 0.6 : 0.2;
      weightTotal += weight;
      for (const key of probabilityKeys) blended[key] += neighbour[key] * weight;
    }

    for (const key of probabilityKeys) blended[key] /= weightTotal;
    const winner = probabilityKeys.reduce((best, key) => blended[key] > blended[best] ? key : best, probabilityKeys[0]);
    const winnerIndex = probabilityKeys.indexOf(winner);

    return {
      ...frame,
      condition: labels[winnerIndex],
      confidence: Math.round(blended[winner] * 100) / 100,
      dry_probability: Math.round(blended.dry_probability * 100) / 100,
      damp_probability: Math.round(blended.damp_probability * 100) / 100,
      wet_probability: Math.round(blended.wet_probability * 100) / 100,
    };
  });
}

// ─── Public API ───────────────────────────────────────────────────────────────

/**
 * Analyzes a single image File using local CLIP inference.
 *
 * @param {File} file - image file (jpg/png/webp)
 * @param {Function} [onProgress] - callback(message: string)
 * @returns {Promise<object>} AquaRace analysis result
 */
export async function analyzeImageLocally(file, onProgress) {
  const classifier = await getClassifier(onProgress);

  onProgress?.('Analyzing track…');

  const objectUrl = URL.createObjectURL(file);
  try {
    const results = await runClip(objectUrl, classifier);
    onProgress?.('Analysis complete');
    return parseResults(results, file.name);
  } finally {
    URL.revokeObjectURL(objectUrl);
  }
}

// ─── Video frame analysis ─────────────────────────────────────────────────────

/**
 * Computes the timestamps (in seconds) to sample from a video of the given
 * duration. Targets ~1 frame every 1.5 s, capped at MAX_SAMPLE_FRAMES.
 *
 * @param {number} duration - video duration in seconds
 * @returns {number[]} sorted array of timestamps
 */
function computeSampleTimestamps(duration) {
  const desired = Math.max(2, Math.min(MAX_SAMPLE_FRAMES, Math.floor(duration / 1.5)));
  const timestamps = [];
  for (let i = 0; i < desired; i++) {
    timestamps.push((i / (desired - 1)) * duration);
  }
  return timestamps;
}

/**
 * Seeks a <video> element to `time` seconds and waits for it to be ready.
 *
 * @param {HTMLVideoElement} videoEl
 * @param {number} time
 * @returns {Promise<void>}
 */
function seekTo(videoEl, time) {
  return new Promise((resolve, reject) => {
    const onSeeked = () => {
      videoEl.removeEventListener('seeked', onSeeked);
      videoEl.removeEventListener('error', onError);
      resolve();
    };
    const onError = (e) => {
      videoEl.removeEventListener('seeked', onSeeked);
      videoEl.removeEventListener('error', onError);
      reject(e);
    };
    videoEl.addEventListener('seeked', onSeeked, { once: true });
    videoEl.addEventListener('error', onError, { once: true });
    videoEl.currentTime = time;
  });
}

/**
 * Captures the current video frame into a canvas data URL,
 * resizing to FRAME_MAX_DIM px on the longest side.
 *
 * @param {HTMLVideoElement} videoEl
 * @returns {string} data URL (image/jpeg)
 */
function captureFrame(videoEl) {
  const vw = videoEl.videoWidth || 320;
  const vh = videoEl.videoHeight || 240;
  const scale = Math.min(1, FRAME_MAX_DIM / Math.max(vw, vh));
  const w = Math.round(vw * scale);
  const h = Math.round(vh * scale);

  const canvas = document.createElement('canvas');
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext('2d');
  ctx.drawImage(videoEl, 0, 0, w, h);
  const dataUrl = canvas.toDataURL('image/jpeg', 0.85);

  // Explicitly release canvas resources
  canvas.width = 0;
  canvas.height = 0;

  return dataUrl;
}

/**
 * Analyzes a video file by sampling frames locally, running CLIP on each
 * sequentially (never concurrently to avoid memory pressure), then computing
 * the condition sequence, trend, and strategy.
 *
 * @param {File} file - video file
 * @param {Function} [onProgress] - callback(message: string)
 * @returns {Promise<object>} video analysis result (matching VideoAnalysisResponse schema)
 */
export async function analyzeVideoLocally(file, onProgress) {
  const classifier = await getClassifier(onProgress);

  onProgress?.('Loading video…');

  // Create a hidden video element to decode frames in-browser
  const videoEl = document.createElement('video');
  videoEl.muted = true;
  videoEl.playsInline = true;
  videoEl.preload = 'metadata';

  const objectUrl = URL.createObjectURL(file);

  try {
    // Wait for video metadata to load
    await new Promise((resolve, reject) => {
      videoEl.onloadedmetadata = resolve;
      videoEl.onerror = reject;
      videoEl.src = objectUrl;
      videoEl.load();
    });

    const duration = videoEl.duration;
    if (!duration || !isFinite(duration)) {
      throw new Error('Could not determine video duration.');
    }

    const timestamps = computeSampleTimestamps(duration);
    const frameResults = [];

    for (let i = 0; i < timestamps.length; i++) {
      const ts = timestamps[i];
      onProgress?.(`Analyzing frame ${i + 1} of ${timestamps.length}…`);

      // Seek to timestamp
      await seekTo(videoEl, ts);

      // Capture and immediately run inference
      const frameDataUrl = captureFrame(videoEl);
      const results = await runClip(frameDataUrl, classifier);
      const analysis = parseResults(results, file.name);

      frameResults.push({
        timestamp: Math.round(ts * 100) / 100,
        condition: analysis.condition,
        confidence: analysis.confidence,
        dry_probability: analysis.dry_probability,
        damp_probability: analysis.damp_probability,
        wet_probability: analysis.wet_probability,
      });
    }

    const stabilizedFrames = stabilizeVideoFrames(frameResults);
    const stabilizedSequence = stabilizedFrames.map((frame) => frame.condition);

    onProgress?.('Video analysis complete');

    return {
      filename: file.name,
      frames_analyzed: stabilizedFrames.length,
      frames: stabilizedFrames,
      condition_sequence: stabilizedSequence,
    };
  } finally {
    // Clean up
    videoEl.src = '';
    videoEl.load();
    URL.revokeObjectURL(objectUrl);
  }
}
