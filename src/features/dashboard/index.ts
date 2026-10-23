export type { DashboardKind, OrganizationIndustry } from "./types"
export {
  DENTAL_CLINIC_INDUSTRY,
  isDentalClinicIndustry,
  normalizeIndustry,
  resolveDashboardKind,
} from "./resolveDashboardKind"
export { fetchOrganizationIndustry } from "./api/organizationIndustry"
export { fetchOrganizationDashboardData } from "./api/dashboardData"
export { useOrganizationIndustry } from "./hooks/useOrganizationIndustry"
export {
  PatientPrioritiesDashboard,
  samplePatientPrioritiesData,
} from "./dental"
export type {
  PatientPrioritiesDashboardData,
  PatientPriorityItem,
} from "./dental"
