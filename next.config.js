/** @type {import('next').NextConfig} */
const nextConfig = {
  output: "standalone", // ✅ Moved this to the top level
  eslint: {
    ignoreDuringBuilds: true, // Ignore ESLint errors during build
  },
  typescript: {
    ignoreBuildErrors: true, // Ignore TypeScript errors during build
  },
  images: {
    domains: ["www.gravatar.com", "znjrafazpveysjguzxri.supabase.co"], // ✅ Correct image domains
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
