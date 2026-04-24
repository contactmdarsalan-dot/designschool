import { getAccessToken } from './auth';

const baseFromEnv = import.meta.env.VITE_API_BASE_URL || 'http://127.0.0.1:8000/api/v1';

export const API_BASE_URL = baseFromEnv.replace(/\/+$/, '');

export const apiUrl = (path) => {
  const normalizedPath = String(path || '').replace(/^\/+/, '');
  return `${API_BASE_URL}/${normalizedPath}`;
};

const parseResponseBody = async (response) => {
  const contentType = response.headers.get('content-type') || '';
  if (contentType.includes('application/json')) {
    return response.json();
  }
  return response.text();
};

export const apiFetch = async (path, options = {}) => {
  const { auth = false, body, headers = {}, ...restOptions } = options;
  const requestHeaders = {
    Accept: 'application/json',
    ...headers,
  };

  const requestOptions = {
    ...restOptions,
    headers: requestHeaders,
  };

  if (body instanceof FormData) {
    requestOptions.body = body;
  } else if (body !== undefined) {
    requestHeaders['Content-Type'] = 'application/json';
    requestOptions.body = JSON.stringify(body);
  }

  if (auth) {
    const accessToken = getAccessToken();
    if (accessToken) {
      requestHeaders.Authorization = `Bearer ${accessToken}`;
    }
  }

  const response = await fetch(apiUrl(path), requestOptions);
  const payload = await parseResponseBody(response);
  return { response, payload };
};
