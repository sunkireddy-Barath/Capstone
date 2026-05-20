import axios from 'axios';
import { useAuthStore } from '../store/authStore';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '/api',
  timeout: 15000,
  headers: { 'Content-Type': 'application/json' },
});

// Attach JWT access token to every request
api.interceptors.request.use((config) => {
  const token = useAuthStore.getState().accessToken;
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Auto-refresh on 401
api.interceptors.response.use(
  (res) => res,
  async (err) => {
    const original = err.config;
    if (err.response?.status === 401 && !original._retry) {
      original._retry = true;
      try {
        const refreshToken = useAuthStore.getState().refreshToken;
        const { data } = await axios.post('/api/auth/refresh', { refreshToken });
        useAuthStore.getState().setTokens(data.data.accessToken, data.data.refreshToken);
        original.headers.Authorization = `Bearer ${data.data.accessToken}`;
        return api(original);
      } catch {
        useAuthStore.getState().logout();
        window.location.href = '/login';
      }
    }
    return Promise.reject(err);
  }
);

export default api;

// ─── Auth ─────────────────────────────────────────────────────────────────────
export const authApi = {
  register: (data) => api.post('/auth/register', data),
  login: (data) => api.post('/auth/login', data),
  logout: () => api.post('/auth/logout'),
  getProfile: () => api.get('/auth/profile'),
  updateProfile: (data) => api.put('/auth/profile', data),
  changePassword: (data) => api.put('/auth/change-password', data),
};

// ─── B2B ──────────────────────────────────────────────────────────────────────
export const b2bApi = {
  getDashboard: () => api.get('/b2b/dashboard'),
  getAnalytics: (days = 30) => api.get(`/b2b/analytics?days=${days}`),
  createApiKey: (data) => api.post('/b2b/api-keys', data),
  listApiKeys: () => api.get('/b2b/api-keys'),
  revokeApiKey: (id) => api.delete(`/b2b/api-keys/${id}`),
  upgradePlan: (planType) => api.put('/b2b/plan', { planType }),
  createPaymentOrder: (planType) => api.post('/b2b/payment/create-order', { planType }),
  verifyPayment: (data) => api.post('/b2b/payment/verify', data),
};

// ─── Admin ────────────────────────────────────────────────────────────────────
export const adminApi = {
  getStats: () => api.get('/admin/stats'),
  getDailyUsage: (days = 30) => api.get(`/admin/analytics/daily?days=${days}`),
  getTopEndpoints: () => api.get('/admin/analytics/endpoints'),
  getLogs: (params) => api.get('/admin/logs', { params }),
  getUsers: (params) => api.get('/admin/users', { params }),
  getUser: (id) => api.get(`/admin/users/${id}`),
  updateUser: (id, data) => api.put(`/admin/users/${id}`, data),
  getApiKeys: (params) => api.get('/admin/api-keys', { params }),
};
