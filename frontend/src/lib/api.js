const baseFromEnv = import.meta.env.VITE_API_BASE_URL || 'http://127.0.0.1:8000/api/v1';

export const API_BASE_URL = baseFromEnv.replace(/\/+$/, '');

export const apiUrl = (path) => {
  const normalizedPath = String(path || '').replace(/^\/+/, '');
  return `${API_BASE_URL}/${normalizedPath}`;
};
