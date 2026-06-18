import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api',
  withCredentials: true,
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('skriibe_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => {
    // Automatically save token if it's provided in the response payload
    if (response.data && response.data.token) {
      localStorage.setItem('skriibe_token', response.data.token);
    }
    return response;
  },
  (error) => {
    if (error.response && error.response.status === 401) {
      // Only redirect if we're not already on a login page to avoid loops
      const path = window.location.pathname;
      if (!path.includes('/login') && !path.includes('/signup')) {
        if (path.startsWith('/creator') || path.startsWith('/onboard') || path.startsWith('/dashboard')) {
          window.location.href = '/creator/login';
        } else if (path.startsWith('/fan')) {
          window.location.href = '/fan/login';
        }
      }
    }
    return Promise.reject(error);
  }
);

export default api;
