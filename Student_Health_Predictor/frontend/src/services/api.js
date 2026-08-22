import axios from 'axios';

// Dynamically set API URL depending on build environment (Render-ready!)
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Auto-inject JWT token into every request header
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export const authAPI = {
  register: (name, email, password) => api.post('/api/auth/register', { name, email, password }),
  login: (email, password) => {
    const params = new URLSearchParams();
    params.append('username', email);
    params.append('password', password);
    return api.post('/api/auth/login', params, {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
      }
    });
  },
  getProfile: () => api.get('/api/auth/profile'),
};

export const predictionAPI = {
  submit: (data) => api.post('/api/predictions/', data),
  getHistory: () => api.get('/api/predictions/history'),
  getReportUrl: (predId) => `${API_URL}/api/predictions/${predId}/report?token=${localStorage.getItem('token')}`,
};

export const chatbotAPI = {
  sendMessage: (message) => api.post('/api/chatbot/', { message }),
};

export const analyticsAPI = {
  getTrends: () => api.get('/api/analytics/trends'),
};

export const adminAPI = {
  getDashboard: () => api.get('/api/admin/dashboard'),
};

export default api;
