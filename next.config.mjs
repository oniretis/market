/** @type {import('next').NextConfig} */
const nextConfig = {
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
