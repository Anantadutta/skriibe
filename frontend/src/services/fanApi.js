import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api',
  withCredentials: true
});

export const fanSignup = (name, email, password, whatsappPhone, whatsappConsent) => {
  return api.post('/fan-auth/signup', { name, email, password, whatsappPhone, whatsappConsent });
};

export const fanLogin = (email, password) => {
  return api.post('/fan-auth/login', { email, password });
};

export const getFanMe = async () => {
  const response = await api.get('/fan-auth/me');
  return response.data;
};

export const updateFanProfile = async (email) => {
  const response = await api.put('/fan-auth/me', { email });
  return response.data;
};

export const getFanHistory = async () => {
  const response = await api.get('/questions/fan-history');
  return response.data;
};

export const flagQuestion = async (id, reason) => {
  const response = await api.post(`/buyers/question/${id}/flag`, { reason });
  return response.data;
};

export const switchRole = async (role) => {
  const response = await api.post('/fan-auth/switch-role', { role });
  return response.data;
};

export const upgradeToCreator = async (creator_name, bio, category) => {
  const response = await api.post('/fan-auth/me/upgrade-to-creator', { creator_name, bio, category });
  return response.data;
};
