import type { Metadata } from "next";
import "./globals.css";
import { Navbar } from "./components/Navbar";
import { Footer } from "./components/Footer";
import { NextSSRPlugin } from "@uploadthing/react/next-ssr-plugin";
import { extractRouterConfig } from "uploadthing/server";
import { ourFileRouter } from "./api/uploadthing/core";
import { Toaster } from "@/components/ui/sonner";
import { KindeAuthProvider } from "./components/KindeAuthProvider";
import { ThemeProvider } from "./components/ThemeProvider";
import { LoadingManagerProvider } from "./lib/loading-manager";
import { NavigationLoadingProvider } from "./lib/navigation-loading";
import { GlobalLoadingOverlay } from "@/components/ui/global-loading-overlay";
import { Suspense } from "react";
import { ErrorBoundary } from "./components/ui/error-boundary";
import { ToastProvider } from "./components/ui/simple-toast";
import { createBaseMetadata } from "./lib/seo";
import { createOrganizationStructuredData, createWebsiteStructuredData, generateJSONLD } from "./lib/structured-data";

// Force dynamic rendering for the entire app
export const dynamic = 'force-dynamic';

export const metadata: Metadata = createBaseMetadata();

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={generateJSONLD(createOrganizationStructuredData())}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={generateJSONLD(createWebsiteStructuredData())}
        />
      </head>
      <body className="font-sans">
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <ToastProvider>
            <ErrorBoundary>
              <LoadingManagerProvider>
                <Suspense>
                  <NavigationLoadingProvider>
                    <KindeAuthProvider>
                      <NextSSRPlugin routerConfig={extractRouterConfig(ourFileRouter)} />
                      <Navbar />
                      {children}
                      <Footer />
                      <Toaster richColors theme="light" closeButton />
                      <GlobalLoadingOverlay />
                    </KindeAuthProvider>
                  </NavigationLoadingProvider>
                </Suspense>
              </LoadingManagerProvider>
            </ErrorBoundary>
          </ToastProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
