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
import { urgencyQueryFromFilter } from "@/features/dashboard/dental/urgency"
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
  listNote: "Only your team can help with these",
  summaryStats: [],
  filters: [
    { id: "very_high", label: "Very High", count: 0 },
    { id: "high", label: "High", count: 0 },
  ],
  patients: [],
}

/**
 * Dental Clinic industry dashboard.
 * Only API response data is shown. On failure, an error message is shown
 * (sample/test data is never used as a fallback).
 */
export default function DentalClinicDashboard() {
  const { access_token } = useAuth()
  const router = useRouter()
  const [data, setData] =
    useState<PatientPrioritiesDashboardData>(EMPTY_DASHBOARD_DATA)
  const [activeFilterId, setActiveFilterId] =
    useState<PatientPriorityFilterId>("very_high")
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
        const urgency = urgencyQueryFromFilter(activeFilterId)
        const response = await fetchOrganizationDashboardData(access_token, {
          industry: DENTAL_CLINIC_INDUSTRY,
          urgency,
        })
        if (cancelled) return

        console.log("[DentalClinicDashboard] /organization/dashboard/data", {
          urgency,
          response,
        })

        const dentalDashboard = extractDentalDashboard(response)
        const summaryStats = mapDentalDashboardSummaryStats(dentalDashboard)
        const filters = mapDentalDashboardFilterCounts(dentalDashboard)
        const patients = mapScoredCompaniesToPatients(
          extractScoredCompanies(response),
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
        // Never fall back to sample/test data.
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
  }, [access_token, activeFilterId, retryKey])

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

  // Initial load failed — show error only (no sample data).
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
        onFilterChange={setActiveFilterId}
        onMarkDone={handlePatientDetail}
        listLoading={listLoading}
      />
    </div>
  )
}
