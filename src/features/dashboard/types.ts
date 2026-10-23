/** Known organization industry values from the org API / settings. */
export type OrganizationIndustry =
  | "SaaS"
  | "MSP"
  | "PhotoStudio"
  | "Staffing"
  | "ITConsulting"
  | "Accounting"
  | "Dental Clinic"
  | string

/**
 * Dashboard variant keyed by industry.
 * Add new kinds here as industry-specific dashboards are built.
 */
export type DashboardKind = "default" | "dental_clinic"
