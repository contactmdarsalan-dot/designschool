const GOOGLE_CLIENT_ID = (import.meta.env.VITE_GOOGLE_CLIENT_ID || '').trim();
const GOOGLE_ALLOWED_ORIGINS = (import.meta.env.VITE_GOOGLE_ALLOWED_ORIGINS || '')
  .split(',')
  .map((origin) => origin.trim())
  .filter(Boolean);
const IS_DEV = Boolean(import.meta.env.DEV);
const GOOGLE_ALLOW_LOCALHOST =
  String(import.meta.env.VITE_GOOGLE_ALLOW_LOCALHOST || '').toLowerCase() === 'true' || IS_DEV;

const getCurrentOrigin = () => {
  if (typeof window === 'undefined') {
    return '';
  }

  return window.location.origin;
};

const getCurrentHostname = () => {
  if (typeof window === 'undefined') {
    return '';
  }

  return window.location.hostname;
};

const currentOrigin = getCurrentOrigin();
const currentHostname = getCurrentHostname();
const isLocalOrigin = ['localhost', '127.0.0.1', '[::1]'].includes(currentHostname);
const configuredOriginMismatch =
  GOOGLE_ALLOWED_ORIGINS.length > 0 &&
  currentOrigin &&
  !GOOGLE_ALLOWED_ORIGINS.includes(currentOrigin);

const buildDisabledGoogleConfig = ({ reason, userMessage }) => ({
  clientId: GOOGLE_CLIENT_ID,
  enabled: false,
  reason,
  userMessage,
  currentOrigin,
  isLocalOrigin,
  allowedOrigins: GOOGLE_ALLOWED_ORIGINS,
});

const buildGoogleAuthConfig = () => {
  if (!GOOGLE_CLIENT_ID) {
    return buildDisabledGoogleConfig({
      reason: 'Google sign-in is not configured yet. Add VITE_GOOGLE_CLIENT_ID to your frontend environment to enable it.',
      userMessage: '',
    });
  }

  if (isLocalOrigin && !GOOGLE_ALLOW_LOCALHOST && GOOGLE_ALLOWED_ORIGINS.length === 0) {
    return buildDisabledGoogleConfig({
      reason: `Google sign-in is disabled on ${currentOrigin} until this local origin is explicitly approved. Register ${currentOrigin} in Google Cloud Console, then add it to VITE_GOOGLE_ALLOWED_ORIGINS or set VITE_GOOGLE_ALLOW_LOCALHOST=true.`,
      userMessage: 'Email sign-in is active in local development. Google sign-in will appear once localhost is approved.',
    });
  }

  return {
    clientId: GOOGLE_CLIENT_ID,
    enabled: true,
    reason: configuredOriginMismatch
      ? `Current origin ${currentOrigin} is not listed in VITE_GOOGLE_ALLOWED_ORIGINS. Google Cloud must still authorize this origin.`
      : '',
    userMessage: '',
    currentOrigin,
    isLocalOrigin,
    allowedOrigins: GOOGLE_ALLOWED_ORIGINS,
  };
};

export const GOOGLE_AUTH_CONFIG = buildGoogleAuthConfig();
export const IS_GOOGLE_AUTH_ENABLED = GOOGLE_AUTH_CONFIG.enabled;
export { GOOGLE_CLIENT_ID };

if (IS_DEV && !GOOGLE_AUTH_CONFIG.enabled && GOOGLE_AUTH_CONFIG.reason) {
  console.info(`[google-auth] ${GOOGLE_AUTH_CONFIG.reason}`);
}
