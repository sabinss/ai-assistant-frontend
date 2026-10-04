"use client"

import { Info, Send } from "lucide-react"

type MessageComposerProps = {
  customerName: string
  value: string
  onChange: (value: string) => void
  onSend?: () => void
}

export default function MessageComposer({
  customerName,
  value,
  onChange,
  onSend,
}: MessageComposerProps) {
  return (
    <div className="border-t border-[#EEF0F5] px-4 py-3">
      <div className="rounded-lg border border-[#D8DEE9] bg-white p-3">
        <textarea
          rows={3}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={`Write a text to ${customerName}...`}
          className="w-full resize-none text-[13px] text-[#1A2333] placeholder:text-[#9AA3B5] focus:outline-none"
        />
        <div className="mt-2 flex justify-end">
          <button
            type="button"
            onClick={onSend}
            className="inline-flex items-center gap-1.5 rounded-md bg-[#1B3A8C] px-3.5 py-1.5 text-[13px] font-medium text-white hover:bg-[#163075]"
          >
            <Send size={14} />
            Send
          </button>
        </div>
      </div>
      <p className="mt-2 flex items-start gap-1.5 text-[11.5px] leading-snug text-[#8A93A6]">
        <Info size={13} className="mt-0.5 shrink-0" />
        Sending a message pauses auto-replies for this customer, so you and the Assistant
        don&apos;t reply over each other.
      </p>
    </div>
  )
}
