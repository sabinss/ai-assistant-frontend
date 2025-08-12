/**
 * Client Event Tracking Script
 * 
 * This script provides event tracking functionality for sending user interaction data
 * to your analytics API endpoint.
 * 
 * USAGE:
 * 1. Include this script in your HTML
 * 2. Configure your API endpoint and credentials
 * 3. Call trackEvent() function to send events
 */

// Configuration - Update these values for your implementation
const TRACKING_CONFIG = {
  // Your API endpoint URL
  API_URL: "https://your-api-endpoint.com/api/customer_features",
  
  // Your authorization token
  AUTH_TOKEN: "your_auth_token_here",
  
  // Default organization ID (optional)
  DEFAULT_ORGANIZATION: "your_org_id_here",
  
  // Default user email (will be overridden by data.email if provided)
  DEFAULT_EMAIL: "default@example.com",
  
  // Enable/disable console logging
  DEBUG_MODE: true
};

/**
 * Track an event by sending data to the analytics API
 * @param {string} feature - The feature or action being tracked
 * @param {object} data - Event data object
 * @param {string} data.email - User's email address (required)
 * @param {string} data.feature - Feature identifier (required)
 * @param {string} data.organization - Organization ID (optional)
 */
window.trackEvent = function (feature, data) {
  // Validate required parameters
  if (!feature || !data || !data.email) {
    console.error('❌ trackEvent: Missing required parameters. feature and data.email are required.');
    return;
  }

  // Build the payload
  const payload = {
    email: data.email || TRACKING_CONFIG.DEFAULT_EMAIL,
    feature_id: data.feature || feature,
    feature: data.feature || feature,
    feature_date: new Date().toISOString(),
    device: "web",
    organization: data.organization || TRACKING_CONFIG.DEFAULT_ORGANIZATION
  };

  // Log the payload if debug mode is enabled
  if (TRACKING_CONFIG.DEBUG_MODE) {
    console.log("📊 Tracking Event:", {
      feature: feature,
      payload: payload
    });
  }

  // Send the tracking data
  fetch(TRACKING_CONFIG.API_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${TRACKING_CONFIG.AUTH_TOKEN}`
    },
    body: JSON.stringify(payload),
  })
  .then((response) => {
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    return response.json();
  })
  .then((responseData) => {
    if (TRACKING_CONFIG.DEBUG_MODE) {
      console.log("✅ Event tracked successfully:", responseData);
    }
  })
  .catch((error) => {
    console.error("❌ Event tracking failed:", error);
    
    // Optionally store failed events for retry
    if (TRACKING_CONFIG.STORE_FAILED_EVENTS) {
      storeFailedEvent(payload);
    }
  });
};

/**
 * Store failed events for later retry (optional feature)
 * @param {object} payload - The event payload that failed to send
 */
function storeFailedEvent(payload) {
  try {
    const failedEvents = JSON.parse(localStorage.getItem('failedTrackingEvents') || '[]');
    failedEvents.push({
      ...payload,
      failedAt: new Date().toISOString(),
      retryCount: 0
    });
    localStorage.setItem('failedTrackingEvents', JSON.stringify(failedEvents));
  } catch (error) {
    console.error('Failed to store event for retry:', error);
  }
}

/**
 * Retry sending failed events (optional feature)
 */
window.retryFailedEvents = function() {
  try {
    const failedEvents = JSON.parse(localStorage.getItem('failedTrackingEvents') || '[]');
    if (failedEvents.length === 0) return;

    console.log(`🔄 Retrying ${failedEvents.length} failed events...`);

    failedEvents.forEach((event, index) => {
      if (event.retryCount < 3) { // Max 3 retries
        event.retryCount++;
        
        // Remove the retry-specific fields for the API call
        const { failedAt, retryCount, ...cleanPayload } = event;
        
        trackEvent(event.feature, cleanPayload);
      }
    });

    // Clear successfully retried events
    localStorage.removeItem('failedTrackingEvents');
  } catch (error) {
    console.error('Failed to retry events:', error);
  }
};

/**
 * Check if the tracking script is properly loaded
 * @returns {boolean} True if tracking is available
 */
window.isTrackingAvailable = function() {
  return typeof window.trackEvent === 'function';
};

// Auto-retry failed events when the page loads (optional)
if (TRACKING_CONFIG.AUTO_RETRY_FAILED_EVENTS) {
  window.addEventListener('load', function() {
    setTimeout(() => {
      window.retryFailedEvents();
    }, 5000); // Wait 5 seconds after page load
  });
}

// Log successful initialization
if (TRACKING_CONFIG.DEBUG_MODE) {
  console.log("🚀 Event tracking script loaded successfully");
  console.log("📡 API Endpoint:", TRACKING_CONFIG.API_URL);
  console.log("🔧 Debug mode:", TRACKING_CONFIG.DEBUG_MODE ? "enabled" : "disabled");
} 