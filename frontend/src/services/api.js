import axios from 'axios';

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

export const analyzeImage = async (file) => {
  const formData = new FormData();
  formData.append('file', file);

  try {
    const response = await apiClient.post('/analyze', formData);
    return response.data;
  } catch (err) {
    handleApiError(err);
  }
};

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

export const analyzeVideo = async (file) => {
  const formData = new FormData();
  formData.append('file', file);

  try {
    const response = await apiClient.post('/analyze-video', formData, {
      timeout: 120000,
    });

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