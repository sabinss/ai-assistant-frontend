import type { DashboardKind, OrganizationIndustry } from "./types"

/** Exact industry value used in Organization settings / signup. */
export const DENTAL_CLINIC_INDUSTRY = "Dental Clinic"

/**
 * Map organization industry → dashboard variant.
 * Extend this table when adding industry-specific dashboards.
 */
const INDUSTRY_DASHBOARD_MAP: Record<string, DashboardKind> = {
  [DENTAL_CLINIC_INDUSTRY]: "dental_clinic",
}

export function normalizeIndustry(industry: string | null | undefined): string {
  return (industry ?? "").trim()
}

export function resolveDashboardKind(
  industry: OrganizationIndustry | null | undefined
): DashboardKind {
  const key = normalizeIndustry(industry)
  return INDUSTRY_DASHBOARD_MAP[key] ?? "default"
}

export function isDentalClinicIndustry(
  industry: OrganizationIndustry | null | undefined
): boolean {
  return normalizeIndustry(industry) === DENTAL_CLINIC_INDUSTRY
}
