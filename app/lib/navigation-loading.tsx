"use client";

import { usePathname, useSearchParams } from "next/navigation";
import { useEffect, useState, useRef } from "react";
import { useLoadingManager } from "./loading-manager";

export function NavigationLoadingProvider({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const { showLoading, hideLoading } = useLoadingManager();
  const [isNavigating, setIsNavigating] = useState(false);
  const [currentPath, setCurrentPath] = useState(pathname);
  const timeoutRef = useRef<NodeJS.Timeout>();

  useEffect(() => {
    // Check if this is actually a route change
    if (pathname !== currentPath) {
      // Clear any existing timeout
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }

      // Show loading immediately for navigation
      setIsNavigating(true);
      showLoading("Loading page...");

      // Hide loading after a minimum time to prevent flickering
      timeoutRef.current = setTimeout(() => {
        setIsNavigating(false);
        hideLoading();
        setCurrentPath(pathname);
      }, 500);
    }

    // Handle search parameter changes
    if (pathname === currentPath && searchParams.toString()) {
      // For search/filter changes, show a shorter loading
      showLoading("Updating...");
      timeoutRef.current = setTimeout(() => {
        hideLoading();
      }, 200);
    }

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [pathname, searchParams, currentPath, showLoading, hideLoading]);

  return <>{children}</>;
}
