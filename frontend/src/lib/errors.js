const looksLikeHtmlError = (value) => {
  const normalized = String(value || '').trim().toLowerCase();

  return (
    normalized.startsWith('<!doctype') ||
    normalized.startsWith('<html') ||
    normalized.includes('<body') ||
    normalized.includes('traceback (most recent call last)') ||
    normalized.includes('django version') ||
    normalized.includes('exception type:')
  );
};

export const extractApiError = (payload, fallback = 'Something went wrong.') => {
  if (!payload) {
    return fallback;
  }

  if (typeof payload === 'string') {
    return looksLikeHtmlError(payload)
      ? 'The server returned an unexpected error. Check the backend logs and try again.'
      : payload;
  }

  if (typeof payload.error === 'string') {
    return payload.error;
  }

  if (typeof payload.detail === 'string') {
    return payload.detail;
  }

  const values = Object.values(payload);
  for (const value of values) {
    if (Array.isArray(value) && value.length > 0) {
      return String(value[0]);
    }
    if (typeof value === 'string') {
      return value;
    }
  }

  return fallback;
};
