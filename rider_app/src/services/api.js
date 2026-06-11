import axios from 'axios';

const API_BASE_URL = process.env.EXPO_PUBLIC_API_BASE_URL || 'http://localhost:8080';

const ERROR_MESSAGES = {
  OTP_RATE_LIMITED: 'Too many OTP attempts. Please wait a few minutes and try again.',
  OTP_PROVIDER_NOT_CONFIGURED: 'OTP service is not configured yet. Please contact support.',
  OTP_DELIVERY_FAILED: 'We could not send the OTP. Please try again.',
  OTP_VERIFICATION_FAILED: 'We could not verify the OTP. Please try again.',
  INVALID_OTP: 'The OTP is incorrect or expired.',
  VALIDATION_ERROR: 'Please check the entered details.',
  AUTH_REQUIRED: 'Please login again.',
  INVALID_TOKEN: 'Your session expired. Please login again.',
  NETWORK_ERROR: 'Network error. Check your connection and API URL.',
};

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
    const code = error.response?.data?.error;
    const message = ERROR_MESSAGES[code]
      || error.response?.data?.message
      || code
      || (error.request ? ERROR_MESSAGES.NETWORK_ERROR : error.message)
      || 'Request failed. Please try again.';
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
