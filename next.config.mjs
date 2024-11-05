/** @type {import('next').NextConfig} */
const nextConfig = {
  typescript: {
    ignoreBuildErrors: true,
  },
  async rewrites() {
    return [
      {
        source: "/api/:path*", // Matches all requests starting with /api
        destination: "http://18.191.201.61:5001/api/:path*", // Replace with your EC2 server URL
      },
    ]
  },
}

export default nextConfig
