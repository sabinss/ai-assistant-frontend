"use client"

import { AlertCircle } from "lucide-react"

type AssistantAlertProps = {
  title: string
  body: string
  onTakeOver?: () => void
}

export default function AssistantAlert({ title, body, onTakeOver }: AssistantAlertProps) {
  return (
    <div className="mx-4 mt-3 flex gap-3 rounded-lg border border-[#F0C9AE] bg-[#FDF3EC] p-3.5">
      <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-[#E85D3B] text-white">
        <AlertCircle size={15} strokeWidth={2.5} />
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-[13px] font-semibold text-[#8A3A12]">{title}</p>
        <p className="mt-1 text-[12.5px] leading-relaxed text-[#8A4A28]">{body}</p>
        <button
          type="button"
          onClick={onTakeOver}
          className="mt-2.5 rounded-md border border-[#1B3A8C] bg-white px-3 py-1.5 text-[12px] font-medium text-[#1B3A8C] hover:bg-[#EEF2FB]"
        >
          Pause and take over
        </button>
      </div>
    </div>
  )
}
