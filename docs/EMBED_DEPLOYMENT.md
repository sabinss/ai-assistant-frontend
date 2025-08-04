# Embeddable Tracker Deployment Guide

This guide explains how to deploy and serve the embeddable tracking system for use by external applications.

## Deployment Options

### Option 1: Static File Hosting

#### Using Your Existing Next.js App

1. **Place the files in your public directory**:

   ```
   public/
   ├── embed-tracker.js
   └── embed-example.html
   ```

2. **Serve via your existing domain**:
   ```html
   <script src="https://your-domain.com/embed-tracker.js"></script>
   ```

#### Using CDN (Recommended for Production)

1. **Upload to a CDN service** (AWS CloudFront, Cloudflare, etc.)
2. **Use the CDN URL**:
   ```html
   <script src="https://cdn.your-domain.com/embed-tracker.js"></script>
   ```

### Option 2: Dedicated Tracking Domain

#### Using a Subdomain

1. **Create a subdomain** (e.g., `tracking.yourdomain.com`)
2. **Set up static hosting** on the subdomain
3. **Upload the tracker files**:
   ```
   tracking.yourdomain.com/
   ├── embed-tracker.js
   └── embed-example.html
   ```

#### Using a Separate Domain

1. **Register a dedicated domain** (e.g., `tracker.yourcompany.com`)
2. **Set up static hosting**
3. **Upload the tracker files**

## Configuration for Different Environments

### Development Environment

```javascript
// In embed-tracker.js, update CONFIG
const CONFIG = {
  endpoint: "http://localhost:5001/api/events",
  authToken: "dev_token_here",
  version: "1.0.0",
  debug: true,
}
```

### Staging Environment

```javascript
const CONFIG = {
  endpoint: "https://staging-api.yourdomain.com/api/events",
  authToken: "staging_token_here",
  version: "1.0.0",
  debug: true,
}
```

### Production Environment

```javascript
const CONFIG = {
  endpoint: "https://api.yourdomain.com/api/events",
  authToken: "prod_token_here",
  version: "1.0.0",
  debug: false,
}
```

## CORS Configuration

### Backend CORS Setup

Ensure your API server allows requests from the domains where the tracker will be embedded:

```javascript
// Example CORS configuration for your API server
app.use(
  cors({
    origin: [
      "https://yourdomain.com",
      "https://client1.com",
      "https://client2.com",
      "https://*.yourdomain.com",
    ],
    methods: ["POST", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
    credentials: true,
  })
)
```

### Environment-Specific CORS

```javascript
// Development
origin: ["http://localhost:3000", "http://localhost:3001"]

// Staging
origin: ["https://staging.yourdomain.com", "https://staging.client.com"]

// Production
origin: ["https://yourdomain.com", "https://client.com"]
```

## Security Considerations

### 1. Token Management

```javascript
// Use environment variables for tokens
const CONFIG = {
  endpoint: process.env.TRACKING_ENDPOINT,
  authToken: process.env.TRACKING_TOKEN,
  version: process.env.TRACKING_VERSION || "1.0.0",
  debug: process.env.NODE_ENV === "development",
}
```

### 2. Rate Limiting

Implement rate limiting on your API endpoint:

```javascript
// Example rate limiting
const rateLimit = require("express-rate-limit")

const trackingLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: "Too many tracking requests from this IP",
})

app.use("/api/events", trackingLimiter)
```

### 3. Data Validation

```javascript
// Validate tracking data on your server
const validateTrackingData = (data) => {
  const required = ["feature_id", "timestamp"]
  const missing = required.filter((field) => !data[field])

  if (missing.length > 0) {
    throw new Error(`Missing required fields: ${missing.join(", ")}`)
  }

  // Additional validation as needed
  return true
}
```

## Monitoring and Analytics

### 1. Server Logs

Monitor your API endpoint for tracking requests:

