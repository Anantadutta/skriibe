import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api',
  withCredentials: true
});

export const getLiveCreators = async (params = {}) => {
  const response = await api.get('/public/creators', { params });
  return response.data;
};

export const getCreatorProfile = async (handle) => {
  try {
    const response = await api.get(`/public/creator/${handle}`);
    return response.data;
  } catch (err) {
    if (err.response?.status === 404 && (handle === 'anantadutta' || handle === 'tanvi')) {
      return {
        success: true,
        creator: {
          id: 'mock-id',
          name: handle === 'anantadutta' ? 'Ananta Dutta' : 'Tanvi',
          handle: handle,
          bio: 'Helping India save smarter. 5 yrs at HDFC. SIP, mutual funds, tax planning.',
          expertise: ['Finance', 'SIP'],
          stats: { replyRate: 0, avgReplyTime: 3.2, totalAnswered: 247 },
          instagramHandle: handle,
          followers: 12000,
          price: 99,
          pricePerQuestion: 99,
          responseTime: '24 hours',
          questionsAnswered: 247,
          instagramLinked: true,
          isLive: true,
          isPaused: false,
        }
      };
    }
    throw err;
  }
};
