# Quick Setup Checklist for Event Tracking

## ✅ Pre-Implementation Checklist

- [ ] **API Credentials**: Do you have your API endpoint URL and authorization token?
- [ ] **Organization ID**: Do you have your organization ID for tracking?
- [ ] **User Email**: How will you get the user's email address in your application?
- [ ] **Features to Track**: Have you identified which user actions/features you want to track?

## 🚀 Implementation Steps (5 minutes)

### Step 1: Download Files

- [ ] Download `client-tracker.js` from the provided files
- [ ] Place it in your project's public/assets directory

### Step 2: Configure Settings

- [ ] Open `client-tracker.js`
- [ ] Update `API_URL` with your endpoint
- [ ] Update `AUTH_TOKEN` with your token
- [ ] Update `DEFAULT_ORGANIZATION` with your org ID
- [ ] Set `DEBUG_MODE` to `false` for production

### Step 3: Include Script

- [ ] Add script tag to your HTML:

```html
<script src="path/to/client-tracker.js"></script>
```

### Step 4: Test Implementation

- [ ] Open browser console
- [ ] Check if you see "🚀 Event tracking script loaded successfully"
- [ ] Test with a simple event:

```javascript
trackEvent("test", {
  email: "test@example.com",
  feature: "test_feature",
})
```

## 📱 Common Integration Points

### User Authentication

```javascript
// After successful login
trackEvent("user_login", {
  email: user.email,
  feature: "authentication_success",
  organization: user.organizationId,
})
```

### Feature Usage

```javascript
// When user uses a feature
trackEvent("feature_used", {
  email: currentUser.email,
  feature: "document_upload",
  organization: currentUser.organizationId,
})
```

### Form Submissions

```javascript
// On form submit
trackEvent("form_submitted", {
  email: formData.email,
  feature: "contact_form",
  organization: getCurrentOrgId(),
})
```

### Page Views

```javascript
// On page load
trackEvent("page_view", {
  email: getCurrentUserEmail(),
  feature: "homepage_loaded",
  organization: getCurrentOrgId(),
})
```

## 🔧 Troubleshooting

### Script Not Loading

- [ ] Check file path in script tag
- [ ] Verify file exists in specified location
- [ ] Check browser console for 404 errors

### Function Not Defined

- [ ] Ensure script loads before calling `trackEvent`
- [ ] Check if script loaded successfully
- [ ] Verify no JavaScript errors in console

### API Errors

- [ ] Check authorization token is correct
- [ ] Verify API endpoint URL is accessible
- [ ] Check browser console for error messages
- [ ] Verify CORS settings on your server

### Events Not Sending

- [ ] Check if `DEBUG_MODE` is enabled
- [ ] Look for console logs showing payload
- [ ] Verify network tab for API calls
- [ ] Check if email and feature are provided

## 📊 Testing Your Implementation

### Basic Test

```javascript
// Test if tracking is working
trackEvent("test_event", {
  email: "your-email@domain.com",
  feature: "test_feature",
  organization: "your_org_id",
})
```

### Expected Console Output

```
🚀 Event tracking script loaded successfully
📡 API Endpoint: https://your-api-endpoint.com
🔧 Debug mode: enabled
📊 Tracking Event: {feature: "test_event", payload: {...}}
✅ Event tracked successfully: {...}
```

## 🎯 Production Checklist

- [ ] Set `DEBUG_MODE` to `false`
- [ ] Verify API endpoint is production URL
- [ ] Test with real user data
- [ ] Monitor API response times
- [ ] Set up error monitoring for failed events
- [ ] Consider implementing rate limiting
- [ ] Test offline scenarios if needed

## 📞 Need Help?

If you encounter issues:

1. Check the browser console for error messages
2. Verify all configuration values are correct
3. Test with the provided example HTML file
4. Contact support with specific error messages

## 📋 Example Implementation

See `tracking-example.html` for a complete working example that demonstrates all features.
