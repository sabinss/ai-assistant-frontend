import type {
  PatientPriorityFilter,
  PatientPriorityFilterId,
} from "../types"

type PriorityFilterTabsProps = {
  filters: PatientPriorityFilter[]
  activeFilterId: PatientPriorityFilterId
  note?: string
  onChange: (filterId: PatientPriorityFilterId) => void
}

export default function PriorityFilterTabs({
  filters,
  activeFilterId,
  note,
  onChange,
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
      {note ? <p className="text-sm text-slate-500">{note}</p> : null}
    </div>
  )
}
