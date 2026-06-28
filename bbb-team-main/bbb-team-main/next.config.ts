import { BASE_URL } from "@/components/helper/constant";
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    remotePatterns: [
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
        protocol: "http",
        hostname: "localhost",
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
