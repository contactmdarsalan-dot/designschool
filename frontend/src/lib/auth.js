const USER_KEY = 'eduflow.user';
const AUTH_EVENT = 'eduflow:auth-changed';
let accessToken = '';

const safeWindow = () => (typeof window !== 'undefined' ? window : null);

const dispatchAuthEvent = () => {
  const currentWindow = safeWindow();
  if (!currentWindow) {
    return;
  }
  currentWindow.dispatchEvent(new Event(AUTH_EVENT));
};

export const getAccessToken = () => accessToken;

export const getStoredUser = () => {
  const currentWindow = safeWindow();
  const raw = currentWindow?.sessionStorage.getItem(USER_KEY);
  if (!raw) {
    return null;
  }

  try {
    return JSON.parse(raw);
  } catch {
    return null;
  }
};

export const isAuthenticated = () => Boolean(getAccessToken() || getStoredUser());

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

export const storeAuthSession = ({ access, user }) => {
  const currentWindow = safeWindow();
  if (!currentWindow) {
    return;
  }

  if (access) {
    accessToken = access;
  }
  if (user) {
    currentWindow.sessionStorage.setItem(USER_KEY, JSON.stringify(user));
  }
  dispatchAuthEvent();
};

export const updateAccessToken = (token) => {
  accessToken = token || '';
  dispatchAuthEvent();
};

export const clearAuthSession = () => {
  const currentWindow = safeWindow();
  if (!currentWindow) {
    return;
  }

  accessToken = '';
  currentWindow.sessionStorage.removeItem(USER_KEY);
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
