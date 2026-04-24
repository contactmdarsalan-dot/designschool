export const extractApiError = (payload, fallback = 'Something went wrong.') => {
  if (!payload) {
    return fallback;
  }

  if (typeof payload === 'string') {
    return payload;
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
