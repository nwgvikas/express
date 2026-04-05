import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {
    serverActions: {
      // Post form: image (5MB) + HTML — default ~1MB se zyada chahiye
      bodySizeLimit: "6mb",
    },
  },
};

export default nextConfig;
