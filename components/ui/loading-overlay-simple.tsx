"use client";

import { useState, useEffect } from "react";
import { LoadingSpinner } from "./loading-spinner";
import { cn } from "@/lib/utils";

interface LoadingOverlaySimpleProps {
  className?: string;
  show: boolean;
  message?: string;
}

export function LoadingOverlaySimple({ className, show, message }: LoadingOverlaySimpleProps) {
  if (!show) return null;

  return (
    <div className={cn(
      "fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm",
      className
    )}>
      <div className="bg-white rounded-lg p-6 shadow-lg flex flex-col items-center space-y-3">
        <LoadingSpinner size="lg" />
        {message && (
          <p className="text-sm text-muted-foreground">{message}</p>
        )}
      </div>
    </div>
  );
}
