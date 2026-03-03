import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  // maplibre-gl ships ESM by default; this ensures proper transpilation
  transpilePackages: ['maplibre-gl'],

  async rewrites() {
    return [
      {
        source: '/api/adsb/:path*',
        destination: 'https://api.adsb.lol/v2/:path*',
      },
    ];
  },

  reactStrictMode: false,
};

export default nextConfig;
