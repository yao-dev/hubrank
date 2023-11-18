/** @type {import('next').NextConfig} */
const nextConfig = {
  swcMinify: true,
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 't0.gstatic.com',
        port: '',
        pathname: '/faviconV2/**',
      },
    ],
  },
}

module.exports = nextConfig
