/**
 * @module buyerApi — Buyer-facing API calls for skriibe (fully mocked for Phase 6)
 */
import axios from 'axios';
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

export const getCreatorProfile = (handle) => {
  const cleanHandle = handle?.replace('@', '') || 'anantadutta';
  return Promise.resolve({
    success: true,
    creator: {
      handle: cleanHandle,
      name: cleanHandle === 'anantadutta' ? 'Ananta Dutta' : cleanHandle,
      bio: 'Helping India save smarter. 5 yrs at HDFC. SIP, mutual funds, tax planning.',
      pricePerQuestion: 99,
      responseTime: '24 hours',
      questionsAnswered: 42,
      instagramLinked: true,
      instagramHandle: cleanHandle
    }
  });
};

export const sendBuyerOTP = (phone) =>
  Promise.resolve({ success: true });

export const verifyBuyerOTP = (phone, otp) =>
  Promise.resolve({ success: true, buyerToken: 'mock-buyer-token' });

export const submitQuestion = async (payload) => {
  const res = await axios.post(`${API_URL}/buyers/submit-question`, payload);
  return res.data;
};

export const getQuestionHistory = async (phone) => {
  const res = await axios.get(`${API_URL}/buyers/history/${phone}`);
  return res.data;
};

export const getSingleQuestion = async (id) => {
  const res = await axios.get(`${API_URL}/buyers/question/${id}`);
  return res.data;
};

export const createOrder = (payload) =>
  Promise.resolve({ success: true, keyId: 'mock-key-id', amount: 9900, orderId: 'mock-order-id' });

export const confirmPayment = (payload) =>
  Promise.resolve({ success: true });
