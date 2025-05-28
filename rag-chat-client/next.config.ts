import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  devIndicators: false,
  images: {
    domains: ["lh3.googleusercontent.com"],
  },
  env: {
    BASE_URL: process.env.BASE_URL,
  },
};

export default nextConfig;
