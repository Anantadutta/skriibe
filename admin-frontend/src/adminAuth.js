import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
const ADMIN_TOKEN_KEY = 'skriibe_admin_token';

// Send the admin token with every request the admin app makes to the API
axios.interceptors.request.use((config) => {
  const token = localStorage.getItem(ADMIN_TOKEN_KEY);
  if (token && (config.url || '').startsWith(API_URL)) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const loginAdmin = async (username, password) => {
  const res = await axios.post(`${API_URL}/admin/login`, { username, password });
  localStorage.setItem(ADMIN_TOKEN_KEY, res.data.token);
};
