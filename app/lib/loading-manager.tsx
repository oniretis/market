"use client";

import { createContext, useContext, useState, ReactNode } from "react";

interface LoadingManagerType {
  isLoading: boolean;
  loadingMessage: string;
  showLoading: (message?: string) => void;
  hideLoading: () => void;
}

const LoadingManagerContext = createContext<LoadingManagerType | undefined>(undefined);

export function LoadingManagerProvider({ children }: { children: ReactNode }) {
  const [isLoading, setIsLoading] = useState(false);
  const [loadingMessage, setLoadingMessage] = useState("");

  const showLoading = (message = "") => {
    setIsLoading(true);
    setLoadingMessage(message);
  };

  const hideLoading = () => {
    setIsLoading(false);
    setLoadingMessage("");
  };

  return (
    <LoadingManagerContext.Provider value={{ isLoading, loadingMessage, showLoading, hideLoading }}>
      {children}
    </LoadingManagerContext.Provider>
  );
}

export function useLoadingManager(): LoadingManagerType {
  const context = useContext(LoadingManagerContext);
  if (context === undefined) {
    throw new Error("useLoadingManager must be used within a LoadingManagerProvider");
  }
  return context;
}
