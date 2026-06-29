/**
 * @file buyerApi.js
 * @description Mock service for public buyer flow API calls (Phase 6).
 */

export const getCreatorProfile = (handle) => {
  const cleanHandle = handle?.replace('@', '') || 'creator';
  return Promise.resolve({
    data: {
      success: true,
      creator: {
        handle: cleanHandle,
        name: cleanHandle,
        bio: 'Fintech creator helping you grow your wealth.',
        pricePerQuestion: 99,
        responseTime: '24 hours',
        questionsAnswered: 42,
        instagramLinked: true,
        instagramHandle: cleanHandle
      }
    }
  });
};

export const getCreatorSamples = (handle) =>
  Promise.resolve({ data: [] });

export const validateQuestion = (questionText) =>
  Promise.resolve({ data: { valid: true } });
