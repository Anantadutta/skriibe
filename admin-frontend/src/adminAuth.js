import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
const ADMIN_TOKEN_KEY = 'skriibe_admin_token';

// Send the admin token with every request the admin app makes to the API
axios.interceptors.request.use((config) => {
  const token = localStorage.getItem(ADMIN_TOKEN_KEY);
  const requestUrl = new URL(config.url || '', config.baseURL || window.location.origin);
  const apiUrl = new URL(API_URL, window.location.origin);
  if (token && requestUrl.origin === apiUrl.origin && requestUrl.pathname.startsWith(apiUrl.pathname)) {
    config.headers = config.headers || {};
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const validateAdminSession = async () => {
  if (!localStorage.getItem(ADMIN_TOKEN_KEY)) return false;
  try {
    await axios.get(`${API_URL}/admin/me`);
    return true;
  } catch {
    localStorage.removeItem(ADMIN_TOKEN_KEY);
    return false;
  }
};

export const loginAdmin = async (username, password) => {
  const res = await axios.post(`${API_URL}/admin/login`, { username, password });
  if (!res.data?.token) throw new Error('Admin login response did not include a token');
  localStorage.setItem(ADMIN_TOKEN_KEY, res.data.token);
};
