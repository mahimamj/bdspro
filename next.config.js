/** @type {import('next').NextConfig} */
const nextConfig = {
  // Vercel deployment configuration
  trailingSlash: true,
  
  // Image optimization for Vercel
  images: {
    domains: ['images.unsplash.com', 'via.placeholder.com'],
  },
  
  // Environment variables for build
  env: {
    NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL || ''
  }
}

module.exports = nextConfig
