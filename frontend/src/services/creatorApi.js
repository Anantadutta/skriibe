/**
 * @file creatorApi.js
 * @description Axios service for creator API calls.
 */

import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:5000',
  withCredentials: true,
});

// Auth Routes
export const sendOTP = (phone) => 
  api.post('/api/auth/send-otp', { phone });

export const verifyOTP = (phone, otp) => 
  api.post('/api/auth/verify-otp', { phone, otp });

export const checkHandle = (handle) =>
  api.post('/api/auth/check-handle', { handle });

// Creator Routes
export const getMe = () => 
  api.get('/api/creator/me');

export const saveProfile = (data) => 
  api.post('/api/creator/profile', data);

export const savePricing = (data) => 
  api.post('/api/creator/activate', data);

export const logout = () => 
  api.post('/api/creator/logout');

export default api;
