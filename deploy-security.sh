#!/bin/bash

# Security deployment script for Next.js application
echo "🔒 Applying security configurations..."

# Set environment variables for production
export NODE_ENV=production
export NEXT_PUBLIC_APP_URL=https://mycowrkr.cloud

# Build the application
echo "📦 Building Next.js application..."
npm run build

# Create custom error pages for nginx
echo "��️ Creating custom error pages..."
sudo mkdir -p /var/www/html

# Create generic 404 page
sudo tee /var/www/html/404.html > /dev/null << 'HTML'
<!DOCTYPE html>
<html>
<head>
    <title>Page Not Found</title>
    <style>
        body { font-family: Arial, sans-serif; text-align: center; padding: 50px; }
        h1 { color: #666; }
    </style>
</head>
<body>
    <h1>404 - Page Not Found</h1>
    <p>The requested page could not be found.</p>
</body>
</html>
HTML

# Create generic 500 page
sudo tee /var/www/html/50x.html > /dev/null << 'HTML'
<!DOCTYPE html>
<html>
<head>
    <title>Server Error</title>
    <style>
        body { font-family: Arial, sans-serif; text-align: center; padding: 50px; }
        h1 { color: #666; }
    </style>
</head>
<body>
    <h1>500 - Server Error</h1>
    <p>An internal server error occurred.</p>
</body>
</html>
HTML

# Update nginx configuration
echo "🔧 Updating nginx configuration..."
if [ -f "nginx.conf" ]; then
    sudo cp nginx.conf /etc/nginx/sites-available/default
    sudo nginx -t && sudo systemctl reload nginx
    echo "✅ Nginx configuration updated successfully"
else
    echo "❌ nginx.conf not found"
fi

# Start the application with PM2
echo "🚀 Starting application with PM2..."
pm2 start ecosystem.config.js --env production

echo "✅ Security deployment completed!"
echo "🔍 Test your application:"
echo "   - Check headers: curl -I https://mycowrkr.cloud"
echo "   - Test TRACE method: curl -X TRACE https://mycowrkr.cloud"
echo "   - Test OPTIONS method: curl -X OPTIONS https://mycowrkr.cloud"
