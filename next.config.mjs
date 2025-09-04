import TerserPlugin from 'terser-webpack-plugin';

/** @type {import('next').NextConfig} */
const nextConfig = {
  typescript: {
    ignoreBuildErrors: true,
  },
  // Disable X-Powered-By header to prevent server information disclosure
  poweredByHeader: false,
  // Enable production optimizations
  swcMinify: true,
  compress: true,
  
  // Webpack configuration to remove comments and obfuscate code
  webpack: (config, { dev, isServer }) => {
    if (!dev) {
      // Production optimizations
      config.optimization = {
        ...config.optimization,
        minimize: true,
        minimizer: [
          ...config.optimization.minimizer,
          // Custom minimizer to remove comments
          new TerserPlugin({
            terserOptions: {
              compress: {
                drop_console: true,
                drop_debugger: true,
                pure_funcs: ['console.log', 'console.info', 'console.debug', 'console.warn'],
              },
              mangle: {
                // Obfuscate function and variable names
                toplevel: true,
                properties: {
                  regex: /^_/,
                },
              },
              format: {
                // Remove all comments
                comments: false,
              },
            },
            extractComments: false,
          }),
        ],
      };

      // Remove source maps in production
      config.devtool = false;
      
      // Optimize module concatenation
      config.optimization.concatenateModules = true;
      
      // Remove comments from CSS
      if (config.module && config.module.rules) {
        config.module.rules.forEach((rule) => {
          if (rule.use && Array.isArray(rule.use)) {
            rule.use.forEach((use) => {
              if (use.loader && use.loader.includes('css-loader')) {
                use.options = {
                  ...use.options,
                  minimize: true,
                };
              }
            });
          }
        });
      }
    }
    
    return config;
  },
  
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
