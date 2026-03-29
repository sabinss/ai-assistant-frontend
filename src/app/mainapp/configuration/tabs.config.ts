/**
 * Configuration tabs definition with role-based access control
 *
 * This file defines which tabs are available for each user role.
 * Individual users can only see "Sample Query" and "Agent" tabs.
 * Other roles (admin, user, etc.) can see all tabs.
 */

export type TabKey =
  | "support_workflow"
  | "customer_insights"
  | "email_rply"
  | "task_agent"
  | "agent"
  | "sample_query"

export interface TabConfig {
  key: TabKey
  label: string
}

/**
 * All available configuration tabs
 */
export const ALL_TABS: TabConfig[] = [
  { key: "support_workflow", label: "Support Workflow" },
  { key: "customer_insights", label: "Customer Insights" },
  { key: "email_rply", label: "Email Reply" },
  // { key: "task_agent", label: "Task Agent" },
  { key: "agent", label: "Agent" },
  { key: "sample_query", label: "Sample Query" },
]

/**
 * Tabs available for individual users
 */
export const INDIVIDUAL_USER_TABS: TabKey[] = ["agent", "sample_query"]

/**
 * Get available tabs based on user role
 * @param role - User role (e.g., "individual", "admin", "user")
 * @returns Array of tab configurations available for the role
 */
export function getTabsForRole(role: string | null): TabConfig[] {
  if (role === "individual") {
    return ALL_TABS.filter((tab) => INDIVIDUAL_USER_TABS.includes(tab.key))
  }

  // For all other roles, return all tabs
  return ALL_TABS
}

/**
 * Get the default active tab for a role
 * @param role - User role
 * @returns Default tab key for the role
 */
export function getDefaultTabForRole(role: string | null): TabKey {
  if (role === "individual") {
    // Default to first available tab for individual users
    return INDIVIDUAL_USER_TABS[0]
  }

  // Default to first tab for other roles
  return ALL_TABS[0].key
}
