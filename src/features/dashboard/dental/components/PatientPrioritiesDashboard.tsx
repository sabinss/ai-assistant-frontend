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
  /** Optional — wire to API when mark-done is available. */
  onMarkDone?: (patientId: string) => void
  /** Optional — wire summary card clicks (e.g. filter by category). */
  onSummaryStatClick?: (statId: string) => void
}

export default function PatientPrioritiesDashboard({
  data,
  onMarkDone,
  onSummaryStatClick,
}: PatientPrioritiesDashboardProps) {
  const defaultFilter =
    data.filters.find((f) => f.id === "very_high")?.id ??
    data.filters[0]?.id ??
    "very_high"

  const [activeFilterId, setActiveFilterId] =
    useState<PatientPriorityFilterId>(defaultFilter)

  const visiblePatients = useMemo(
    () => data.patients.filter((p) => p.priority === activeFilterId),
    [data.patients, activeFilterId]
  )

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
            note={data.listNote}
            onChange={setActiveFilterId}
          />
        </div>
        <PatientPriorityList
          patients={visiblePatients}
          onMarkDone={onMarkDone}
        />
      </section>
    </div>
  )
}
