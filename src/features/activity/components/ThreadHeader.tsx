"use client"

import { ChevronRight } from "lucide-react"
import type { Conversation } from "../types"

type ThreadHeaderProps = {
  conversation: Conversation
  onViewCustomer?: () => void
}

export default function ThreadHeader({ conversation, onViewCustomer }: ThreadHeaderProps) {
  return (
    <div className="flex items-center justify-between gap-3 border-b border-[#EEF0F5] px-4 py-3">
      <div className="flex min-w-0 items-center gap-3">
        <div
          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-[13px] font-semibold text-[#1B3A8C]"
          style={{ backgroundColor: conversation.avatarColor }}
        >
          {conversation.initials}
        </div>
        <div className="min-w-0">
          <p className="truncate text-[15px] font-semibold text-[#1A2333]">
            {conversation.name}
          </p>
          <p className="truncate text-[12px] text-[#6B7280]">
            {conversation.industry
              ? `${conversation.phone} · ${conversation.industry}`
              : conversation.phone}
          </p>
        </div>
      </div>
      <button
        type="button"
        onClick={onViewCustomer}
        className="inline-flex shrink-0 items-center gap-0.5 rounded-md border border-[#D8DEE9] bg-white px-3 py-1.5 text-[12px] font-medium text-[#1A2333] hover:bg-[#F7F9FC]"
      >
        View customer
        <ChevronRight size={14} />
      </button>
    </div>
  )
}