```javascript
// Add logging middleware
app.use("/api/events", (req, res, next) => {
  console.log(
    `[TRACKING] ${new Date().toISOString()} - ${req.ip} - ${req.body.feature_id}`
  )
  next()
})
```

### 2. Error Monitoring

```javascript
// Track errors in the embeddable tracker
.catch(error => {
  utils.log('Error sending tracking event:', error);

  // Send error to monitoring service
  if (typeof window !== 'undefined' && window.gtag) {
    window.gtag('event', 'tracking_error', {
      event_category: 'tracking',
      event_label: error.message
    });
  }
});
```

## Version Management

### 1. Versioned URLs

Serve different versions of the tracker:

```
https://tracking.yourdomain.com/v1/embed-tracker.js
https://tracking.yourdomain.com/v2/embed-tracker.js
https://tracking.yourdomain.com/latest/embed-tracker.js
```

### 2. Breaking Changes

When making breaking changes:

1. **Create a new version** (e.g., v2.0.0)
2. **Keep old version available** for existing clients
3. **Notify clients** about the new version
4. **Provide migration guide**

## Performance Optimization

### 1. Minification

Minify the tracker for production:

```bash
# Using terser
npx terser embed-tracker.js -o embed-tracker.min.js --compress --mangle
```

### 2. Compression

Enable gzip compression on your server:

```nginx
# Nginx configuration
location ~* \.js$ {
    gzip on;
    gzip_types text/javascript application/javascript;
}
```

### 3. Caching

Set appropriate cache headers:

```nginx
# Cache the tracker for 1 hour
location ~* embed-tracker\.js$ {
    expires 1h;
    add_header Cache-Control "public, immutable";
}
```

## Testing the Deployment

### 1. Test Script

Create a test HTML file:

```html
<!doctype html>
<html>
  <head>
    <title>Tracker Test</title>
  </head>
  <body>
    <h1>Tracker Test Page</h1>
    <button data-track="test_click" data-track-data='{"test": true}'>
      Test Click
    </button>

    <script src="https://tracking.yourdomain.com/embed-tracker.js"></script>
    <script>
      // Test the tracker
      window.EmbedTracker.setDebug(true)

      setTimeout(() => {
        window.EmbedTracker.trackEvent("test_event", {
          test: true,
          timestamp: new Date().toISOString(),
        })
      }, 1000)
    </script>
  </body>
</html>
```

### 2. Browser Testing

Test in different browsers:

- Chrome
- Firefox
- Safari
- Edge
- Mobile browsers

### 3. Network Testing

Test with different network conditions:

- Slow connections
- Intermittent connectivity
- Offline scenarios

## Troubleshooting Deployment

### Common Issues

1. **CORS Errors**:

   - Check CORS configuration on your API server
   - Verify the origin domain is allowed
   - Test with browser dev tools

2. **404 Errors**:

   - Verify the tracker file is accessible
   - Check file permissions
   - Test the URL directly in browser

3. **Authentication Errors**:
   - Verify the auth token is correct
   - Check token expiration
   - Test with curl or Postman

### Debug Steps

1. **Enable debug mode**:

   ```javascript
   window.EmbedTracker.setDebug(true)
   ```

2. **Check browser console** for errors

3. **Verify network requests** in browser dev tools

4. **Test API endpoint** directly:
   ```bash
   curl -X POST https://api.yourdomain.com/api/events \
     -H "Content-Type: application/json" \
     -H "Authorization: Bearer your_token" \
     -d '{"test": true}'
   ```

## Client Integration Support

### 1. Documentation

Provide clear documentation for clients:

- Installation instructions
- API reference
- Examples for different frameworks
- Troubleshooting guide

### 2. Support Channels

Set up support for client questions:

- Email support
- Documentation site
- GitHub issues (if open source)
- Slack/Discord community

### 3. Client Onboarding

Create onboarding materials:

- Quick start guide
- Video tutorials
- Code examples
- Best practices
