import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:5000/api',
  withCredentials: true
});

export const fanSignup = (name, email, password) => {
  return api.post('/fan-auth/signup', { name, email, password });
};

export const fanLogin = (email, password) => {
  return api.post('/fan-auth/login', { email, password });
};

export const getFanMe = async () => {
  const response = await api.get('/fan-auth/me');
  return response.data;
};

export const getFanHistory = async () => {
  const response = await api.get('/questions/fan-history');
  return response.data;
};
