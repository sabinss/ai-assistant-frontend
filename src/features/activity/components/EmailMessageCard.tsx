"use client"

import { formatEmailTimestamp } from "../mapActivityEmails"
import type { ActivityEmailDetail } from "../types"

type EmailMessageCardProps = {
  email: ActivityEmailDetail
}

export default function EmailMessageCard({ email }: EmailMessageCardProps) {
  const senderLabel = email.agentSent
    ? "Assistant"
    : email.from || email.companyName || "Customer"

  return (
    <article className="rounded-xl border border-[#E2E6EF] bg-[#F4F6FA] px-5 py-4">
      <div className="mb-3 flex flex-wrap items-start justify-between gap-2">
        <div className="flex min-w-0 flex-wrap items-center gap-2">
          <span className="text-[14px] font-semibold text-[#1A2333]">{senderLabel}</span>
          {email.agentSent && (
            <span className="inline-flex items-center rounded-full bg-[#E8EDF8] px-2 py-0.5 text-[11px] font-medium text-[#1B3A8C]">
              + Sent automatically
            </span>
          )}
          {email.to ? (
            <span className="truncate text-[12.5px] text-[#6B7280]">to {email.to}</span>
          ) : null}
        </div>
        {email.createdAt ? (
          <time className="shrink-0 text-[12px] text-[#8A93A6]">
            {formatEmailTimestamp(email.createdAt)}
          </time>
        ) : null}
      </div>
      <div className="whitespace-pre-wrap text-[13.5px] leading-relaxed text-[#1A2333]">
        {email.body || "No message body"}
      </div>
    </article>
  )
}
