/** @type {import('next').NextConfig} */
const nextConfig = {
  transpilePackages: ["@design-tokens/tailwind"],
  experimental: {
    appDir: true,
  },
};

module.exports = nextConfig;