import api from './api';

export const getLiveCreators = async (params = {}) => {
  const response = await api.get('/public/creators', { params });
  return response.data;
};

export const getCreatorProfile = async (handle) => {
  try {
    const cleanHandle = handle?.replace(/^@/, '') || handle;
    const response = await api.get(`/public/creator/${cleanHandle}`);
    return response.data;
  } catch (err) {
    throw err;
  }
};
