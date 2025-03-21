/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    ignoreDuringBuilds: true, // Ignore ESLint errors during build
  },
  typescript: {
    ignoreBuildErrors: true, // Ignore TypeScript errors during build
  },
  images: {
    domains: ["www.gravatar.com", "znjrafazpveysjguzxri.supabase.co"], // Add Supabase storage domain
    remotePatterns: [
      {
        protocol: "https",
        hostname: "znjrafazpveysjguzxri.supabase.co",
        pathname: "/storage/v1/object/public/**",
      },
    ],
  },
  env: {
    MPESA_CONSUMER_KEY: process.env.MPESA_CONSUMER_KEY,
    MPESA_CONSUMER_SECRET: process.env.MPESA_CONSUMER_SECRET,
  },
};

module.exports = nextConfig;
