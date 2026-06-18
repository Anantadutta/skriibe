import api from './api';

export const getLiveCreators = async (params = {}) => {
  const response = await api.get('/public/creators', { params });
  return response.data;
};

export const getCreatorProfile = async (handle) => {
  try {
    const response = await api.get(`/public/creator/${handle}`);
    return response.data;
  } catch (err) {
    throw err;
  }
};
