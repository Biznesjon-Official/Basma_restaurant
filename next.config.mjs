/** @type {import('next').NextConfig} */
const nextConfig = {
  typescript: {
    ignoreBuildErrors: false, // Production da false bo'lishi kerak
  },
  images: {
    unoptimized: false, // Production da false
    domains: ['basma-restaurant.uz'],
  },
  compress: true,
  poweredByHeader: false,
  reactStrictMode: true,
  
  // Production optimizatsiya
  compiler: {
    removeConsole: process.env.NODE_ENV === 'production',
  },
  
  // Output standalone for Docker/PM2
  output: 'standalone',
}

export default nextConfig
