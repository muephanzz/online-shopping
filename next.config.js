/** @type {import('next').NextConfig} */
const nextConfig = {
  output: "standalone", // If using a custom build setup
  trailingSlash: true,  // Ensures static paths work properly
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    domains: [
      "example.com", // Add the domain where your product images are hosted
      "vsrkmtebffntocpjapxz.supabase.co", // Supabase storage
      "www.gravatar.com",
    ],
  },
  env: {
    MPESA_CONSUMER_KEY: process.env.MPESA_CONSUMER_KEY,
    MPESA_CONSUMER_SECRET: process.env.MPESA_CONSUMER_SECRET,
  },
};

module.exports = nextConfig;
