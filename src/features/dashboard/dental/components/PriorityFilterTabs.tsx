import type {
  PatientPriorityFilter,
  PatientPriorityFilterId,
} from "../types"

type PriorityFilterTabsProps = {
  filters: PatientPriorityFilter[]
  activeFilterId: PatientPriorityFilterId
  onChange: (filterId: PatientPriorityFilterId) => void
  /** Show only rows with an assignee. Default unchecked. */
  teamAssignedOnly?: boolean
  onTeamAssignedOnlyChange?: (checked: boolean) => void
}

export default function PriorityFilterTabs({
  filters,
  activeFilterId,
  onChange,
  teamAssignedOnly = false,
  onTeamAssignedOnlyChange,
}: PriorityFilterTabsProps) {
  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex flex-wrap items-center gap-2">
        {filters.map((filter) => {
          const active = filter.id === activeFilterId
          return (
            <button
              key={filter.id}
              type="button"
              onClick={() => onChange(filter.id)}
              className={[
                "rounded-full px-3.5 py-1.5 text-sm font-medium transition",
                active
                  ? "bg-blue-700 text-white shadow-sm"
                  : "border border-slate-200 bg-white text-slate-700 hover:border-slate-300 hover:bg-slate-50",
              ].join(" ")}
            >
              {filter.label}
              <span className={active ? "text-blue-100" : "text-slate-400"}>
                {" "}
                · {filter.count}
              </span>
            </button>
          )
        })}
      </div>
      <label className="inline-flex cursor-pointer select-none items-center gap-2 text-sm text-slate-600">
        <input
          type="checkbox"
          checked={teamAssignedOnly}
          onChange={(e) => onTeamAssignedOnlyChange?.(e.target.checked)}
          className="h-4 w-4 rounded border-slate-300 text-blue-700 focus:ring-blue-500"
        />
        Show Team-Assigned Only
      </label>
    </div>
  )
}
