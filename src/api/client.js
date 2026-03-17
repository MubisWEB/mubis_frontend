import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
});

// Public axios instance — no auth header, no refresh interceptor.
// Use for endpoints that don't require authentication (login, register, etc.)
export const publicApi = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('accessToken');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Single in-flight refresh promise — prevents concurrent 401s from each
// triggering their own refresh (which would rotate the token and cause the
// 2nd/3rd attempts to fail with an already-used refreshToken).
let _refreshing = null;

api.interceptors.response.use(
  (res) => res,
  async (error) => {
    const originalRequest = error.config;

    // Guard: only attempt refresh once per request to prevent infinite loops
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      const refreshToken = localStorage.getItem('refreshToken');
      if (refreshToken) {
        if (!_refreshing) {
          _refreshing = axios.post(
            `${import.meta.env.VITE_API_URL}/auth/refresh`,
            {},
            { headers: { Authorization: `Bearer ${refreshToken}` } }
          ).then(({ data }) => {
            localStorage.setItem('accessToken', data.accessToken);
            localStorage.setItem('refreshToken', data.refreshToken);
            return data.accessToken;
          }).catch(() => {
            localStorage.removeItem('accessToken');
            localStorage.removeItem('refreshToken');
            window.location.href = '/login';
            return null;
          }).finally(() => { _refreshing = null; });
        }
        const newToken = await _refreshing;
        if (newToken) {
          originalRequest.headers.Authorization = `Bearer ${newToken}`;
          return api.request(originalRequest);
        }
      }
    }
    return Promise.reject(error);
  }
);

export default api;
