/**
 * Utility function to track events using window.trackEvent
 * This function provides a type-safe way to track events across the application
 */

export interface TrackingData {
  email?: string
  feature?: string
  organization?: string
  [key: string]: any
}

export const trackEvent = (eventName: string, data: TrackingData) => {
  if (typeof window !== "undefined" && window.trackEvent) {
    // Add the eventName as feature to the data payload
    const payloadWithFeature = {
      ...data,
      feature: eventName,
    }
    window.trackEvent(eventName, payloadWithFeature)
  } else {
    console.warn("trackEvent function not available")
  }
}

// Predefined tracking functions for common events
export const trackLogin = (email: string, organization: string) => {
  trackEvent("login", {
    email,
    organization,
  })
}

export const trackFeatureUsage = (
  featureId: string,
  email: string,
  organization: string
) => {
  trackEvent(featureId, {
    email,
    organization,
  })
}

export const trackPageView = (
  pageName: string,
  email: string,
  organization: string
) => {
  trackEvent(pageName, {
    email,
    organization,
  })
}
