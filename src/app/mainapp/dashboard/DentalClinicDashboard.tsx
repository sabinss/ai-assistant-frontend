"use client"

import { useEffect } from "react"
import {
  PatientPrioritiesDashboard,
  samplePatientPrioritiesData,
} from "@/features/dashboard/dental"
import { fetchOrganizationDashboardData } from "@/features/dashboard/api/dashboardData"
import useAuth from "@/store/user"

/**
 * Dental Clinic industry dashboard.
 * Fetches `/organization/dashboard/data?industry=Dental Clinic` on mount.
 * UI still uses sample data until the API response is mapped.
 */
export default function DentalClinicDashboard() {
  const { access_token } = useAuth()
  const data = samplePatientPrioritiesData

  useEffect(() => {
    if (!access_token) return

    let cancelled = false

    const load = async () => {
      try {
        const response = await fetchOrganizationDashboardData(
          access_token,
          "Dental Clinic"
        )
        if (!cancelled) {
          console.log("[DentalClinicDashboard] /organization/dashboard/data", response)
        }
      } catch (err) {
        if (!cancelled) {
          console.error(
            "[DentalClinicDashboard] Failed to load dashboard data",
            err
          )
        }
      }
    }

    load()
    return () => {
      cancelled = true
    }
  }, [access_token])

  const handleMarkDone = (patientId: string) => {
    console.log("Mark done", patientId)
  }

  return (
    <div className="min-h-full bg-slate-50">
      <PatientPrioritiesDashboard data={data} onMarkDone={handleMarkDone} />
    </div>
  )
}
