"use client"

import { useOrganizationIndustry } from "@/features/dashboard/hooks/useOrganizationIndustry"
import DefaultDashboard from "./DefaultDashboard"
import DentalClinicDashboard from "./DentalClinicDashboard"

/**
 * Industry-aware dashboard entry.
 * Resolves the logged-in org's industry and renders the matching dashboard.
 * Add new industry dashboards in the switch below (and in resolveDashboardKind).
 */
export default function DashboardPage() {
  const { dashboardKind, loading } = useOrganizationIndustry()
  console.log("dashboardKind", dashboardKind)

  if (loading) {
    return (
      <div className="flex h-full min-h-[40vh] w-full items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-gray-300 border-t-gray-700" />
      </div>
    )
  }

  switch (dashboardKind) {
    case "dental_clinic":
      return <DentalClinicDashboard />
    case "default":
    default:
      return <DefaultDashboard />
  }
}
