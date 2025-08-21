module.exports = {
  apps: [
    {
      name: "my-nextjs-app",
      script: "node_modules/.bin/next",
      args: "start",
      cwd: "/home/ubuntu/aiassistance-deploy",
      instances: 1,
      autorestart: true,
      watch: false,
      max_memory_restart: "1G",
      env: {
        NODE_ENV: "production",
        PORT: 3000,
        NEXT_PUBLIC_APP_URL:
          process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000",
        NEXTAUTH_URL: process.env.NEXTAUTH_URL || "http://localhost:3000",
        NEXT_PUBLIC_OPEN_API_KEY_FOR_CHAT:
          process.env.NEXT_PUBLIC_OPEN_API_KEY_FOR_CHAT || "",
        NEXT_PUBLIC_APP_VERSION:
          process.env.NEXT_PUBLIC_APP_VERSION || "api/v1",
        NEXT_PUBLIC_OPEN_API_FOR_CHAT:
          process.env.NEXT_PUBLIC_OPEN_API_FOR_CHAT || "http://localhost:3000",
        NEXT_PUBLIC_APP_FE_URL:
          process.env.NEXT_PUBLIC_APP_FE_URL || "http://localhost:3000",
      },
      env_production: {
        NODE_ENV: "production",
      },
    },
  ],
}
