"use client";

import { useLoadingManager } from "../../app/lib/loading-manager";
import { LoadingSpinner } from "./loading-spinner";
import { cn } from "@/lib/utils";
import { usePathname } from "next/navigation";

export function GlobalLoadingOverlay({ className }: { className?: string }) {
  const { isLoading, loadingMessage } = useLoadingManager();
  const pathname = usePathname();

  // Don't show loading overlay on payment pages
  if (!isLoading || (pathname && pathname.startsWith('/payment/'))) {
    return null;
  }

  return (
    <div className={cn(
      "fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm",
      className
    )}>
      <div className="bg-white rounded-lg p-6 shadow-lg flex flex-col items-center space-y-3">
        <LoadingSpinner size="lg" />
        {loadingMessage && (
          <p className="text-sm text-muted-foreground">{loadingMessage}</p>
        )}
      </div>
    </div>
  );
}
