/**
 * @file creatorApi.js
 * @description Axios service for creator API calls.
 */

import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:5000',
  withCredentials: true,
});

export const sendOTP = (phone) => 
  api.post('/api/creators/send-otp', { phone });

export const verifyOTP = (phone, otp) => 
  api.post('/api/creators/verify-otp', { phone, otp });

export const getMe = () => 
  api.get('/api/creators/me');

export const checkHandle = (handle) => 
  api.post('/api/creators/check-handle', { handle });

export const saveProfile = (data) => 
  api.post('/api/creators/onboarding/profile', data);

export const savePricing = (data) => 
  api.post('/api/creators/onboarding/pricing', data);

export const logout = () => 
  api.post('/api/creators/logout');

export default api;
