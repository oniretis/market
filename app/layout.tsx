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


export const metadata: Metadata = {
  title: "Heywhymarketplace",
  description: "Buy and sell products online",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="font-sans">
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
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
        </ThemeProvider>
      </body>
    </html>
  );
}
