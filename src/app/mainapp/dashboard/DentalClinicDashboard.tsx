"use client"

import { useEffect, useState } from "react"
import {
  PatientPrioritiesDashboard,
  samplePatientPrioritiesData,
} from "@/features/dashboard/dental"
import type { PatientPrioritiesDashboardData } from "@/features/dashboard/dental"
import {
  extractDentalDashboard,
  mapDentalDashboardSummaryStats,
} from "@/features/dashboard/dental/mapDentalDashboardSummary"
import {
  extractScoredCompanies,
  mapScoredCompaniesToPatients,
} from "@/features/dashboard/dental/mapScoredCompanies"
import { fetchOrganizationDashboardData } from "@/features/dashboard/api/dashboardData"
import { DENTAL_CLINIC_INDUSTRY } from "@/features/dashboard/resolveDashboardKind"
import useAuth from "@/store/user"

/**
 * Dental Clinic industry dashboard.
 * Fetches `/organization/dashboard/data?industry=Dental Clinic` and maps
 * `dentalDashboard` → summary cards, `scoredCompanies` → patient list.
 */
export default function DentalClinicDashboard() {
  const { access_token } = useAuth()
  const [data, setData] = useState<PatientPrioritiesDashboardData>(
    samplePatientPrioritiesData
  )
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!access_token) {
      setLoading(false)
      return
    }

    let cancelled = false

    const load = async () => {
      setLoading(true)
      try {
        const response = await fetchOrganizationDashboardData(
          access_token,
          DENTAL_CLINIC_INDUSTRY
        )
        if (cancelled) return

        console.log(
          "[DentalClinicDashboard] /organization/dashboard/data",
          response
        )

        const dentalDashboard = extractDentalDashboard(response)
        const summaryStats = mapDentalDashboardSummaryStats(dentalDashboard)
        const patients = mapScoredCompaniesToPatients(
          extractScoredCompanies(response)
        )

        setData((prev) => ({
          ...prev,
          summaryStats,
          patients,
          filters: [
            {
              id: "very_high",
              label: "Very High",
              count: patients.length,
            },
            {
              id: "high",
              label: "High",
              count: 0,
            },
          ],
        }))
      } catch (err) {
        if (!cancelled) {
          console.error(
            "[DentalClinicDashboard] Failed to load dashboard data",
            err
          )
        }
      } finally {
        if (!cancelled) setLoading(false)
      }
    }

    load()
    return () => {
      cancelled = true
    }
  }, [access_token])

  const handleMarkDone = (patientId: string) => {
    console.log("Patient detail", patientId)
  }

  return (
    <div className="min-h-full bg-slate-50">
      {loading ? (
        <div className="flex min-h-[40vh] w-full items-center justify-center">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-gray-300 border-t-gray-700" />
        </div>
      ) : (
        <PatientPrioritiesDashboard data={data} onMarkDone={handleMarkDone} />
      )}
    </div>
  )
}
