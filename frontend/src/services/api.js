import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api',
  withCredentials: true,
  // You can add headers or interceptors here if needed
});
api.interceptors.response.use(
  (response) => response,
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
