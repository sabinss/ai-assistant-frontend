"use client"

import { Plus } from "lucide-react"

type ActivityHeaderProps = {
  onNewMessage?: () => void
}

export default function ActivityHeader({ onNewMessage }: ActivityHeaderProps) {
  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
      <div>
        <h1 className="text-[28px] font-bold tracking-tight text-[#1B3A8C]">Activity</h1>
        <p className="mt-1 max-w-xl text-[14px] leading-snug text-[#5A6478]">
          Every text, call and email with your customers — sent by you or by the Assistant.
        </p>
      </div>
      <button
        type="button"
        onClick={onNewMessage}
        className="inline-flex shrink-0 items-center gap-1.5 rounded-md bg-[#1B3A8C] px-3.5 py-2 text-[13px] font-medium text-white hover:bg-[#163075]"
      >
        <Plus size={16} strokeWidth={2.5} />
        New text message
      </button>
    </div>
  )
}
