/** @type {import('next').NextConfig} */
const nextConfig = {
  swcMinify: false,
  experimental: {
    scrollRestoration: true
  },
  serverRuntimeConfig: {
    maxDuration: 300 // 5 minutes in seconds
  }
};

module.exports = nextConfig;
