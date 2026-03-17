import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "standalone",

  allowedDevOrigins: [
    "127.0.0.1.nip.io", // Telegram widget (run http://localhost:80)
    "debik.dreyn-drafts.ru",
  ],

  experimental: {
    turbopackFileSystemCacheForDev: true, // Filesystem caching `next dev`
    authInterrupts: true,
  },
};

export default nextConfig;
