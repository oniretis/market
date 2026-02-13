"use client";

import { useRouter, usePathname } from "next/navigation";
import { useLoadingManager } from "./loading-manager";

export function useNavigationLoading() {
  const router = useRouter();
  const pathname = usePathname();
  const { showLoading, hideLoading } = useLoadingManager();

  const navigateWithLoading = (url: string, message = "Loading...") => {
    // Don't show loading if navigating to the same page
    if (url === pathname) return;

    showLoading(message);
    
    // Use setTimeout to ensure the loading state is visible
    setTimeout(() => {
      router.push(url);
    }, 100);
  };

  const replaceWithLoading = (url: string, message = "Loading...") => {
    if (url === pathname) return;

    showLoading(message);
    
    setTimeout(() => {
      router.replace(url);
    }, 100);
  };

  const backWithLoading = (message = "Going back...") => {
    showLoading(message);
    
    setTimeout(() => {
      router.back();
    }, 100);
  };

  const forwardWithLoading = (message = "Going forward...") => {
    showLoading(message);
    
    setTimeout(() => {
      router.forward();
    }, 100);
  };

  const refreshWithLoading = (message = "Refreshing...") => {
    showLoading(message);
    
    setTimeout(() => {
      router.refresh();
    }, 100);
  };

  return {
    navigateWithLoading,
    replaceWithLoading,
    backWithLoading,
    forwardWithLoading,
    refreshWithLoading,
  };
}
