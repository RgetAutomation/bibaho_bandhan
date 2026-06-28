import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  /* config options here */
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "images.unsplash.com",
      },
      {
        protocol: "https",
        hostname: "res.cloudinary.com",
      },
      {
        protocol: "https",
        hostname: "assets.bibahobandhan.com",
        pathname: "/v1/storage/buckets/**",
      },
      {
        protocol: "https",
        hostname: "s3-img.bibahobandhan.com",
        pathname: "/uploads/**",
      },
      // Local backend server for development
      {
        protocol: "http",
        hostname: "localhost",
        port: "5000",
        pathname: "/**",
      },
      {
        protocol: "http",
        hostname: "192.168.1.37",
        port: "5000",
        pathname: "/**",
      },
    ],
  },
};

export default nextConfig;
