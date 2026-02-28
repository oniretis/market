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
  const fallbackTimeoutRef = useRef<NodeJS.Timeout>();

  // Initial check to hide loading if starting on payment page
  useEffect(() => {
    if (pathname && pathname.startsWith('/payment/')) {
      hideLoading();
      setCurrentPath(pathname);
    }
  }, [pathname, hideLoading]);

  useEffect(() => {
    // Skip loading for payment pages entirely
    if (pathname && pathname.startsWith('/payment/')) {
      setCurrentPath(pathname);
      return;
    }

    // Check if this is actually a route change
    if (pathname !== currentPath && pathname) {
      // Clear any existing timeouts
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
      if (fallbackTimeoutRef.current) {
        clearTimeout(fallbackTimeoutRef.current);
      }

      // Show loading immediately for navigation
      setIsNavigating(true);
      showLoading("Loading page...");

      // Hide loading after a shorter minimum time for better UX
      timeoutRef.current = setTimeout(() => {
        setIsNavigating(false);
        hideLoading();
        setCurrentPath(pathname);
      }, 300); // Reduced from 500ms to 300ms

      // Fallback: Force hide loading if page takes too long
      fallbackTimeoutRef.current = setTimeout(() => {
        setIsNavigating(false);
        hideLoading();
        setCurrentPath(pathname);
      }, 2000); // Force hide after 2 seconds
    }

    // Handle search parameter changes
    if (pathname === currentPath && searchParams?.toString()) {
      // For search/filter changes, show a shorter loading
      showLoading("Updating...");
      timeoutRef.current = setTimeout(() => {
        hideLoading();
      }, 150); // Reduced from 200ms to 150ms
    }

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
      if (fallbackTimeoutRef.current) {
        clearTimeout(fallbackTimeoutRef.current);
      }
    };
  }, [pathname, searchParams, currentPath, showLoading, hideLoading]);

  return <>{children}</>;
}
