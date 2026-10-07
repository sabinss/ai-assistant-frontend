"use client"

import { Search, X } from "lucide-react"

type ConversationSearchProps = {
  value: string
  onChange: (value: string) => void
}

export default function ConversationSearch({ value, onChange }: ConversationSearchProps) {
  return (
    <div className="relative">
      <Search
        size={15}
        className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[#9AA3B5]"
      />
      <input
        type="search"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="Search by customer or phone number"
        className="w-full rounded-md border border-[#D8DEE9] bg-white py-2 pl-9 pr-8 text-[13px] text-[#333] placeholder:text-[#9AA3B5] focus:border-[#1B3A8C] focus:outline-none focus:ring-1 focus:ring-[#1B3A8C]"
        aria-label="Search conversations"
      />
      {value && (
        <button
          type="button"
          onClick={() => onChange("")}
          className="absolute right-2 top-1/2 -translate-y-1/2 text-[#9AA3B5] hover:text-[#4A5168]"
          aria-label="Clear search"
        >
          <X size={14} />
        </button>
      )}
    </div>
  )
}
