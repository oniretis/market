"use client";

import { useState, useCallback } from 'react';
import { AppError, handleApiError, getErrorMessage } from '../lib/error-handler';
import { toast } from '../components/ui/simple-toast';

interface ApiState<T> {
  data: T | null;
  loading: boolean;
  error: AppError | null;
}

interface UseApiOptions {
  showToast?: boolean;
  onSuccess?: (data: any) => void;
  onError?: (error: AppError) => void;
}

export function useApi<T = any>(options: UseApiOptions = {}) {
  const [state, setState] = useState<ApiState<T>>({
    data: null,
    loading: false,
    error: null,
  });

  const execute = useCallback(async (
    apiCall: () => Promise<T>,
    customOptions?: UseApiOptions
  ) => {
    const opts = { ...options, ...customOptions };

    setState(prev => ({ ...prev, loading: true, error: null }));

    try {
      const result = await apiCall();
      setState({ data: result, loading: false, error: null });

      if (opts.onSuccess) {
        opts.onSuccess(result);
      }

      if (opts.showToast !== false) {
        toast.success('Operation completed successfully');
      }

      return result;
    } catch (error) {
      const appError = handleApiError(error);
      setState(prev => ({ ...prev, loading: false, error: appError }));

      if (opts.onError) {
        opts.onError(appError);
      }

      if (opts.showToast !== false) {
        toast.error(getErrorMessage(appError));
      }

      throw appError;
    }
  }, [options]);

  const reset = useCallback(() => {
    setState({ data: null, loading: false, error: null });
  }, []);

  return {
    ...state,
    execute,
    reset,
  };
}

export function useLazyApi<T = any>(options: UseApiOptions = {}) {
  const [state, setState] = useState<ApiState<T>>({
    data: null,
    loading: false,
    error: null,
  });

  const execute = useCallback(async (
    apiCall: () => Promise<T>,
    customOptions?: UseApiOptions
  ) => {
    const opts = { ...options, ...customOptions };

    setState(prev => ({ ...prev, loading: true, error: null }));

    try {
      const result = await apiCall();
      setState(prev => ({ ...prev, data: result, loading: false, error: null }));

      if (opts.onSuccess) {
        opts.onSuccess(result);
      }

      return result;
    } catch (error) {
      const appError = handleApiError(error);
      setState(prev => ({ ...prev, loading: false, error: appError }));

      if (opts.onError) {
        opts.onError(appError);
      }

      if (opts.showToast !== false) {
        toast.error(getErrorMessage(appError));
      }

      throw appError;
    }
  }, [options]);

  const reset = useCallback(() => {
    setState({ data: null, loading: false, error: null });
  }, []);

  return {
    ...state,
    execute,
    reset,
  };
}

// Helper function for making API requests
export async function apiRequest<T>(
  url: string,
  options: RequestInit = {}
): Promise<T> {
  const response = await fetch(url, {
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
    ...options,
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    const error = new Error(errorData.message || `HTTP ${response.status}`);
    (error as any).status = response.status;
    throw error;
  }

  return response.json();
}
