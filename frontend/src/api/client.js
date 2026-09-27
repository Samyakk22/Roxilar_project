import axios from 'axios';

export const TOKEN_KEY = 'store-rating-token';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api',
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem(TOKEN_KEY);
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

let onUnauthorized = () => {};
export const setUnauthorizedHandler = (fn) => {
  onUnauthorized = fn;
};

api.interceptors.response.use(
  (res) => res,
  (err) => {
    const isLogin = err.config?.url?.startsWith('/auth/login');
    if (err.response?.status === 401 && !isLogin) onUnauthorized();
    return Promise.reject(err);
  },
);

/** Extracts `{ message, fieldErrors }` from an API error. */
export function parseApiError(err) {
  const data = err.response?.data;
  return {
    message: data?.message || (err.response ? 'Something went wrong' : 'Unable to reach the server'),
    fieldErrors: data?.errors || {},
  };
}

export default api;
