/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
  },
  // Reescritura para las imágenes subidas
  async rewrites() {
    return [
      {
        source: '/api/uploads/:path*',
        destination: 'http://localhost:4000/uploads/:path*',
      },
    ]
  },
}

export default nextConfig