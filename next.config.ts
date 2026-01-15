import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  
  experimental: {
    turbopackFileSystemCacheForDev: true, // Filesystem caching `next dev`
    authInterrupts: true,

    serverActions: {
      allowedOrigins: [
        'localhost:3000', 
        'r362z8gc-3000.euw.devtunnels.ms' // Ваш адрес из ошибки
      ],
    },
  },
};

export default nextConfig;
