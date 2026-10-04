"use client"

import type { ConversationFilter } from "../types"

type FilterOption = {
  id: ConversationFilter
  label: string
  count: number
}

type ConversationFiltersProps = {
  filters: FilterOption[]
  activeFilter: ConversationFilter
  onChange: (filter: ConversationFilter) => void
}

export default function ConversationFilters({
  filters,
  activeFilter,
  onChange,
}: ConversationFiltersProps) {
  return (
    <div className="flex flex-wrap gap-2">
      {filters.map((filter) => {
        const isActive = activeFilter === filter.id
        return (
          <button
            key={filter.id}
            type="button"
            onClick={() => onChange(filter.id)}
            className={`rounded-full px-3 py-1 text-[12px] font-medium transition-colors ${
              isActive
                ? "bg-[#1B3A8C] text-white"
                : "border border-[#1B3A8C]/35 bg-white text-[#1B3A8C] hover:bg-[#EEF2FB]"
            }`}
          >
            {filter.label} · {filter.count}
          </button>
        )
      })}
    </div>
  )
}
