// Get API base URL from environment or use production default
const getApiBaseUrl = () => {
  // Check if we're in a React environment with process.env available
  if (
    typeof process !== "undefined" &&
    process.env &&
    process.env.REACT_APP_API_URL
  ) {
    return process.env.REACT_APP_API_URL;
  }
  // Fallback to new production URL
  return "https://aihealthcheck-zzqr.onrender.com";
};

export const API_BASE_URL = getApiBaseUrl();

// API endpoints
export const API_ENDPOINTS = {
  // Auth endpoints
  SIGNUP: `${API_BASE_URL}/auth/signup`,
  LOGIN: `${API_BASE_URL}/auth/login`,
  PROFILE: `${API_BASE_URL}/auth/profile`,

  // Medibot endpoints
  PROCESS: `${API_BASE_URL}/medibot/process`,
  HISTORY: `${API_BASE_URL}/medibot/history`,

  // Health check
  HEALTH: `${API_BASE_URL}/health`,
  STATUS: `${API_BASE_URL}/api/status`,
};

// Helper functions for dynamic URLs
export const getImageUrl = (imagePath) => {
  if (!imagePath) return null;
  return `${API_BASE_URL}/${imagePath}`;
};

export const getAudioUrl = (audioPath) => {
  if (!audioPath) return null;
  return `${API_BASE_URL}/${audioPath}`;
};

export const getHistoryItemUrl = (id) => {
  return `${API_BASE_URL}/medibot/history/${id}`;
};

// Utility function to fix localhost URLs from backend responses
export const fixBackendUrl = (url) => {
  if (!url) return url;
  return url
    .replace('http://localhost:8080', API_BASE_URL)
    .replace('https://aihealthcheck-scoe.onrender.com', API_BASE_URL);
};

export default {
  API_BASE_URL,
  API_ENDPOINTS,
  getImageUrl,
  getAudioUrl,
  getHistoryItemUrl,
};
