"use client"

import { AlertCircle, ChevronRight } from "lucide-react"
import EmailMessageCard from "./EmailMessageCard"
import {
  pickEmailThreadSubject,
  pickEmailThreadTo,
} from "../mapActivityEmails"
import type { ActivityEmailDetail, Conversation } from "../types"

type EmailThreadPanelProps = {
  conversation: Conversation | null
  emails: ActivityEmailDetail[]
  loading?: boolean
  onViewCustomer?: () => void
}

export default function EmailThreadPanel({
  conversation,
  emails,
  loading = false,
  onViewCustomer,
}: EmailThreadPanelProps) {
  if (!conversation) {
    return (
      <div className="flex min-h-0 flex-1 items-center justify-center bg-white text-[14px] text-[#8A93A6]">
        Select a conversation to view emails
      </div>
    )
  }

  const subject = pickEmailThreadSubject(emails)
  const toAddress = pickEmailThreadTo(emails)
  const subtitle = [conversation.name, toAddress || conversation.phone]
    .filter(Boolean)
    .join(" · ")

  return (
    <div className="flex min-h-0 min-w-0 flex-1 flex-col bg-white">
      <div className="flex items-start justify-between gap-3 border-b border-[#EEF0F5] px-5 py-4">
        <div className="min-w-0">
          <h2 className="truncate text-[16px] font-semibold text-[#1A2333]">{subject}</h2>
          <p className="mt-1 truncate text-[12.5px] text-[#6B7280]">{subtitle}</p>
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

      <div className="mx-4 mt-3 flex gap-3 rounded-lg border border-[#F0C9AE] bg-[#FDF3EC] p-3.5">
        <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-[#E85D3B] text-white">
          <AlertCircle className="h-4 w-4 shrink-0" strokeWidth={2.5} aria-hidden />
        </div>
        {/* <div className="min-w-0 flex-1">
          <p className="text-[13px] font-semibold text-[#8A3A12]">
            The Assistant needs you here
          </p>
          <p className="mt-1 text-[12.5px] leading-relaxed text-[#8A4A28]">
            Review this email thread and follow up with the customer when needed.
          </p>
        </div> */}
      </div>

      <div className="min-h-0 flex-1 space-y-3 overflow-y-auto px-4 py-4">
        {loading ? (
          <p className="py-8 text-center text-[13px] text-[#8A93A6]">Loading emails…</p>
        ) : emails.length === 0 ? (
          <p className="py-8 text-center text-[13px] text-[#8A93A6]">No emails found</p>
        ) : (
          emails.map((email) => <EmailMessageCard key={email.id} email={email} />)
        )}
      </div>
    </div>
  )
}
