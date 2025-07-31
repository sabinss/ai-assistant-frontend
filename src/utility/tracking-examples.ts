import {
  trackLoginEvent,
  trackFeatureUsage,
  trackCustomerInteraction,
  trackCustomerEvent,
} from "./tracking"

/**
 * Examples of how to use the tracking system for customer events
 */

// Example 1: Track login events
export const trackUserLogin = (userData: any) => {
  trackLoginEvent({
    email: userData.email,
    organization: userData.organization,
    user_id: userData.user_id,
    customer_id: userData.user_id,
    additional_data: {
      login_method: "email_password",
      login_success: true,
      session_id: userData.session_id,
    },
  })
}

// Example 2: Track feature usage
export const trackChatFeatureUsage = (userData: any, chatType: string) => {
  trackFeatureUsage("chat_interaction", {
    email: userData.email,
    organization: userData.organization,
    user_id: userData.user_id,
    customer_id: userData.user_id,
    additional_data: {
      chat_type: chatType,
      feature_accessed_at: new Date().toISOString(),
    },
  })
}

// Example 3: Track customer interactions
export const trackCustomerSupportInteraction = (
  userData: any,
  interactionType: string
) => {
  trackCustomerInteraction(interactionType, {
    email: userData.email,
    organization: userData.organization,
    user_id: userData.user_id,
    customer_id: userData.user_id,
    additional_data: {
      interaction_duration: "5 minutes",
      interaction_outcome: "resolved",
    },
  })
}

// Example 4: Track custom events
export const trackCustomCustomerEvent = (
  eventName: string,
  userData: any,
  customData: any
) => {
  trackCustomerEvent(eventName, {
    email: userData.email,
    organization: userData.organization,
    user_id: userData.user_id,
    customer_id: userData.user_id,
    additional_data: customData,
  })
}

// Example 5: Track dashboard usage
export const trackDashboardAccess = (
  userData: any,
  dashboardSection: string
) => {
  trackFeatureUsage("dashboard_access", {
    email: userData.email,
    organization: userData.organization,
    user_id: userData.user_id,
    customer_id: userData.user_id,
    additional_data: {
      dashboard_section: dashboardSection,
      access_time: new Date().toISOString(),
    },
  })
}

// Example 6: Track configuration changes
export const trackConfigurationChange = (
  userData: any,
  configType: string,
  oldValue: any,
  newValue: any
) => {
  trackCustomerEvent("configuration_change", {
    email: userData.email,
    organization: userData.organization,
    user_id: userData.user_id,
    customer_id: userData.user_id,
    additional_data: {
      config_type: configType,
      old_value: oldValue,
      new_value: newValue,
      change_timestamp: new Date().toISOString(),
    },
  })
}

// Example 7: Track error events
export const trackCustomerError = (
  userData: any,
  errorType: string,
  errorMessage: string
) => {
  trackCustomerEvent("customer_error", {
    email: userData.email,
    organization: userData.organization,
    user_id: userData.user_id,
    customer_id: userData.user_id,
    additional_data: {
      error_type: errorType,
      error_message: errorMessage,
      error_timestamp: new Date().toISOString(),
      user_agent: navigator.userAgent,
    },
  })
}

// Example 8: Track session events
export const trackSessionEvent = (userData: any, sessionEvent: string) => {
  trackCustomerEvent("session_event", {
    email: userData.email,
    organization: userData.organization,
    user_id: userData.user_id,
    customer_id: userData.user_id,
    additional_data: {
      session_event: sessionEvent,
      session_id: userData.session_id,
      event_timestamp: new Date().toISOString(),
    },
  })
}
