export interface TrackingEvent {
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

export interface CustomerTrackingData {
  email?: string
  organization?: string
  user_id?: string
  customer_id?: string
  feature_name?: string
  interaction_type?: string
  additional_data?: Record<string, any>
}

class TrackingService {
  private baseUrl: string
  private authToken: string

  constructor() {
    this.baseUrl =
      process.env.NEXT_PUBLIC_TRACKING_URL || "http://localhost:5001/api/events"
    this.authToken =
      process.env.NEXT_PUBLIC_TRACKING_TOKEN || "666158fe71bfe10b58cb23eea"
  }

  /**
   * Track a customer event with comprehensive data
   */
  trackCustomerEvent(
    eventName: string,
    customerData: CustomerTrackingData
  ): void {
    const eventData: TrackingEvent = {
      feature_id: eventName,
      feature_date: new Date().toISOString(),
      device: "web",
      url: typeof window !== "undefined" ? window.location.href : "",
      timestamp: new Date().toISOString(),
      userAgent: typeof navigator !== "undefined" ? navigator.userAgent : "",
      ...customerData,
    }

    this.sendTrackingEvent(eventData)
  }

  /**
   * Track login events specifically
   */
  trackLoginEvent(customerData: CustomerTrackingData): void {
    this.trackCustomerEvent("login_event", {
      ...customerData,
      feature_name: "User Login",
      additional_data: {
        login_method: "email_password",
        session_start: new Date().toISOString(),
      },
    })
  }

  /**
   * Track feature usage events
   */
  trackFeatureUsage(
    featureName: string,
    customerData: CustomerTrackingData
  ): void {
    this.trackCustomerEvent("feature_usage", {
      ...customerData,
      feature_name: featureName,
      additional_data: {
        feature_accessed_at: new Date().toISOString(),
      },
    })
  }

  /**
   * Track customer interactions
   */
  trackCustomerInteraction(
    interactionType: string,
    customerData: CustomerTrackingData
  ): void {
    this.trackCustomerEvent("customer_interaction", {
      ...customerData,
      interaction_type: interactionType,
      additional_data: {
        interaction_timestamp: new Date().toISOString(),
      },
    })
  }

  /**
   * Send tracking event to the server
   */
  private sendTrackingEvent(eventData: TrackingEvent): void {
    // Use the global trackEvent function if available (for backward compatibility)
    if (typeof window !== "undefined" && window.trackEvent) {
      window.trackEvent(eventData.feature_id, eventData)
      return
    }

    // Fallback to direct fetch
    fetch(this.baseUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${this.authToken}`,
      },
      body: JSON.stringify(eventData),
    })
      .then((res) => {
        if (!res.ok) {
          throw new Error(`HTTP error! status: ${res.status}`)
        }
        return res.json()
      })
      .then((data) => {
        console.log("Tracking event sent successfully:", data)
      })
      .catch((error) => {
        console.error("Error sending tracking event:", error)
      })
  }
}

// Create a singleton instance
export const trackingService = new TrackingService()

// Export convenience functions
export const trackCustomerEvent = (
  eventName: string,
  customerData: CustomerTrackingData
) => trackingService.trackCustomerEvent(eventName, customerData)

export const trackLoginEvent = (customerData: CustomerTrackingData) =>
  trackingService.trackLoginEvent(customerData)

export const trackFeatureUsage = (
  featureName: string,
  customerData: CustomerTrackingData
) => trackingService.trackFeatureUsage(featureName, customerData)

export const trackCustomerInteraction = (
  interactionType: string,
  customerData: CustomerTrackingData
) => trackingService.trackCustomerInteraction(interactionType, customerData)
