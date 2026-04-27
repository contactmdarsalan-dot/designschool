const ACCESS_TOKEN_KEY = 'eduflow.access_token';
const REFRESH_TOKEN_KEY = 'eduflow.refresh_token';
const USER_KEY = 'eduflow.user';
const AUTH_EVENT = 'eduflow:auth-changed';

const safeWindow = () => (typeof window !== 'undefined' ? window : null);

const dispatchAuthEvent = () => {
  const currentWindow = safeWindow();
  if (!currentWindow) {
    return;
  }
  currentWindow.dispatchEvent(new Event(AUTH_EVENT));
};

export const getAccessToken = () => safeWindow()?.localStorage.getItem(ACCESS_TOKEN_KEY) || '';

export const getRefreshToken = () => safeWindow()?.localStorage.getItem(REFRESH_TOKEN_KEY) || '';

export const getStoredUser = () => {
  const raw = safeWindow()?.localStorage.getItem(USER_KEY);
  if (!raw) {
    return null;
  }

  try {
    return JSON.parse(raw);
  } catch {
    return null;
  }
};

export const isAuthenticated = () => Boolean(getAccessToken());

export const isAdminUser = () => {
  const user = getStoredUser();
  return Boolean(user && (user.role === 'admin' || user.is_staff));
};

export const isMentorUser = () => {
  const user = getStoredUser();
  return Boolean(user && user.role === 'mentor');
};

export const getDashboardPathForUser = (user) => {
  if (user?.role === 'admin' || user?.is_staff) {
    return '/admin-panel';
  }
  if (user?.role === 'mentor') {
    return '/instructor-panel';
  }
  return '/dashboard';
};

export const storeAuthSession = ({ access, refresh, user }) => {
  const currentWindow = safeWindow();
  if (!currentWindow) {
    return;
  }

  if (access) {
    currentWindow.localStorage.setItem(ACCESS_TOKEN_KEY, access);
  }
  if (refresh) {
    currentWindow.localStorage.setItem(REFRESH_TOKEN_KEY, refresh);
  }
  if (user) {
    currentWindow.localStorage.setItem(USER_KEY, JSON.stringify(user));
  }
  dispatchAuthEvent();
};

export const clearAuthSession = () => {
  const currentWindow = safeWindow();
  if (!currentWindow) {
    return;
  }

  currentWindow.localStorage.removeItem(ACCESS_TOKEN_KEY);
  currentWindow.localStorage.removeItem(REFRESH_TOKEN_KEY);
  currentWindow.localStorage.removeItem(USER_KEY);
  dispatchAuthEvent();
};

export const subscribeToAuthChanges = (listener) => {
  const currentWindow = safeWindow();
  if (!currentWindow) {
    return () => {};
  }

  const wrapped = () => listener();
  currentWindow.addEventListener(AUTH_EVENT, wrapped);
  currentWindow.addEventListener('storage', wrapped);

  return () => {
    currentWindow.removeEventListener(AUTH_EVENT, wrapped);
    currentWindow.removeEventListener('storage', wrapped);
  };
};
