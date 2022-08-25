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
  },
  webpack: (config, { dev, isServer }) => {
    // Replace React with Preact in production build
    if (!dev && !isServer) {
      Object.assign(config.resolve.alias, {
        react: "preact/compat",
        "react-dom/test-utils": "preact/test-utils",
        "react-dom": "preact/compat",
      });
    }
    if (dev) {
      config.devtool = 'cheap-module-source-map';
    }
    return config;
  },
});

module.exports = nextConfig
