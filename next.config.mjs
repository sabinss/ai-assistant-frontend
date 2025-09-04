/** @type {import('next').NextConfig} */
const nextConfig = {
  typescript: {
    ignoreBuildErrors: true,
  },
  // Disable X-Powered-By header to prevent server disclosure
  poweredByHeader: false,
  // Disable server information disclosure
  generateEtags: false,
  // Enable standalone output for Docker
  output: 'standalone',
  // Custom headers to remove all technology disclosure
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          {
            key: "X-Frame-Options",
            value: "DENY",
          },
          {
            key: "X-Content-Type-Options",
            value: "nosniff",
          },
          {
            key: "X-XSS-Protection",
            value: "1; mode=block",
          },
          {
            key: "Referrer-Policy",
            value: "strict-origin-when-cross-origin",
          },
          {
            key: "Permissions-Policy",
            value: "camera=(), microphone=(), geolocation=()",
          },
          {
            key: "Content-Security-Policy",
            value: "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval' https://www.googletagmanager.com https://www.google-analytics.com; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src 'self' https://fonts.gstatic.com; img-src 'self' data: https: blob:; connect-src 'self' https://18.191.201.61:5001 https://www.google-analytics.com; frame-ancestors 'none'; base-uri 'self'; form-action 'self'; object-src 'none'; upgrade-insecure-requests",
          },
          {
            key: "Strict-Transport-Security",
            value: "max-age=31536000; includeSubDomains; preload",
          },
          // Remove ALL server identification headers
          {
            key: "Server",
            value: "",
          },
          {
            key: "X-Powered-By",
            value: "",
          },
          {
            key: "X-AspNet-Version",
            value: "",
          },
          {
            key: "X-AspNetMvc-Version",
            value: "",
          },
          {
            key: "X-Drupal-Cache",
            value: "",
          },
          {
            key: "X-Generator",
            value: "",
          },
        ],
      },
    ]
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
