import axios from 'axios';

const client = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:8000/api/v1',
  headers: { 'Content-Type': 'application/json' },
});

// Attach JWT on every request
client.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Only auto-logout on 401 if:
// 1. We're NOT already on an auth page (prevents redirect loops)
// 2. The failing request was NOT to an auth endpoint
client.interceptors.response.use(
  (res) => res,
  (err) => {
    const isAuthEndpoint = err.config?.url?.includes('/auth/');
    const onAuthPage = window.location.pathname === '/login' || window.location.pathname === '/register';

    if (err.response?.status === 401 && !isAuthEndpoint && !onAuthPage) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(err);
  }
);

export default client;
