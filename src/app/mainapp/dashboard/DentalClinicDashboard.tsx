"use client"

import { useEffect, useRef, useState } from "react"
import { useRouter } from "next/navigation"
import {
  PatientPrioritiesDashboard,
  samplePatientPrioritiesData,
} from "@/features/dashboard/dental"
import type {
  PatientPrioritiesDashboardData,
  PatientPriorityFilterId,
} from "@/features/dashboard/dental"
import {
  extractDentalDashboard,
  mapDentalDashboardFilterCounts,
  mapDentalDashboardSummaryStats,
} from "@/features/dashboard/dental/mapDentalDashboardSummary"
import {
  extractScoredCompanies,
  mapScoredCompaniesToPatients,
} from "@/features/dashboard/dental/mapScoredCompanies"
import { urgencyQueryFromFilter } from "@/features/dashboard/dental/urgency"
import { fetchOrganizationDashboardData } from "@/features/dashboard/api/dashboardData"
import { DENTAL_CLINIC_INDUSTRY } from "@/features/dashboard/resolveDashboardKind"
import { activityCustomerDetailHref } from "@/features/activity/customerDetailNavigation"
import useAuth from "@/store/user"

/**
 * Dental Clinic industry dashboard.
 * Fetches `/organization/dashboard/data?industry=Dental Clinic&urgency=...`
 * — urgency follows the Very High / High tabs.
 */
export default function DentalClinicDashboard() {
  const { access_token } = useAuth()
  const router = useRouter()
  const [data, setData] = useState<PatientPrioritiesDashboardData>(
    samplePatientPrioritiesData
  )
  const [activeFilterId, setActiveFilterId] =
    useState<PatientPriorityFilterId>("very_high")
  const [loading, setLoading] = useState(true)
  const [listLoading, setListLoading] = useState(false)
  const hasLoadedOnceRef = useRef(false)

  useEffect(() => {
    if (!access_token) {
      setLoading(false)
      return
    }

    let cancelled = false

    const load = async () => {
      const isFirstLoad = !hasLoadedOnceRef.current
      if (isFirstLoad) setLoading(true)
      else setListLoading(true)

      try {
        const urgency = urgencyQueryFromFilter(activeFilterId)
        const response = await fetchOrganizationDashboardData(access_token, {
          industry: DENTAL_CLINIC_INDUSTRY,
          urgency,
        })
        if (cancelled) return

        console.log(
          "[DentalClinicDashboard] /organization/dashboard/data",
          { urgency, response }
        )

        const dentalDashboard = extractDentalDashboard(response)
        const summaryStats = mapDentalDashboardSummaryStats(dentalDashboard)
        const filters = mapDentalDashboardFilterCounts(dentalDashboard)
        const patients = mapScoredCompaniesToPatients(
          extractScoredCompanies(response),
          activeFilterId
        )

        setData((prev) => ({
          ...prev,
          summaryStats,
          patients,
          filters,
        }))
        hasLoadedOnceRef.current = true
      } catch (err) {
        if (!cancelled) {
          console.error(
            "[DentalClinicDashboard] Failed to load dashboard data",
            err
          )
        }
      } finally {
        if (!cancelled) {
          setLoading(false)
          setListLoading(false)
        }
      }
    }

    load()
    return () => {
      cancelled = true
    }
  }, [access_token, activeFilterId])

  const handlePatientDetail = (patientId: string) => {
    const patient = data.patients.find((p) => p.id === patientId)
    router.push(
      activityCustomerDetailHref(patientId, patient?.patientName ?? "")
    )
  }

  return (
    <div className="min-h-full bg-slate-50">
      {loading ? (
        <div className="flex min-h-[40vh] w-full items-center justify-center">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-gray-300 border-t-gray-700" />
        </div>
      ) : (
        <PatientPrioritiesDashboard
          data={data}
          activeFilterId={activeFilterId}
          onFilterChange={setActiveFilterId}
          onMarkDone={handlePatientDetail}
          listLoading={listLoading}
        />
      )}
    </div>
  )
}
