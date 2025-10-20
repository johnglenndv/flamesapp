import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  // This is the line that fixes the "Map container is already initialized" error
  reactStrictMode: false,

  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'placehold.co',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'picsum.photos',
        port: '',
        pathname: '/**',
      },
    ],
  },

  // The 'experimental' block was removed as it is not a valid option
  // in your version of Next.js and was causing the warning.
};

export default nextConfig;
