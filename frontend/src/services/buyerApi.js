/**
 * @file buyerApi.js
 * @description Axios service for public buyer flow API calls.
 */

import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:5000',
  withCredentials: true,
});

export const getCreatorProfile = (handle) =>
  api.get(`/api/creators/${handle}`);

export const getCreatorSamples = (handle) =>
  api.get(`/api/creators/${handle}/samples`);

export const validateQuestion = (questionText) =>
  api.post('/api/questions/validate', { questionText });

export default api;
