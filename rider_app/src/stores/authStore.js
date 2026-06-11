import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { authApi, riderApi, setAuthToken } from '../services/api';

const AUTH_TOKEN_KEY = 'authToken';
const AUTH_USER_KEY = 'authUser';
const PENDING_PHONE_KEY = 'pendingApprovalPhone';
const OTP_TTL_MS = 5 * 60 * 1000;

function normalizePhone(phone) {
  const digits = String(phone || '').replace(/\D/g, '');
  if (digits.length === 10) return `+91${digits}`;
  if (digits.length > 10 && digits.startsWith('91')) return `+${digits}`;
  if (String(phone || '').startsWith('+')) return phone;
  return `+${digits}`;
}

export const useAuthStore = create((set, get) => ({
  user: null,
  token: null,
  isLoggedIn: false,
  pendingApproval: false,
  pendingPhone: null,
  isInitializing: true,
  isLoading: false,
  error: null,
  otpChallenge: null,
  signupDraft: null,

  initializeAuth: async () => {
    try {
      const [token, storedUser] = await Promise.all([
        AsyncStorage.getItem(AUTH_TOKEN_KEY),
        AsyncStorage.getItem(AUTH_USER_KEY),
      ]);
      const pendingPhone = await AsyncStorage.getItem(PENDING_PHONE_KEY);

      if (!token) {
        set({
          isInitializing: false,
          isLoggedIn: false,
          pendingApproval: Boolean(pendingPhone),
          pendingPhone,
          user: null,
          token: null,
        });
        return;
      }

      setAuthToken(token);
      const fallbackUser = storedUser ? JSON.parse(storedUser) : null;

      try {
        const response = await riderApi.profile();
        const user = response.data || fallbackUser;
        await AsyncStorage.setItem(AUTH_USER_KEY, JSON.stringify(user));
        set({ user, token, isLoggedIn: true, pendingApproval: false, pendingPhone: null, isInitializing: false, error: null });
      } catch {
        set({ user: fallbackUser, token, isLoggedIn: Boolean(fallbackUser), pendingApproval: false, pendingPhone: null, isInitializing: false });
      }
    } catch (error) {
      setAuthToken(null);
      set({ user: null, token: null, isLoggedIn: false, pendingApproval: false, pendingPhone: null, isInitializing: false, error: error.message });
    }
  },

  sendOtp: async (phone) => {
    const normalizedPhone = normalizePhone(phone);
    set({ isLoading: true, error: null });
    try {
      const response = await authApi.sendOtp(normalizedPhone);
      const challenge = {
        phone: normalizedPhone,
        devOtp: response.data?.devOtp || null,
        provider: response.data?.provider || 'unknown',
        expiresAt: Date.now() + OTP_TTL_MS,
      };
      set({ isLoading: false, otpChallenge: challenge });
      return normalizedPhone;
    } catch (error) {
      set({ isLoading: false, error: error.message });
      throw error;
    }
  },

  checkRiderStatus: async (phone) => {
    const normalizedPhone = normalizePhone(phone);
    set({ isLoading: true, error: null });
    try {
      const response = await authApi.riderStatus(normalizedPhone);
      set({ isLoading: false });
      return response.data;
    } catch (error) {
      set({ isLoading: false, error: error.message });
      throw error;
    }
  },

  signupRider: async ({ name, phone, email, vehicleNumber }) => {
    const normalizedPhone = normalizePhone(phone);
    set({ isLoading: true, error: null });
    try {
      const response = await authApi.riderSignup({
        name,
        phone: normalizedPhone,
        email,
        vehicleNumber,
      });
      await AsyncStorage.setItem(PENDING_PHONE_KEY, normalizedPhone);
      set({
        isLoading: false,
        otpChallenge: null,
        signupDraft: { name, phone: normalizedPhone, email, vehicleNumber },
        pendingApproval: true,
        pendingPhone: normalizedPhone,
      });
      return normalizedPhone;
    } catch (error) {
      set({ isLoading: false, error: error.message });
      throw error;
    }
  },

  verifyOtp: async (phone, otp) => {
    const normalizedPhone = normalizePhone(phone);
    set({ isLoading: true, error: null });
    try {
      const response = await authApi.verifyOtp(normalizedPhone, otp);
      const { token, user, requiresSignup, pendingApproval, approvalStatus } = response.data;

      if (requiresSignup) {
        set({ isLoading: false, error: null, otpChallenge: null, signupDraft: { phone: normalizedPhone } });
        return { requiresSignup: true, phone: normalizedPhone };
      }

      if (pendingApproval || approvalStatus === 'PENDING') {
        await AsyncStorage.setItem(PENDING_PHONE_KEY, normalizedPhone);
        set({
          isLoading: false,
          error: null,
          otpChallenge: null,
          pendingApproval: true,
          pendingPhone: normalizedPhone,
          isLoggedIn: false,
        });
        return { pendingApproval: true, phone: normalizedPhone };
      }

      setAuthToken(token);
      await Promise.all([
        AsyncStorage.setItem(AUTH_TOKEN_KEY, token),
        AsyncStorage.setItem(AUTH_USER_KEY, JSON.stringify(user)),
        AsyncStorage.removeItem(PENDING_PHONE_KEY),
      ]);

      set({ user, token, isLoggedIn: true, pendingApproval: false, pendingPhone: null, isLoading: false, error: null, otpChallenge: null, signupDraft: null });
      return { user };
    } catch (error) {
      set({ isLoading: false, error: error.message });
      throw error;
    }
  },

  logout: async () => {
    await Promise.all([
      AsyncStorage.removeItem(AUTH_TOKEN_KEY),
      AsyncStorage.removeItem(AUTH_USER_KEY),
      AsyncStorage.removeItem(PENDING_PHONE_KEY),
    ]);
    setAuthToken(null);
    set({ user: null, token: null, isLoggedIn: false, pendingApproval: false, pendingPhone: null, error: null, otpChallenge: null, signupDraft: null });
  },

  clearPendingApproval: async () => {
    await AsyncStorage.removeItem(PENDING_PHONE_KEY);
    set({ pendingApproval: false, pendingPhone: null, signupDraft: null, error: null });
  },

  clearError: () => set({ error: null }),
  setError: (message) => set({ error: message }),

  checkAuth: async () => get().initializeAuth(),
}));
