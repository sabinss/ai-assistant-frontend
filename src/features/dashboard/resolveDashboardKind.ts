import type { DashboardKind, OrganizationIndustry } from "./types"

/**
 * Map organization industry → dashboard variant.
 * Extend this table when adding industry-specific dashboards.
 */
const INDUSTRY_DASHBOARD_MAP: Record<string, DashboardKind> = {
  "dental clinic": "dental_clinic",
}

export function normalizeIndustry(industry: string | null | undefined): string {
  return (industry ?? "").trim().toLowerCase()
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
  return resolveDashboardKind(industry) === "dental_clinic"
}
