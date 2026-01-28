import axios from 'axios';

const API_ROOT = import.meta.env.VITE_API_ROOT ?? 'http://localhost:8000';

export const apiClient = axios.create({
  baseURL: `${API_ROOT}/api`,
  withCredentials: true,
  headers: {
    Accept: 'application/json',
  },
});

apiClient.interceptors.request.use((config) => {
  if (typeof window !== 'undefined') {
    const token = window.localStorage.getItem('auth_token');
    if (token && !config.headers?.Authorization) {
      config.headers = config.headers ?? {};
      config.headers.Authorization = `Bearer ${token}`;
    }
  }

  return config;
});
