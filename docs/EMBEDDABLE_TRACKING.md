# Embeddable Customer Tracking System

This document describes how to embed and use the customer tracking system in external applications, websites, or third-party integrations.

## Overview

The embeddable tracking system allows you to track customer interactions across multiple platforms and applications using a simple JavaScript snippet. It provides both automatic and manual tracking capabilities.

## Quick Start

### 1. Include the Script

Add this script tag to your HTML page:

```html
<script src="https://your-domain.com/embed-tracker.js"></script>
```

### 2. Basic Usage

```javascript
// Track a login event
window.EmbedTracker.trackLoginEvent({
  user_id: "user_123",
  email: "user@company.com",
  organization: "org_id",
  login_method: "email_password",
})

// Track customer interaction
window.EmbedTracker.trackCustomerEvent({
  customer_id: "customer_456",
  customer_name: "Acme Corp",
  interaction_type: "profile_view",
})

// Track feature usage
window.EmbedTracker.trackFeatureUsage("chat_feature", {
  user_id: "user_123",
  email: "user@company.com",
})
```

## Features

### 🔧 **Automatic Tracking**

- **Session Management**: Automatically tracks session start/end
- **Page Views**: Tracks page loads and visibility changes
- **Click Tracking**: Automatically tracks clicks on elements with `data-track` attributes
- **Device Information**: Captures device and browser information

### 🎯 **Manual Tracking**

- **Custom Events**: Track any custom event with detailed data
- **Customer Interactions**: Track customer-specific actions
- **Feature Usage**: Track feature adoption and usage patterns
- **Login Events**: Track user authentication events

### ⚙️ **Configuration**

- **Endpoint Configuration**: Set custom tracking endpoints
- **Debug Mode**: Enable/disable debug logging
- **Authentication**: Configure API tokens
- **Session Management**: Automatic session ID generation

## API Reference

### Core Methods

#### `trackEvent(eventName, eventData)`

Track any custom event.

```javascript
window.EmbedTracker.trackEvent("custom_event", {
  event_category: "user_action",
  event_action: "button_click",
  additional_data: {
    button_id: "submit_form",
    form_type: "contact",
  },
})
```

#### `trackLoginEvent(userData)`

Track user login events.

```javascript
window.EmbedTracker.trackLoginEvent({
  user_id: "user_123",
  email: "user@company.com",
  organization: "org_id",
  login_method: "email_password",
  additional_data: {
    login_source: "web_app",
    session_duration: "2 hours",
  },
})
```

#### `trackCustomerEvent(customerData)`

Track customer-specific interactions.

```javascript
window.EmbedTracker.trackCustomerEvent({
  customer_id: "customer_456",
  customer_name: "Acme Corp",
  interaction_type: "profile_view",
  additional_data: {
    interaction_duration: "5 minutes",
    customer_tier: "enterprise",
    health_score: 85,
  },
})
```

#### `trackFeatureUsage(featureName, userData)`

Track feature usage patterns.

```javascript
window.EmbedTracker.trackFeatureUsage("chat_feature", {
  user_id: "user_123",
  email: "user@company.com",
  organization: "org_id",
  additional_data: {
    feature_version: "2.1.0",
    usage_duration: "30 minutes",
  },
})
```

### Configuration Methods

#### `configure(options)`

Configure the tracker settings.

```javascript
window.EmbedTracker.configure({
  endpoint: "https://api.yourdomain.com/events",
  authToken: "your_auth_token",
  debug: true,
  version: "1.0.0",
})
```

#### `setDebug(enabled)`

Enable or disable debug logging.

```javascript
window.EmbedTracker.setDebug(true) // Enable debug mode
window.EmbedTracker.setDebug(false) // Disable debug mode
```

## Automatic Tracking with Data Attributes

### Click Tracking

Add `data-track` and `data-track-data` attributes to any HTML element:

```html
<!-- Simple click tracking -->
<button data-track="button_click">Click Me</button>

<!-- Click tracking with custom data -->
<button
  data-track="customer_action"
  data-track-data='{"customer_id": "cust_123", "action": "view_profile"}'
>
  View Customer Profile
</button>

<!-- Complex tracking data -->
<div
  data-track="product_view"
  data-track-data='{"product_id": "prod_456", "category": "software", "price": "$99"}'
>
  <h3>Product Name</h3>
  <p>Product description...</p>
</div>
```

### Automatic Events Tracked

1. **Session Events**:

   - `session_start`: When user starts a new session
   - `page_view`: When page loads
   - `page_hidden`: When page becomes hidden
   - `page_visible`: When page becomes visible
   - `page_unload`: When user leaves the page

2. **Click Events**:
   - Any element with `data-track` attribute
   - Captures element information (tag, id, class, text)

## Data Structure

### Standard Event Payload

```javascript
{
  feature_id: "event_name",
  feature_date: "2024-01-15T10:30:00Z",
  device: "web",
  url: "https://example.com/page",
  timestamp: "2024-01-15T10:30:00Z",
  userAgent: "Mozilla/5.0...",
  session_id: "session_1234567890_abc123",
  embed_version: "1.0.0",
  // ... custom event data
}
```

### Customer Event Data

```javascript
{
  customer_id: "customer_123",
  customer_name: "Acme Corp",
  interaction_type: "profile_view",
  additional_data: {
    interaction_duration: "5 minutes",
    customer_tier: "enterprise",
    health_score: 85
  }
}
```

### User Event Data

