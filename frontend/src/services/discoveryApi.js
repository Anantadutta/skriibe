import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:5000/api',
  withCredentials: true
});

export const getLiveCreators = async (params = {}) => {
  const response = await api.get('/public/creators', { params });
  return response.data;
};

export const getCreatorProfile = async (handle) => {
  const response = await api.get(`/public/creator/${handle}`);
  return response.data;
};
