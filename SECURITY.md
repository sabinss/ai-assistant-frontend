# Security Configuration

This document outlines the security measures implemented to address the "Proxy Disclosure" vulnerability and other security concerns.

## Issues Addressed

### 1. Proxy Disclosure (CWEID: 204)
- **Problem**: Server headers revealing infrastructure details (nginx/1.24.0, awselb/2.0, Next.js)
- **Solution**: 
  - Disabled `X-Powered-By` header in Next.js config
  - Removed server identification headers in middleware
  - Configured nginx to hide version information
  - Added custom error pages to prevent fingerprinting

### 2. HTTP Method Disclosure
- **Problem**: TRACE, OPTIONS, and TRACK methods enabled
- **Solution**: 
  - Blocked dangerous HTTP methods in middleware
  - Configured nginx to reject TRACE and TRACK requests
  - Limited allowed methods to GET, HEAD, POST, PUT, DELETE, PATCH

### 3. Server Version Disclosure
- **Problem**: Server and X-Powered-By headers revealing technology stack
- **Solution**:
  - Set `poweredByHeader: false` in Next.js config
  - Added header removal in middleware
  - Configured nginx to hide upstream server headers

## Files Modified

### Application Level
- `next.config.mjs` - Disabled server headers, added security headers
- `middleware.ts` - Blocked dangerous methods, removed server headers
- `src/app/not-found.tsx` - Custom 404 page
- `src/app/error.tsx` - Custom error page
- `src/app/global-error.tsx` - Global error handler

### Infrastructure Level
- `nginx.conf` - Server configuration to hide versions and block methods
- `Dockerfile.production` - Secure Docker configuration
- `deploy-security.sh` - Deployment script with security measures

## Deployment Instructions

### Option 1: Using the Security Deployment Script
```bash
./deploy-security.sh
```

### Option 2: Manual Deployment
1. Build the application:
   ```bash
   npm run build
   ```

2. Update nginx configuration:
   ```bash
   sudo cp nginx.conf /etc/nginx/sites-available/default
   sudo nginx -t && sudo systemctl reload nginx
   ```

3. Start with PM2:
   ```bash
   pm2 start ecosystem.config.js --env production
   ```

### Option 3: Docker Deployment
```bash
docker build -f Dockerfile.production -t your-app .
docker run -p 3000:3000 your-app
```

## Testing Security Fixes

After deployment, test the following:

1. **Check server headers**:
   ```bash
   curl -I https://mycowrkr.cloud
   ```
   Should NOT show: `Server: nginx/1.24.0`, `X-Powered-By: Next.js`

2. **Test blocked HTTP methods**:
   ```bash
   curl -X TRACE https://mycowrkr.cloud
   curl -X OPTIONS https://mycowrkr.cloud
   ```
   Should return 405 Method Not Allowed

3. **Test error pages**:
   ```bash
   curl https://mycowrkr.cloud/nonexistent-page
   ```
   Should return custom 404 page without server details

## Security Headers Applied

- `X-Frame-Options: DENY`
- `X-Content-Type-Options: nosniff`
- `X-XSS-Protection: 1; mode=block`
- `Referrer-Policy: strict-origin-when-cross-origin`
- `Permissions-Policy: camera=(), microphone=(), geolocation=()`
- `Content-Security-Policy: [comprehensive CSP]`
- `Strict-Transport-Security: max-age=31536000; includeSubDomains; preload`

## Compliance

These changes address:
- CASA Tier 2 & Tier 3 security requirements
- OWASP security guidelines
- CWE-204 (Proxy Disclosure) vulnerability
- Server information disclosure prevention
- HTTP method restriction best practices
