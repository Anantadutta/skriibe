/**
 * @file creatorApi.js
 * @description Mock service for creator API calls (Phase 6).
 */

// Auth Routes
import api from './api';

export const emailSignup = (email, password) => api.post('/creators/email-signup', { email, password });
export const emailLogin = (email, password) => api.post('/creators/email-login', { email, password });
export const sendOTP = (phone) => api.post('/creators/send-otp', { phone });
export const verifyOTP = (phone, code) => api.post('/creators/verify-otp', { phone, code });

export const checkHandle = (handle) => api.post('/creators/check-handle', { handle });

// Creator Routes
export const getMe = async () => {
  const res = await api.get('/creators/me');
  return res.data;
};

export const saveProfile = (data) => api.post('/creators/onboarding/profile', data);

export const savePricing = (data) => api.post('/creators/onboarding/pricing', data);

export const toggleLive = (isLive) => api.post('/creators/toggle-live', { isLive });

export const linkBank = (data) => api.post('/creator/verify-bank', data);

export const verifyIfsc = (ifsc) => api.post('/creator/verify-ifsc', { ifsc });

export const logout = () => api.post('/creators/logout');

export const uploadAvatar = (formData) => api.post('/creators/avatar', formData, {
  headers: { 'Content-Type': 'multipart/form-data' }
});

export default {};
