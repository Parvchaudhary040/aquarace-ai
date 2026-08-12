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
 * Upload track image for zero-shot classification
 * @param {File} file - Image file object
 */
export const analyzeImage = async (file) => {
  const formData = new FormData();
  formData.append('file', file);

  const response = await apiClient.post('/analyze', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
  return response.data;
};

/**
 * Fetch historical track condition analysis records
 */
export const getHistory = async () => {
  const response = await apiClient.get('/history');
  return response.data;
};

/**
 * Fetch track condition sequence and overall trend
 */
export const getTrend = async () => {
  const response = await apiClient.get('/trend');
  return response.data;
};

/**
 * Fetch prototype tire strategy recommendation
 */
export const getStrategy = async () => {
  const response = await apiClient.get('/strategy');
  return response.data;
};

/**
 * Check backend system health
 */
export const getHealth = async () => {
  const response = await apiClient.get('/health');
  return response.data;
};

export default apiClient;
