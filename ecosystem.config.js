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
        NEXT_PUBLIC_APP_URL: "http://52.200.128.96:3000",
        NEXTAUTH_URL: "http://52.200.128.96:3000",
        NEXT_PUBLIC_OPEN_API_KEY_FOR_CHAT:
          "LzoxbGt7BQD_LZebon69EtwpUez-Zcmeblqd22L829OnMUP9WVyy0Q",
        NEXT_PUBLIC_APP_VERSION: "api/v1",
        NEXT_PUBLIC_OPEN_API_FOR_CHAT: "https://3.18.9.82/api",
        NEXT_PUBLIC_APP_FE_URL: " http://52.200.128.96:3000",
      },
      env_production: {
        NODE_ENV: "production",
      },
    },
  ],
}
