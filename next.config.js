/** @type {import('next').NextConfig} */
const nextConfig = {
  swcMinify: false,
  experimental: {
    scrollRestoration: true
  }
};

module.exports = nextConfig;
