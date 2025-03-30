/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  experimental: {
    appDir: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    domains: [
      "example.com", // Your product images domain
      "znjrafazpveysjguzxri.supabase.co", // Supabase storage
      "www.gravatar.com", // Gravatar images
    ],
  },
  env: {
    MPESA_CONSUMER_KEY: process.env.MPESA_CONSUMER_KEY,
    MPESA_CONSUMER_SECRET: process.env.MPESA_CONSUMER_SECRET,
  },
  output: "standalone", // Ensures dynamic rendering & no static export issues
};

module.exports = nextConfig;
