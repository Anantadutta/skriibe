/**
 * @module buyerApi — Buyer-facing API calls for skriibe (fully mocked for Phase 6)
 */

export const getCreatorProfile = (handle) => {
  const cleanHandle = handle?.replace('@', '') || 'anantadutta';
  return Promise.resolve({
    success: true,
    creator: {
      handle: cleanHandle,
      name: cleanHandle === 'anantadutta' ? 'Ananta Dutta' : cleanHandle,
      bio: 'Fintech creator helping you grow your wealth.',
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

export const submitQuestion = (payload) =>
  Promise.resolve({ success: true });

export const createOrder = (payload) =>
  Promise.resolve({ success: true, keyId: 'mock-key-id', amount: 9900, orderId: 'mock-order-id' });

export const confirmPayment = (payload) =>
  Promise.resolve({ success: true });
