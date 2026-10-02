import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api',
  withCredentials: true,
});

api.interceptors.request.use((config) => {
  const url = config.url || '';
  const path = window.location.pathname;
  
  let token = null;

  // Determine token based on request URL or current page path
  const isCreatorProfilePage = /^\/creator\/(?!dashboard|inbox|analytics|payouts|setup-payouts|settings|scheduling|health|notifications|auth|signup|login|forgot-password|reset-password|verify-otp|connect-instagram)[^\/]+(\/.*)?$/.test(path);

  // If the request explicitly asks for fan endpoints, or if we are on a fan page, OR if we are on a public creator profile page
  if (url.includes('/fan-auth') || url.includes('/fan') || path.startsWith('/fan') || path.startsWith('/explore') || path.startsWith('/discovery') || isCreatorProfilePage) {
    token = localStorage.getItem('skriibe_fan_token');
  } else if (url.includes('/creator') || url.includes('/creators') || path.startsWith('/creator') || path.startsWith('/dashboard') || path.startsWith('/onboard')) {
    token = localStorage.getItem('skriibe_creator_token');
  }
  
  // Fallback to legacy active token if specific token not found
  if (!token) {
    token = localStorage.getItem('skriibe_token');
  }

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => {
    // Legacy token auto-save for simple API calls (AuthContext setAuthData handles the specific ones)
    if (response.data && response.data.token && !response.config.url.includes('/login') && !response.config.url.includes('/signup')) {
      localStorage.setItem('skriibe_token', response.data.token);
      window.dispatchEvent(new Event('skriibe:auth'));
    }
    return response;
  },
  (error) => {
    if (error.response && error.response.status === 401) {
      const url = error.config.url || '';
      
      // Selectively clear the failing token
      if (url.includes('/creator') || url.includes('/creators')) {
        localStorage.removeItem('skriibe_creator_token');
        localStorage.removeItem('isReturningCreator');
      } else if (url.includes('/fan-auth') || url.includes('/fan')) {
        localStorage.removeItem('skriibe_fan_token');
      } else {
        localStorage.removeItem('skriibe_token');
        localStorage.removeItem('skriibe_creator_token');
        localStorage.removeItem('skriibe_fan_token');
        localStorage.removeItem('isReturningCreator');
      }
      
      window.dispatchEvent(new Event('skriibe:auth'));

      // Only redirect if we're not already on a login page to avoid loops
      const path = window.location.pathname;
      if (!path.includes('/login') && !path.includes('/signup')) {
        const isCreatorProfilePage = /^\/creator\/(?!dashboard|inbox|analytics|payouts|setup-payouts|settings|scheduling|health|notifications|auth|signup|login|forgot-password|reset-password|verify-otp|connect-instagram)[^\/]+(\/.*)?$/.test(path);
        
        if (isCreatorProfilePage) {
          // Do not force redirect on public creator profile pages. 
          // The component will handle the 401 gracefully.
        } else if (path.startsWith('/creator') || path.startsWith('/onboard') || path.startsWith('/dashboard')) {
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
