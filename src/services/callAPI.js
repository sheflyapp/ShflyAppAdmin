import axios from 'axios';

// Create axios instance with base configuration
const callAPI = axios.create({
  baseURL: process.env.REACT_APP_API_URL || 
    (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'
      ? 'http://localhost:5000' 
      : 'https://shflyappapi.onrender.com'),
  timeout: 60000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
callAPI.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('adminToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for error handling
callAPI.interceptors.response.use(
  (response) => {
    return response;
  },
  async (error) => {
    if (error.response?.status === 401) {
      // Token expired or invalid
      localStorage.removeItem('adminToken');
      window.location.href = '/login';
    }
    const config = error.config;
    if (error.response?.status === 429 && config && !config._retried) {
      // Rate limited: wait for Retry-After (capped at 30s) and retry once
      config._retried = true;
      const retryAfter = Number(error.response.headers?.['retry-after']) || 1;
      await new Promise((resolve) => setTimeout(resolve, Math.min(retryAfter, 30) * 1000));
      return callAPI(config);
    }
    return Promise.reject(error);
  }
);

export default callAPI;