```javascript
{
  user_id: "user_123",
  email: "user@company.com",
  organization: "org_id",
  login_method: "email_password",
  additional_data: {
    login_source: "web_app",
    session_duration: "2 hours"
  }
}
```

## Integration Examples

### React Component

```jsx
import React, { useEffect } from "react"

const CustomerCard = ({ customer }) => {
  useEffect(() => {
    // Track when component mounts
    window.EmbedTracker.trackCustomerEvent({
      customer_id: customer.id,
      customer_name: customer.name,
      interaction_type: "card_view",
    })
  }, [customer])

  const handleViewDetails = () => {
    window.EmbedTracker.trackCustomerEvent({
      customer_id: customer.id,
      customer_name: customer.name,
      interaction_type: "details_click",
    })
    // Navigate to details page
  }

  return (
    <div className="customer-card">
      <h3>{customer.name}</h3>
      <button onClick={handleViewDetails}>View Details</button>
    </div>
  )
}
```

### Vue.js Component

```vue
<template>
  <div
    class="customer-card"
    data-track="customer_card_view"
    :data-track-data="trackingData"
  >
    <h3>{{ customer.name }}</h3>
    <button @click="trackAndView">View Details</button>
  </div>
</template>

<script>
export default {
  props: ["customer"],
  computed: {
    trackingData() {
      return JSON.stringify({
        customer_id: this.customer.id,
        customer_name: this.customer.name,
        arr: this.customer.arr,
      })
    },
  },
  methods: {
    trackAndView() {
      window.EmbedTracker.trackCustomerEvent({
        customer_id: this.customer.id,
        customer_name: this.customer.name,
        interaction_type: "details_click",
      })
      // Navigate to details
    },
  },
}
</script>
```

### Angular Component

```typescript
import { Component, Input, OnInit } from "@angular/core"

declare global {
  interface Window {
    EmbedTracker: any
  }
}

@Component({
  selector: "app-customer-card",
  template: `
    <div
      class="customer-card"
      [attr.data-track]="'customer_card_view'"
      [attr.data-track-data]="trackingData"
    >
      <h3>{{ customer.name }}</h3>
      <button (click)="trackAndView()">View Details</button>
    </div>
  `,
})
export class CustomerCardComponent implements OnInit {
  @Input() customer: any

  ngOnInit() {
    window.EmbedTracker.trackCustomerEvent({
      customer_id: this.customer.id,
      customer_name: this.customer.name,
      interaction_type: "card_view",
    })
  }

  trackAndView() {
    window.EmbedTracker.trackCustomerEvent({
      customer_id: this.customer.id,
      customer_name: this.customer.name,
      interaction_type: "details_click",
    })
    // Navigate to details
  }

  get trackingData(): string {
    return JSON.stringify({
      customer_id: this.customer.id,
      customer_name: this.customer.name,
      arr: this.customer.arr,
    })
  }
}
```

## Configuration Options

### Environment Variables

You can configure the tracker using environment variables or by calling `configure()`:

```javascript
// Configure with custom settings
window.EmbedTracker.configure({
  endpoint: process.env.TRACKING_ENDPOINT || "http://localhost:5001/api/events",
  authToken: process.env.TRACKING_TOKEN || "your_auth_token",
  debug: process.env.NODE_ENV === "development",
  version: "1.0.0",
})
```

### Default Configuration

```javascript
{
  endpoint: 'http://localhost:5001/api/events',
  authToken: '666158fe71bfe10b58cb23eea',
  version: '1.0.0',
  debug: false
}
```

## Error Handling

The tracker includes built-in error handling:

```javascript
// Events are queued if tracker isn't ready
window.EmbedTracker.trackEvent("early_event", { data: "value" })

// Network errors are logged but don't break the app
window.EmbedTracker.trackEvent("network_test", { data: "value" })
// If network fails, error is logged to console (if debug is enabled)
```

## Best Practices

### 1. **Privacy Compliance**

- Always inform users about tracking
- Respect privacy settings and opt-outs
- Don't track sensitive information

### 2. **Performance**

- Load the tracker script asynchronously
- Use data attributes for automatic tracking when possible
- Batch events if needed for high-traffic sites

### 3. **Data Quality**

- Use consistent event names
- Include relevant context data
- Validate data before sending

### 4. **Debugging**

- Enable debug mode in development
- Check browser console for tracking logs
- Verify network requests in dev tools

## Troubleshooting

### Common Issues

1. **Script not loading**:

   - Check the script URL
   - Verify CORS settings on your server
   - Check browser console for errors

2. **Events not sending**:

   - Verify endpoint URL is correct
   - Check authentication token
   - Enable debug mode to see logs

3. **Data not appearing**:
   - Check server logs for incoming requests
   - Verify data format matches server expectations
   - Test with simple events first

### Debug Mode

Enable debug mode to see detailed logs:

```javascript
window.EmbedTracker.setDebug(true)
```

This will log all tracking events to the browser console.

## Security Considerations

1. **HTTPS Only**: Always use HTTPS in production
2. **Token Security**: Keep authentication tokens secure
3. **Data Validation**: Validate all tracking data
4. **Rate Limiting**: Implement rate limiting on your server
5. **CORS**: Configure CORS properly for cross-origin requests

## Support

For issues or questions:

1. Check the browser console for error messages
2. Enable debug mode for detailed logging
3. Verify network requests in browser dev tools
4. Test with the provided example HTML file
