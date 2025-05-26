/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    appDir: true,
  },
  eslint: {
    dirs: ['pages', 'utils', 'components', 'app'],
  },
}

module.exports = nextConfig