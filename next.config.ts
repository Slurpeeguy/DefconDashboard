import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  // maplibre-gl ships ESM by default; this ensures proper transpilation
  transpilePackages: ['maplibre-gl'],

  async rewrites() {
    return [
      {
        source: '/api/adsb-lol/:path*',
        destination: 'https://api.adsb.lol/v2/:path*',
      },
      {
        source: '/api/adsb-fi/:path*',
        destination: 'https://opendata.adsb.fi/api/v2/:path*',
      },
      {
        source: '/api/adsb-live/:path*',
        destination: 'https://api.airplanes.live/v2/:path*',
      },
    ];
  },

  reactStrictMode: false,
  env: {
    NEXT_PUBLIC_AISSTREAM_KEY: process.env.NEXT_PUBLIC_AISSTREAM_KEY,
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'api.planespotters.net',
      },
      {
        protocol: 'https',
        hostname: 'cdn.planespotters.net',
      },
      {
        protocol: 'https',
        hostname: 'upload.wikimedia.org',
      },
      {
        protocol: 'https',
        hostname: 'flagcdn.com',
      }
    ],
  },
};

export default nextConfig;
