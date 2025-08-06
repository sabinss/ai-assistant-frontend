# Tracking Events Examples

## How to use tracking in different features

### 1. Login Tracking (Already implemented)

```typescript
import { trackLogin } from "@/utility/tracking"

// In your login component
trackLogin(email, organization)
```

### 2. Feature Usage Tracking

```typescript
import { trackFeatureUsage } from "@/utility/tracking"

// Track when user uses a specific feature
trackFeatureUsage("chat_message", email, organization)
trackFeatureUsage("file_upload", email, organization)
trackFeatureUsage("search_query", email, organization)
```

### 3. Page View Tracking

```typescript
import { trackPageView } from "@/utility/tracking"

// Track page views
trackPageView("dashboard", email, organization)
trackPageView("settings", email, organization)
trackPageView("profile", email, organization)
```

### 4. Custom Event Tracking

```typescript
import { trackEvent } from "@/utility/tracking"

// Track custom events
trackEvent("button_click", {
  email: userEmail,
  feature: "export_data",
  organization: userOrganization,
  button_name: "export_csv",
})

trackEvent("form_submit", {
  email: userEmail,
  feature: "contact_form",
  organization: userOrganization,
  form_type: "support_request",
})
```

### 5. Direct window.trackEvent usage

```typescript
// You can also use window.trackEvent directly
window.trackEvent("custom_event", {
  email: userEmail,
  feature: "custom_feature",
  organization: userOrganization,
  custom_data: "some_value",
})
```

## All tracking calls will:

- Send data to: `https://grjr9d0i7k.execute-api.us-east-2.amazonaws.com/dev/api/customer_features`
- Include Authorization header: `Bearer 666158fe71bfe10b58cb23eea`
- Log the payload to console for debugging
- Handle errors gracefully without affecting user experience
