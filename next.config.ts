import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  allowedDevOrigins: [
    "127.0.0.1.nip.io", // Telegram widget (run http://localhost:80)
  ],

  experimental: {
    turbopackFileSystemCacheForDev: true, // Filesystem caching `next dev`
    authInterrupts: true,
  },
};

export default nextConfig;
