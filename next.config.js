/** @type {import('next').NextConfig} */
const nextConfig = {
  typescript: {
    // Temporarily disable type checking during build
    ignoreBuildErrors: true,
  },
  eslint: {
    // Temporarily disable eslint during build
    ignoreDuringBuilds: true,
  },
  images: {
    domains: [
      'lime-odd-deer-974.mypinata.cloud',
    ],
  },
}

module.exports = nextConfig