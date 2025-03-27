/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    ignoreDuringBuilds: true, // Ignore ESLint errors during build
  },
  typescript: {
    ignoreBuildErrors: true, // Ignore TypeScript errors during build
  },
  images: {
    domains: [
      "example.com", // Add the domain where your product images are hosted
      "znjrafazpveysjguzxri.supabase.co", // Supabase storage
      "www.gravatar.com", // Gravatar images
    ],
  },
  env: {
    MPESA_CONSUMER_KEY: process.env.MPESA_CONSUMER_KEY,
    MPESA_CONSUMER_SECRET: process.env.MPESA_CONSUMER_SECRET,
  },
};

module.exports = nextConfig;
