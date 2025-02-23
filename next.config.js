// next.config.js
/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    ignoreDuringBuilds: true, // Disable ESLint during build
  },
};

module.exports = nextConfig; // ✅ Use "module.exports" in CommonJS
