"use client";

import { useState, useCallback, useRef } from "react";
import { useLoading } from "./loading-context";

export function useAsyncOperation() {
  const { setLoading } = useLoading();
  const [error, setError] = useState<Error | null>(null);

  const execute = useCallback(async <T>(
    operation: () => Promise<T>,
    loadingMessage?: string
  ): Promise<T | null> => {
    try {
      setError(null);
      setLoading(true, loadingMessage);
      const result = await operation();
      return result;
    } catch (err) {
      const error = err instanceof Error ? err : new Error("Unknown error");
      setError(error);
      return null;
    } finally {
      setLoading(false);
    }
  }, [setLoading]);

  return { execute, error, clearError: () => setError(null) };
}

export function useFormSubmission<T = any>() {
  const { setLoading } = useLoading();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [result, setResult] = useState<T | null>(null);
  const [error, setError] = useState<string | null>(null);

  const submit = useCallback(async (
    operation: () => Promise<T>,
    loadingMessage = "Submitting..."
  ): Promise<boolean> => {
    try {
      setIsSubmitting(true);
      setError(null);
      setLoading(true, loadingMessage);
      const res = await operation();
      setResult(res);
      return true;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Submission failed";
      setError(errorMessage);
      return false;
    } finally {
      setIsSubmitting(false);
      setLoading(false);
    }
  }, [setLoading]);

  return { submit, isSubmitting, result, error, clearError: () => setError(null) };
}

export function useDebouncedLoading(delay = 300) {
  const { setLoading } = useLoading();
  const timeoutRef = useRef<NodeJS.Timeout>();

  const showLoading = useCallback((message?: string) => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    
    timeoutRef.current = setTimeout(() => {
      setLoading(true, message);
    }, delay);
  }, [setLoading, delay]);

  const hideLoading = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    setLoading(false);
  }, [setLoading]);

  return { showLoading, hideLoading };
}
