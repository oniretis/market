"use client";

import React, { createContext, useContext, useState, useCallback } from 'react';
import { X, CheckCircle, AlertCircle, AlertTriangle, Info } from 'lucide-react';
import { cn } from '@/lib/utils';

interface Toast {
  id: string;
  title?: string;
  description: string;
  variant: 'default' | 'destructive' | 'success' | 'warning';
  duration?: number;
}

interface ToastContextType {
  toasts: Toast[];
  addToast: (toast: Omit<Toast, 'id'>) => void;
  removeToast: (id: string) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
}

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const removeToast = useCallback((id: string) => {
    setToasts(prev => prev.filter(toast => toast.id !== id));
  }, []);

  const addToast = useCallback((toast: Omit<Toast, 'id'>) => {
    const id = Math.random().toString(36).substr(2, 9);
    const newToast = { ...toast, id };

    setToasts(prev => [...prev, newToast]);

    if (toast.duration !== 0) {
      setTimeout(() => {
        removeToast(id);
      }, toast.duration || 5000);
    }
  }, [removeToast]);

  return (
    <ToastContext.Provider value={{ toasts, addToast, removeToast }}>
      {children}
      <ToastContainer />
    </ToastContext.Provider>
  );
}

function ToastContainer() {
  const { toasts, removeToast } = useToast();

  if (toasts.length === 0) return null;

  return (
    <div className="fixed top-4 right-4 z-50 space-y-2">
      {toasts.map((toast) => (
        <ToastItem key={toast.id} toast={toast} onRemove={removeToast} />
      ))}
    </div>
  );
}

function ToastItem({ toast, onRemove }: { toast: Toast; onRemove: (id: string) => void }) {
  const getIcon = () => {
    switch (toast.variant) {
      case 'success':
        return <CheckCircle className="w-5 h-5 text-green-600" />;
      case 'destructive':
        return <AlertCircle className="w-5 h-5 text-red-600" />;
      case 'warning':
        return <AlertTriangle className="w-5 h-5 text-yellow-600" />;
      default:
        return <Info className="w-5 h-5 text-blue-600" />;
    }
  };

  const getStyles = () => {
    switch (toast.variant) {
      case 'success':
        return 'border-green-200 bg-green-50 text-green-800';
      case 'destructive':
        return 'border-red-200 bg-red-50 text-red-800';
      case 'warning':
        return 'border-yellow-200 bg-yellow-50 text-yellow-800';
      default:
        return 'border-blue-200 bg-blue-50 text-blue-800';
    }
  };

  return (
    <div
      className={cn(
        'relative flex items-start space-x-3 p-4 rounded-lg border shadow-lg max-w-sm animate-in slide-in-from-right',
        getStyles()
      )}
    >
      {getIcon()}
      <div className="flex-1 min-w-0">
        {toast.title && (
          <h4 className="text-sm font-semibold mb-1">{toast.title}</h4>
        )}
        <p className="text-sm">{toast.description}</p>
      </div>
      <button
        onClick={() => onRemove(toast.id)}
        className="flex-shrink-0 p-1 rounded-md hover:bg-black/5 transition-colors"
      >
        <X className="w-4 h-4" />
      </button>
    </div>
  );
}

// Convenience functions for common toast types
// These should be called within React components or hooks
export const toastHelpers = {
  success: (description: string, title?: string, addToast?: (toast: Omit<Toast, 'id'>) => void) => {
    if (!addToast) {
      console.warn('addToast function is required. Use useToast hook within components.');
      return;
    }
    addToast({ description, title, variant: 'success' });
  },
  error: (description: string, title?: string, addToast?: (toast: Omit<Toast, 'id'>) => void) => {
    if (!addToast) {
      console.warn('addToast function is required. Use useToast hook within components.');
      return;
    }
    addToast({ description, title, variant: 'destructive' });
  },
  warning: (description: string, title?: string, addToast?: (toast: Omit<Toast, 'id'>) => void) => {
    if (!addToast) {
      console.warn('addToast function is required. Use useToast hook within components.');
      return;
    }
    addToast({ description, title, variant: 'warning' });
  },
  info: (description: string, title?: string, addToast?: (toast: Omit<Toast, 'id'>) => void) => {
    if (!addToast) {
      console.warn('addToast function is required. Use useToast hook within components.');
      return;
    }
    addToast({ description, title, variant: 'default' });
  },
};

// Legacy export for backward compatibility - deprecated
export const toast = toastHelpers;
