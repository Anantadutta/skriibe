import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  // You can add headers or interceptors here if needed
});

export default api;
