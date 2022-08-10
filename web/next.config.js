/** @type {import('next').NextConfig} */
const withPWA = require('next-pwa');
const nextConfig = withPWA({
  reactStrictMode: true,
  swcMinify: true,
  compress: true,
  experimental: {
    gzipSize: true,
    optimizeCss: true,
    forceSwcTransforms: true,
  },
  pwa: {
    dest: 'public',
    register: true,
    skipWaiting: true,
  }
});

module.exports = nextConfig
