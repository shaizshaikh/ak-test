// API Configuration
const isDevelopment = import.meta.env.MODE === 'development' || window.location.hostname === 'localhost';

// Get backend URL from runtime config, environment variable, or fallback
const getBackendUrl = () => {
  if (isDevelopment) {
    return "http://localhost:5000";
  }
  
  // For Azure Web App deployment, backend and frontend are served from same origin
  return window.location.origin;
};

export const API_CONFIG = {
  BACKEND_URL: getBackendUrl(),
  
  FRONTEND_URL: isDevelopment 
    ? "http://localhost:5000"  // Changed from 5173 to 5000
    : window.location.origin,
    
  EXAMINER_API: "/api/examiner",
  RESULTS_API: "/api/results",
  HEALTH_API: "/api/health"
};

// Helper functions
export const getBackendURL = () => API_CONFIG.BACKEND_URL;
export const getExaminerAPI = () => `${API_CONFIG.BACKEND_URL}${API_CONFIG.EXAMINER_API}`;
export const getResultsAPI = () => `${API_CONFIG.BACKEND_URL}${API_CONFIG.RESULTS_API}`;
export const getSocketURL = () => API_CONFIG.BACKEND_URL;
export const getFrontendURL = () => API_CONFIG.FRONTEND_URL;