"use client";

import { LoadingLink } from "@/components/ui/loading-link";
import { LoadingButton } from "@/components/ui/loading-button";
import { useNavigationLoading } from "./use-navigation-loading";

export function NavigationExamples() {
  const { 
    navigateWithLoading, 
    replaceWithLoading, 
    backWithLoading, 
    refreshWithLoading 
  } = useNavigationLoading();

  return (
    <div className="space-y-6 p-6">
      <h2 className="text-2xl font-bold">Navigation Loading Examples</h2>
      
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">Loading Links</h3>
        <div className="flex gap-4 flex-wrap">
          <LoadingLink href="/" loadingMessage="Going home...">
            Home
          </LoadingLink>
          <LoadingLink href="/sell" loadingMessage="Opening sell page...">
            Sell Product
          </LoadingLink>
          <LoadingLink href="/billing" loadingMessage="Opening billing...">
            Billing
          </LoadingLink>
          <LoadingLink href="/product/123" loadingMessage="Loading product...">
            View Product
          </LoadingLink>
        </div>
      </div>

      <div className="space-y-4">
        <h3 className="text-lg font-semibold">Programmatic Navigation</h3>
        <div className="flex gap-4 flex-wrap">
          <LoadingButton
            onClick={() => navigateWithLoading("/", "Navigating home...")}
          >
            Navigate Home
          </LoadingButton>
          
          <LoadingButton
            onClick={() => replaceWithLoading("/sell", "Replacing with sell page...")}
          >
            Replace with Sell
          </LoadingButton>
          
          <LoadingButton
            onClick={() => backWithLoading("Going back to previous page...")}
          >
            Go Back
          </LoadingButton>
          
          <LoadingButton
            onClick={() => refreshWithLoading("Refreshing current page...")}
          >
            Refresh Page
          </LoadingButton>
        </div>
      </div>

      <div className="space-y-4">
        <h3 className="text-lg font-semibold">Links without Spinner</h3>
        <div className="flex gap-4 flex-wrap">
          <LoadingLink 
            href="/" 
            showSpinner={false}
            className="text-blue-600 hover:underline"
          >
            Home (no spinner)
          </LoadingLink>
          <LoadingLink 
            href="/sell" 
            showSpinner={false}
            className="text-blue-600 hover:underline"
          >
            Sell (no spinner)
          </LoadingLink>
        </div>
      </div>
    </div>
  );
}
