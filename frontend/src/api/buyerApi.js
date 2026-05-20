/**
 * @module buyerApi — Buyer-facing API calls for skriibe
 */
import api from '../services/creatorApi'; // existing axios instance pointing to backend

export const getCreatorProfile = (handle) =>
  api.get(`/api/public/creator/${handle}`).then((r) => r.data);

export const sendBuyerOTP = (phone) =>
  api.post('/api/buyers/send-otp', { phone }).then((r) => r.data);

export const verifyBuyerOTP = (phone, otp) =>
  api.post('/api/buyers/verify-otp', { phone, otp }).then((r) => r.data);

export const submitQuestion = (payload) =>
  api.post('/api/buyers/submit-question', payload).then((r) => r.data);

export const createOrder = (payload) => api.post('/api/buyers/create-order', payload).then((r) => r.data);
export const confirmPayment = (payload) => api.post('/api/buyers/confirm-payment', payload).then((r) => r.data);
