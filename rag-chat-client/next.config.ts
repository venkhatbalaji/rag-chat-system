import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  devIndicators: false,
  env: {
    BASE_URL: process.env.BASE_URL,
  },
};

export default nextConfig;