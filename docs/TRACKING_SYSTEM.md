# Customer Tracking System

This document describes the improved customer tracking system for the AI Assistant Frontend application.

## Overview

The tracking system has been redesigned to provide better type safety, flexibility, and comprehensive customer event tracking. It supports tracking various customer interactions including login events, feature usage, and custom events.

## Architecture

### Core Components

1. **Global Tracker (`public/tracker.js`)**: Updated to handle flexible event data
2. **TypeScript Tracking Service (`src/utility/tracking.ts`)**: Main tracking service with type safety
3. **Global Type Declarations (`src/types/global.d.ts`)**: TypeScript declarations for global functions
4. **Example Usage (`src/utility/tracking-examples.ts`)**: Examples of how to use the tracking system

## Features

### 1. Type-Safe Tracking

- Full TypeScript support with proper interfaces
- Compile-time error checking
- IntelliSense support in IDEs

### 2. Flexible Event Data

- Support for custom event data
- Automatic timestamp and device information
- Extensible payload structure

### 3. Multiple Tracking Methods

- `trackLoginEvent()`: Specifically for login events
- `trackFeatureUsage()`: For feature usage tracking
- `trackCustomerInteraction()`: For customer interactions
- `trackCustomerEvent()`: For custom events

### 4. Environment Configuration

- Configurable tracking URL via `NEXT_PUBLIC_TRACKING_URL`
- Configurable auth token via `NEXT_PUBLIC_TRACKING_TOKEN`
- Fallback to default values

## Usage Examples

### Basic Login Tracking

```typescript
import { trackLoginEvent } from "@/utility/tracking"

// In your login component
trackLoginEvent({
  email: userData.email,
  organization: userData.organization,
  user_id: userData.user_id,
  customer_id: userData.user_id,
  additional_data: {
    login_success: true,
    session_id: sessionData.session_id,
  },
})
```

### Feature Usage Tracking

```typescript
import { trackFeatureUsage } from "@/utility/tracking"

// Track when a customer uses a specific feature
trackFeatureUsage("chat_interaction", {
  email: userData.email,
  organization: userData.organization,
  user_id: userData.user_id,
  customer_id: userData.user_id,
  additional_data: {
    chat_type: "ai_assistant",
    feature_accessed_at: new Date().toISOString(),
  },
})
```

### Custom Event Tracking

```typescript
import { trackCustomerEvent } from "@/utility/tracking"

// Track any custom event
trackCustomerEvent("configuration_change", {
  email: userData.email,
  organization: userData.organization,
  user_id: userData.user_id,
  customer_id: userData.user_id,
  additional_data: {
    config_type: "chat_settings",
    old_value: oldSettings,
    new_value: newSettings,
  },
})
```

## Data Structure

### TrackingEvent Interface

```typescript
interface TrackingEvent {
  feature_id: string
  feature_date: string
  device: string
  url: string
  timestamp: string
  userAgent: string
  email?: string
  organization?: string
  user_id?: string
  [key: string]: any
}
```

### CustomerTrackingData Interface

```typescript
interface CustomerTrackingData {
  email?: string
  organization?: string
  user_id?: string
  customer_id?: string
  feature_name?: string
  interaction_type?: string
  additional_data?: Record<string, any>
}
```

## Implementation in Login Page

The login page (`src/app/auth/signin/page.tsx`) has been updated to use the new tracking system:

```typescript
// Before (old implementation)
window.trackEvent("login_event", {
  feature_id: "login_event",
  email,
  organization,
  feature_date: new Date().toISOString(),
  device: "web",
  url: window.location.href,
  timestamp: new Date().toISOString(),
  userAgent: navigator.userAgent,
})

// After (new implementation)
trackLoginEvent({
  email,
  organization,
  user_id,
  customer_id: user_id,
  additional_data: {
    login_success: true,
    session_id: res.data?.chatSession?.session_id || null,
    role_permissions: res.data?.rolePermission || [],
  },
})
```

## Benefits

1. **Better Type Safety**: TypeScript interfaces prevent runtime errors
2. **Cleaner Code**: Simplified function calls with proper parameter structure
3. **Extensibility**: Easy to add new tracking events and data
4. **Maintainability**: Centralized tracking logic with clear separation of concerns
5. **Backward Compatibility**: Still supports the global `window.trackEvent` function
6. **Environment Configuration**: Configurable endpoints and tokens
7. **Error Handling**: Proper error handling and logging

## Migration Guide

### From Old Tracking System

1. Replace `window.trackEvent()` calls with appropriate tracking functions
2. Update event data structure to match new interfaces
3. Use the new tracking service for better type safety

### Environment Variables

Add these to your `.env.local`:

```
NEXT_PUBLIC_TRACKING_URL=http://localhost:5001/api/events
NEXT_PUBLIC_TRACKING_TOKEN=your_auth_token_here
```

## Best Practices

1. **Always include customer identification**: email, organization, user_id
2. **Use descriptive event names**: "login_event", "feature_usage", etc.
3. **Include relevant additional data**: session info, feature details, etc.
4. **Handle errors gracefully**: The system includes error logging
5. **Test tracking events**: Verify events are being sent correctly
6. **Document custom events**: Add comments for complex tracking scenarios

## Troubleshooting

### TypeScript Errors

- Ensure `src/types/global.d.ts` is included in your `tsconfig.json`
- Check that all required properties are provided in tracking calls

### Network Errors

- Verify the tracking URL is correct
- Check authentication token
- Ensure CORS is properly configured on the server

### Missing Events

- Check browser console for error messages
- Verify network requests in browser dev tools
- Ensure tracking service is properly imported
