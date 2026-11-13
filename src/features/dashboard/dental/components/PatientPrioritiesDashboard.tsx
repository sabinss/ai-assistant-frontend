"use client"

import { useMemo, useState } from "react"
import type {
  PatientPrioritiesDashboardData,
  PatientPriorityFilterId,
} from "../types"
import PatientPrioritiesHeader from "./PatientPrioritiesHeader"
import PatientPriorityList from "./PatientPriorityList"
import PriorityFilterTabs from "./PriorityFilterTabs"
import SummaryStatsRow from "./SummaryStatsRow"

type PatientPrioritiesDashboardProps = {
  data: PatientPrioritiesDashboardData
  activeFilterId: PatientPriorityFilterId
  onFilterChange: (filterId: PatientPriorityFilterId) => void
  /** Optional — Patient Detail click. */
  onMarkDone?: (patientId: string) => void
  /** Optional — wire summary card clicks (e.g. filter by category). */
  onSummaryStatClick?: (statId: string) => void
  listLoading?: boolean
}

export default function PatientPrioritiesDashboard({
  data,
  activeFilterId,
  onFilterChange,
  onMarkDone,
  onSummaryStatClick,
  listLoading = false,
}: PatientPrioritiesDashboardProps) {
  const [teamAssignedOnly, setTeamAssignedOnly] = useState(false)

  const visiblePatients = useMemo(() => {
    if (!teamAssignedOnly) return data.patients
    return data.patients.filter((p) => p.assignedTo.trim() !== "")
  }, [data.patients, teamAssignedOnly])

  return (
    <div className="w-full py-4 pl-1 pr-4 sm:pr-6">
      <PatientPrioritiesHeader
        title={data.title}
        subtitle={data.subtitle}
        clinicName={data.clinicName}
        updatedLabel={data.updatedLabel}
      />

      <div className="mt-6">
        <SummaryStatsRow
          stats={data.summaryStats}
          onStatClick={onSummaryStatClick}
        />
      </div>

      <section className="mt-6 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="border-b border-slate-100 px-4 py-4 sm:px-5">
          <PriorityFilterTabs
            filters={data.filters}
            activeFilterId={activeFilterId}
            onChange={onFilterChange}
            teamAssignedOnly={teamAssignedOnly}
            onTeamAssignedOnlyChange={setTeamAssignedOnly}
          />
        </div>
        {listLoading ? (
          <div className="flex items-center justify-center py-12">
            <div className="h-7 w-7 animate-spin rounded-full border-2 border-gray-300 border-t-gray-700" />
          </div>
        ) : (
          <PatientPriorityList
            patients={visiblePatients}
            onMarkDone={onMarkDone}
          />
        )}
      </section>
    </div>
  )
}
