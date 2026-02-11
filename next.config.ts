import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "*.gasesaconcagua.com.ar",
        pathname: "/web/image/**",
      },
    ],
  },
};

export default nextConfig;
