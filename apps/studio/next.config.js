/** @type {import('next').NextConfig} */
const nextConfig = {
  transpilePackages: [
    '@vina/diff-patcher',
    '@vina/overlay-mapper',
    '@vina/data-adapters',
    '@vina/design-tokens',
    '@vina/asset-pipelines'
  ],

};

module.exports = nextConfig;