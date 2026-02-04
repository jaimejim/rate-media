import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  // Vercel handles these automatically, but good to be explicit
  output: undefined, // Use default for Vercel serverless
};

export default nextConfig;
