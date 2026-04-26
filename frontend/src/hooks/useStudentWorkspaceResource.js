import { useCallback, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

import { apiFetch } from '../lib/api';
import { clearAuthSession } from '../lib/auth';
import { extractApiError } from '../lib/errors';

export const useStudentWorkspaceResource = (path, initialData, fallbackMessage) => {
  const navigate = useNavigate();
  const [data, setData] = useState(initialData);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  const load = useCallback(async () => {
    setIsLoading(true);
    setError('');

    try {
      const { response, payload } = await apiFetch(path, { auth: true });

      if (response.status === 401 || response.status === 403) {
        clearAuthSession();
        navigate('/login', { replace: true });
        return;
      }

      if (!response.ok || !payload?.data) {
        throw new Error(extractApiError(payload, fallbackMessage));
      }

      setData(payload.data);
    } catch (nextError) {
      setError(nextError.message || fallbackMessage);
    } finally {
      setIsLoading(false);
    }
  }, [fallbackMessage, navigate, path]);

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      void load();
    }, 0);

    return () => {
      window.clearTimeout(timeoutId);
    };
  }, [load]);

  return {
    data,
    setData,
    isLoading,
    error,
    reload: load,
  };
};
