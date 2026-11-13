"use client"

import { useEffect, useRef, useState } from "react"
import { useRouter } from "next/navigation"
import { PatientPrioritiesDashboard } from "@/features/dashboard/dental"
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
import {
  countPatientsBySummaryScore,
  filterPatientsBySummaryScore,
} from "@/features/dashboard/dental/scoreFilter"
import {
  isSelectableSummaryCardId,
  resolveDashboardUrgency,
  type DentalSummaryCardId,
} from "@/features/dashboard/dental/urgency"
import { fetchOrganizationDashboardData } from "@/features/dashboard/api/dashboardData"
import { DENTAL_CLINIC_INDUSTRY } from "@/features/dashboard/resolveDashboardKind"
import { activityCustomerDetailHref } from "@/features/activity/customerDetailNavigation"
import useAuth from "@/store/user"

/** Empty shell — no sample/test patients or counts. Filled only from API. */
const EMPTY_DASHBOARD_DATA: PatientPrioritiesDashboardData = {
  clinicName: "",
  updatedLabel: "",
  title: "Patient Priorities",
  subtitle: "Who your team should pay attention to first, and why.",
  listNote: "",
  summaryStats: [],
  filters: [
    { id: "very_high", label: "Very High", count: 0 },
    { id: "high", label: "High", count: 0 },
  ],
  patients: [],
}

/**
 * Dental Clinic industry dashboard.
 * Summary cards + Very High/High tabs drive
 * `/organization/dashboard/data?industry=Dental Clinic&urgency=...`
 */
export default function DentalClinicDashboard() {
  const { access_token } = useAuth()
  const router = useRouter()
  const [data, setData] =
    useState<PatientPrioritiesDashboardData>(EMPTY_DASHBOARD_DATA)
  const [activeFilterId, setActiveFilterId] =
    useState<PatientPriorityFilterId>("very_high")
  const [activeSummaryId, setActiveSummaryId] =
    useState<DentalSummaryCardId>("very_high")
  const [loading, setLoading] = useState(true)
  const [listLoading, setListLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [retryKey, setRetryKey] = useState(0)
  const hasLoadedOnceRef = useRef(false)

  useEffect(() => {
    if (!access_token) {
      setLoading(false)
      setError("Sign-in is required to load the dashboard.")
      return
    }

    let cancelled = false

    const load = async () => {
      const isFirstLoad = !hasLoadedOnceRef.current
      if (isFirstLoad) setLoading(true)
      else setListLoading(true)
      setError(null)

      try {
        const urgency = resolveDashboardUrgency(activeSummaryId, activeFilterId)
        const response = await fetchOrganizationDashboardData(access_token, {
          industry: DENTAL_CLINIC_INDUSTRY,
          urgency,
        })
        if (cancelled) return

        console.log("[DentalClinicDashboard] /organization/dashboard/data", {
          urgency,
          activeSummaryId,
          activeFilterId,
          response,
        })

        const dentalDashboard = extractDentalDashboard(response)
        const summaryStats = mapDentalDashboardSummaryStats(
          dentalDashboard,
          activeSummaryId
        )
        const mappedPatients = mapScoredCompaniesToPatients(
          extractScoredCompanies(response),
          activeFilterId,
          activeSummaryId
        )
        // Health / Might leave / Treatment: tab counts from score 100 / 75.
        // Very High card: tab counts from dentalDashboard API fields.
        const filters =
          countPatientsBySummaryScore(mappedPatients, activeSummaryId) ??
          mapDentalDashboardFilterCounts(dentalDashboard)
        const patients = filterPatientsBySummaryScore(
          mappedPatients,
          activeSummaryId,
          activeFilterId
        )

        setData({
          ...EMPTY_DASHBOARD_DATA,
          summaryStats,
          patients,
          filters,
        })
        hasLoadedOnceRef.current = true
        setError(null)
      } catch (err: any) {
        if (cancelled) return
        console.error(
          "[DentalClinicDashboard] Failed to load dashboard data",
          err
        )
        if (!hasLoadedOnceRef.current) {
          setData(EMPTY_DASHBOARD_DATA)
        }
        setError(
          err?.response?.data?.message ||
            "Failed to load dashboard data. Please try again."
        )
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
  }, [access_token, activeFilterId, activeSummaryId, retryKey])

  const handleSummaryStatClick = (statId: string) => {
    if (!isSelectableSummaryCardId(statId)) return
    setActiveSummaryId(statId)
    // New card selection starts on the Very High tab (score === 100).
    setActiveFilterId("very_high")
  }

  const handleFilterChange = (filterId: PatientPriorityFilterId) => {
    // Tabs always apply for the current card (Very High = 100, High = 75).
    setActiveFilterId(filterId)
  }

  const handlePatientDetail = (patientId: string) => {
    const patient = data.patients.find((p) => p.id === patientId)
    router.push(
      activityCustomerDetailHref(patientId, {
        name: patient?.patientName ?? "",
        from: "dashboard",
        dealId: patient?.dealId,
        dealName: patient?.dealName,
        dealStage: patient?.dealStage,
        phone: patient?.phone,
        handedOff: patient?.handedOff,
      })
    )
  }

  const handleRetry = () => {
    hasLoadedOnceRef.current = false
    setData(EMPTY_DASHBOARD_DATA)
    setError(null)
    setRetryKey((k) => k + 1)
  }

  if (loading) {
    return (
      <div className="flex min-h-[40vh] w-full items-center justify-center bg-slate-50">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-gray-300 border-t-gray-700" />
      </div>
    )
  }

  if (error && !hasLoadedOnceRef.current) {
    return (
      <div className="flex min-h-[40vh] w-full flex-col items-center justify-center gap-3 bg-slate-50 px-4 text-center">
        <p className="text-sm text-red-600">{error}</p>
        <button
          type="button"
          onClick={handleRetry}
          className="rounded-md bg-slate-800 px-3 py-1.5 text-sm font-medium text-white hover:bg-slate-700"
        >
          Retry
        </button>
      </div>
    )
  }

  return (
    <div className="min-h-full bg-slate-50">
      {error ? (
        <div className="mx-4 mt-4 flex flex-wrap items-center justify-between gap-2 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 sm:mx-6">
          <span>{error}</span>
          <button
            type="button"
            onClick={handleRetry}
            className="rounded-md border border-red-300 bg-white px-2.5 py-1 text-xs font-medium text-red-700 hover:bg-red-100"
          >
            Retry
          </button>
        </div>
      ) : null}
      <PatientPrioritiesDashboard
        data={data}
        activeFilterId={activeFilterId}
        onFilterChange={handleFilterChange}
        onMarkDone={handlePatientDetail}
        onSummaryStatClick={handleSummaryStatClick}
        listLoading={listLoading}
      />
    </div>
  )
}
