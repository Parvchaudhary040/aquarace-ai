import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000/api';

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Accept': 'application/json',
  },
  timeout: 60000, // 60s timeout for HF model inference
});

/**
 * Wrap errors with a user-friendly message
 */
const handleApiError = (err) => {
  console.error('[API Error]', err);
  throw new Error("Unable to connect to the AI backend. Make sure the backend is running.");
};

/**
 * Upload track image for zero-shot classification
 * @param {File} file - Image file object
 */
export const analyzeImage = async (file) => {
  const formData = new FormData();
  formData.append('file', file);

  try {
    const response = await apiClient.post('/analyze', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  } catch (err) {
    handleApiError(err);
  }
};

/**
 * Fetch historical track condition analysis records
 */
export const getHistory = async () => {
  try {
    const response = await apiClient.get('/history');
    return response.data;
  } catch (err) {
    handleApiError(err);
  }
};

/**
 * Fetch track condition sequence and overall trend
 */
export const getTrend = async () => {
  try {
    const response = await apiClient.get('/trend');
    return response.data;
  } catch (err) {
    handleApiError(err);
  }
};

/**
 * Fetch prototype tire strategy recommendation
 */
export const getStrategy = async () => {
  try {
    const response = await apiClient.get('/strategy');
    return response.data;
  } catch (err) {
    handleApiError(err);
  }
};

/**
 * Upload track video for multi-frame classification & sequence trend analysis
 * @param {File} file - Video file object
 */
export const analyzeVideo = async (file) => {
  const formData = new FormData();
  formData.append('file', file);

  try {
    const response = await apiClient.post('/analyze-video', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
      timeout: 120000, // 120s timeout for video frame processing
    });
    return response.data;
  } catch (err) {
    handleApiError(err);
  }
};

/**
 * Check backend system health
 */
export const getHealth = async () => {
  try {
    const response = await apiClient.get('/health');
    return response.data;
  } catch (err) {
    handleApiError(err);
  }
};

export default apiClient;

