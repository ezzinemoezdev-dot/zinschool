import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // هذا السطر كيقول لـ Webpack ما يلوّجش في ملفات النظام متاع ويندوز
  webpack: (config, { isServer }) => {
    config.watchOptions = {
      ...config.watchOptions,
      ignored: ['**/node_modules/**', 'C:\\pagefile.sys', 'C:\\swapfile.sys', 'C:\\hiberfil.sys'],
    };
    return config;
  },
};

export default nextConfig;