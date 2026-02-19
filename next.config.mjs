/** @type {import('next').NextConfig} */
const nextConfig = {
  // Disable OpenTelemetry tracing to prevent Vercel conflicts
  experimental: {
    instrumentationHook: false,
    serverComponentsExternalPackages: ['@opentelemetry/api'],
  },
  images: {
    remotePatterns: [
      {
        hostname: "utfs.io",
        protocol: "https",
        port: "",
      },
      {
        hostname: "uploadthing.com",
        protocol: "https",
        port: "",
      },
      {
        hostname: "*.uploadthing.com",
        protocol: "https",
        port: "",
      },
      {
        hostname: "images.unsplash.com",
        protocol: "https",
        port: "",
      },
      {
        hostname: "lh3.googleusercontent.com",
        protocol: "https",
        port: "",
      },
      {
        hostname: "gravatar.com",
        protocol: "https",
        port: "",
      },
    ],
    unoptimized: false,
  },
};

export default nextConfig;
