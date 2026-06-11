import axios from 'axios';

const API_BASE_URL = process.env.EXPO_PUBLIC_API_BASE_URL || 'http://localhost:8080';

export const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 15000,
  headers: {
    'Content-Type': 'application/json',
  },
});

let authToken = null;

export function setAuthToken(token) {
  authToken = token || null;
}

api.interceptors.request.use((config) => {
  if (authToken) {
    config.headers.Authorization = `Bearer ${authToken}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    const message = error.response?.data?.message
      || error.response?.data?.error
      || error.message
      || 'REQUEST_FAILED';
    return Promise.reject(new Error(message));
  },
);

export const authApi = {
  sendOtp: (phone) => api.post('/send-otp', { phone }),
  verifyOtp: (phone, otp) => api.post('/verify-otp', { phone, otp }),
};

export const riderApi = {
  profile: () => api.get('/profile'),
  goOnline: (latitude, longitude) => api.post('/online', { latitude, longitude }),
  goOffline: () => api.post('/offline'),
  orders: () => api.get('/orders'),
  earnings: () => api.get('/earnings'),
  wallet: () => api.get('/wallet'),
};
