# Event Tracking Implementation Guide

This guide provides step-by-step instructions for implementing event tracking functionality that sends data to our analytics API.

## Overview

The `trackEvent` function allows clients to track user interactions and feature usage by sending event data to our analytics endpoint. This data is used for customer insights, feature adoption analysis, and user behavior tracking.

## Step 1: Include the Tracking Script

### Option A: Direct Script Inclusion

Add the following script tag to your HTML `<head>` or before the closing `</body>` tag:

```html
<script src="https://your-domain.com/tracker.js"></script>
```

### Option B: Self-Hosted Script

Download the `tracker.js` file and include it locally:

```html
<script src="./tracker.js"></script>
```

## Step 2: Basic Implementation

Once the script is loaded, you can call the `trackEvent` function from anywhere in your application:

```javascript
// Basic usage
trackEvent("feature_name", {
  email: "user@example.com",
  feature: "feature_identifier",
  organization: "org_id_here",
})
```

## Step 3: Function Parameters

The `trackEvent` function takes two parameters:

### Parameter 1: `feature` (string)

A descriptive name for the feature or action being tracked.

**Examples:**

- `'user_login'`
- `'document_upload'`
- `'payment_completed'`
- `'search_query'`

### Parameter 2: `data` (object)

An object containing the event data with the following properties:

| Property       | Type   | Required | Description          | Example                      |
| -------------- | ------ | -------- | -------------------- | ---------------------------- |
| `email`        | string | ✅       | User's email address | `'john@company.com'`         |
| `feature`      | string | ✅       | Feature identifier   | `'chat_initiated'`           |
| `organization` | string | ❌       | Organization ID      | `'66158fe71bfe10b58cb23eea'` |

## Step 4: Implementation Examples

### Example 1: User Login Tracking

```javascript
// Track when a user successfully logs in
trackEvent("user_login", {
  email: "user@company.com",
  feature: "authentication_success",
  organization: "org_12345",
})
```

### Example 2: Feature Usage Tracking

```javascript
// Track when a user uses a specific feature
trackEvent("feature_usage", {
  email: "user@company.com",
  feature: "document_analyzer",
  organization: "org_12345",
})
```

### Example 3: Error Tracking

```javascript
// Track when errors occur
trackEvent("error_occurred", {
  email: "user@company.com",
  feature: "api_integration_error",
  organization: "org_12345",
})
```

### Example 4: User Action Tracking

```javascript
// Track user interactions
trackEvent("user_action", {
  email: "user@company.com",
  feature: "button_click",
  organization: "org_12345",
})
```

## Step 5: Integration with Event Listeners

### Button Click Tracking

```javascript
document.getElementById("submit-button").addEventListener("click", function () {
  trackEvent("button_click", {
    email: getCurrentUserEmail(), // Your function to get user email
    feature: "form_submission",
    organization: getCurrentOrgId(), // Your function to get org ID
  })
})
```

### Form Submission Tracking

```javascript
document
  .getElementById("contact-form")
  .addEventListener("submit", function (e) {
    trackEvent("form_submitted", {
      email: document.getElementById("email").value,
      feature: "contact_form",
      organization: getCurrentOrgId(),
    })
  })
```

### Page View Tracking

```javascript
// Track page views
document.addEventListener("DOMContentLoaded", function () {
  trackEvent("page_view", {
    email: getCurrentUserEmail(),
    feature: "homepage_loaded",
    organization: getCurrentOrgId(),
  })
})
```

## Step 6: React/Component Integration

### React Component Example

```jsx
import React from "react"

function MyComponent() {
  const handleFeatureUse = () => {
    // Your feature logic here

    // Track the event
    if (window.trackEvent) {
      window.trackEvent("feature_used", {
        email: user.email,
        feature: "my_component_feature",
        organization: user.organizationId,
      })
    }
  }

  return <button onClick={handleFeatureUse}>Use Feature</button>
}
```

### Vue.js Example

```javascript
export default {
  methods: {
    trackFeatureUsage() {
      // Your feature logic here

      // Track the event
      if (window.trackEvent) {
        window.trackEvent("feature_used", {
          email: this.user.email,
          feature: "vue_component_feature",
          organization: this.user.organizationId,
        })
      }
    },
  },
}
```

## Step 7: Error Handling

The tracking function includes built-in error handling, but you can add additional error handling:

```javascript
try {
  trackEvent("feature_used", {
    email: user.email,
    feature: "important_feature",
    organization: user.organizationId,
  })
} catch (error) {
  console.error("Failed to track event:", error)
  // Fallback tracking or error reporting
}
```

## Step 8: Testing

### Verify Script Loading

Check the browser console to ensure the script loaded successfully:

```javascript
// Should return the function definition
console.log(typeof window.trackEvent)
```

### Test Event Sending

Send a test event and check the console for the API response:

```javascript
trackEvent("test_event", {
  email: "test@example.com",
  feature: "testing",
  organization: "test_org",
})
```

You should see:

1. "Raw req.body:" log with the payload
2. "✅ API Response:" log with the server response

## Step 9: Production Considerations

### Environment Variables

For production, consider using environment variables for the API endpoint:

```javascript
// In your tracker.js
const API_ENDPOINT =
  process.env.TRACKING_API_URL || "https://your-api-endpoint.com"
```

### Rate Limiting

Implement rate limiting to prevent excessive API calls:

```javascript
let lastTrackTime = 0
const MIN_INTERVAL = 1000 // 1 second minimum between calls

function throttledTrackEvent(feature, data) {
  const now = Date.now()
  if (now - lastTrackTime < MIN_INTERVAL) {
    return // Skip if called too frequently
  }

  lastTrackTime = now
  trackEvent(feature, data)
}
```

### Offline Support

Consider adding offline support for tracking:

```javascript
function trackEventWithOfflineSupport(feature, data) {
  if (navigator.onLine) {
    trackEvent(feature, data)
  } else {
    // Store in localStorage for later sync
    const offlineEvents = JSON.parse(
      localStorage.getItem("offlineEvents") || "[]"
    )
    offlineEvents.push({ feature, data, timestamp: Date.now() })
    localStorage.setItem("offlineEvents", JSON.stringify(offlineEvents))
  }
}
```

## Troubleshooting

### Common Issues

1. **Script not loading**: Check the script path and network connectivity
2. **Function not defined**: Ensure the script loads before calling `trackEvent`
3. **API errors**: Check the browser console for error messages
4. **CORS issues**: Ensure the API endpoint allows requests from your domain

### Debug Mode

Enable debug logging by setting a flag:

```javascript
// Set this before calling trackEvent
window.TRACKING_DEBUG = true

// The function will log additional information when debug is enabled
```

## API Endpoint Details

- **URL**: `https://grjr9d0i7k.execute-api.us-east-2.amazonaws.com/dev/api/customer_features`
- **Method**: POST
- **Content-Type**: application/json
- **Authorization**: Bearer token required

## Support

For technical support or questions about implementing event tracking, please contact our development team or refer to the API documentation.

---

**Note**: This tracking implementation is designed to be lightweight and non-intrusive. It automatically handles network errors and provides detailed logging for debugging purposes.
