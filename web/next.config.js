/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  experimental: {
    gzipSize: true,
    optimizeCss: true,
    forceSwcTransforms: true,
  },
}

module.exports = nextConfig
