/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    // ESLint roda separado no CI — não bloqueia o build de staging
    ignoreDuringBuilds: true,
  },
}

module.exports = nextConfig
