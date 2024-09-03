module.exports = {
  apps: [
    {
      name: "nextjs-app",
      script: "npm",
      args: "start",
      cwd: "/usr/src/app",
      env: {
        NODE_ENV: "production",
      },
    },
    {
      name: "express-app",
      script: "npm",
      args: "start",
      cwd: "/usr/src/app/backend",
      env: {
        NODE_ENV: "production",
        APP_URL: process.env.BE_APP_URL,
        DB_URL: process.env.DB_URL,
        PORT: process.env.DB_PORT,
        JWT_SECRET: process.env.JWT_SECRET,
        REFRESH_SECRET: process.env.REFRESH_SECRET,
        NEXT_PUBLIC_APP_URL: process.env.NEXT_PUBLIC_APP_URL,
        NEXT_PUBLIC_OPEN_API_FOR_CHAT:
          process.env.NEXT_PUBLIC_OPEN_API_FOR_CHAT,
        NEXT_PUBLIC_OPEN_API_KEY_FOR_CHAT:
          process.env.NEXT_PUBLIC_OPEN_API_KEY_FOR_CHAT,
        NEXT_PUBLIC_APP_VERSION: process.env.NEXT_PUBLIC_APP_VERSION,
        MAIL_API_EMAIL: process.env.MAIL_API_EMAIL,
        MAIL_API_PASSWORD: process.env.MAIL_API_PASSWORD,
      },
    },
  ],
}
