/**
 * @file creatorApi.js
 * @description Mock service for creator API calls (Phase 6).
 */

// Auth Routes
import api from './api';

export const sendOTP = (phone) => api.post('/creators/send-otp', { phone });

export const verifyOTP = (phone, otp) => api.post('/creators/verify-otp', { phone, otp });

export const checkHandle = (handle) => api.post('/creators/check-handle', { handle });

// Creator Routes
export const getMe = async () => {
  const res = await api.get('/creators/me');
  return res.data;
};

export const saveProfile = (data) => api.post('/creators/onboarding/profile', data);

export const savePricing = (data) => api.post('/creators/onboarding/pricing', data);

export const logout = () => api.post('/creators/logout');

export default {};
