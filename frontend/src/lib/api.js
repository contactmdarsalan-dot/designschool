import { getAccessToken } from './auth';

const PRODUCTION_API_BASE_URL = 'https://designschool.onrender.com/api/v1';

const DEFAULT_API_BASE_URL = import.meta.env.DEV
  ? 'http://127.0.0.1:8000/api/v1'
  : PRODUCTION_API_BASE_URL;

const envBaseUrl = (import.meta.env.VITE_API_BASE_URL || '').trim();

const isSameOriginAsFrontend = (value) => {
  if (!value || typeof window === 'undefined') {
    return false;
  }

  try {
    return new URL(value, window.location.origin).origin === window.location.origin;
  } catch (error) {
    return false;
  }
};

const shouldIgnoreEnvBaseUrl = import.meta.env.PROD && isSameOriginAsFrontend(envBaseUrl);
const baseFromEnv = shouldIgnoreEnvBaseUrl ? PRODUCTION_API_BASE_URL : envBaseUrl || DEFAULT_API_BASE_URL;

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

  let response;
  try {
    response = await fetch(apiUrl(path), requestOptions);
  } catch (error) {
    throw new Error(`Unable to reach the API at ${API_BASE_URL}. Check the backend deployment and Vercel API URL.`);
  }

  const payload = await parseResponseBody(response);
  return { response, payload };
};
