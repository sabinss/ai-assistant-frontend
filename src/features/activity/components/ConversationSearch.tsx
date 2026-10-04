"use client"

import { Search } from "lucide-react"

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
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="Search by customer or phone number"
        className="w-full rounded-md border border-[#D8DEE9] bg-white py-2 pl-9 pr-3 text-[13px] text-[#333] placeholder:text-[#9AA3B5] focus:border-[#1B3A8C] focus:outline-none focus:ring-1 focus:ring-[#1B3A8C]"
      />
    </div>
  )
}
