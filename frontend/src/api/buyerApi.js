/**
 * @module buyerApi — Buyer-facing API calls for public question flows.
 */
import api from '../services/api';

export const getCreatorProfile = async (handle) => {
  const cleanHandle = handle?.replace('@', '') || 'anantadutta';
  try {
    const res = await api.get(`/public/creator/${cleanHandle}`);
    return res.data;
  } catch (err) {
    throw err;
  }
};

export const sendBuyerOTP = (phone) =>
  Promise.resolve({ success: true });

export const verifyBuyerOTP = (phone, otp) =>
  Promise.resolve({ success: true, buyerToken: 'mock-buyer-token' });

export const submitQuestion = async (payload) => {
  const res = await api.post(`/buyers/submit-question`, payload);
  return res.data;
};

export const getQuestionHistory = async (phone) => {
  const res = await api.get(`/buyers/history/${phone}`);
  return res.data;
};

export const getSingleQuestion = async (id) => {
  const res = await api.get(`/buyers/question/${id}`);
  return res.data;
};

export const createOrder = (payload) =>
  Promise.resolve({ success: true, keyId: 'mock-key-id', amount: 9900, orderId: 'mock-order-id' });

export const confirmPayment = (payload) =>
  Promise.resolve({ success: true });
