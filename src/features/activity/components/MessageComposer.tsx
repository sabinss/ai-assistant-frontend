"use client"

import { Info, Send } from "lucide-react"

type MessageComposerProps = {
  customerName: string
  value: string
  onChange: (value: string) => void
  onSend?: () => void
  isSending?: boolean
}

export default function MessageComposer({
  customerName,
  value,
  onChange,
  onSend,
  isSending = false,
}: MessageComposerProps) {
  const canSend = Boolean(value.trim()) && !isSending

  return (
    <div className="border-t border-[#EEF0F5] px-4 py-3">
      <div className="rounded-lg border border-[#D8DEE9] bg-white p-3">
        <textarea
          rows={3}
          value={value}
          disabled={isSending}
          onChange={(e) => onChange(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault()
              if (canSend) onSend?.()
            }
          }}
          placeholder={`Write a text to ${customerName}...`}
          className="w-full resize-none text-[13px] text-[#1A2333] placeholder:text-[#9AA3B5] focus:outline-none disabled:opacity-60"
        />
        <div className="mt-2 flex justify-end">
          <button
            type="button"
            disabled={!canSend}
            onClick={(e) => {
              e.preventDefault()
              e.stopPropagation()
              if (canSend) onSend?.()
            }}
            className="inline-flex items-center gap-1.5 rounded-md bg-[#1B3A8C] px-3.5 py-1.5 text-[13px] font-medium text-white hover:bg-[#163075] disabled:cursor-not-allowed disabled:opacity-60"
          >
            <Send className="h-3.5 w-3.5 shrink-0" aria-hidden />
            {isSending ? "Sending..." : "Send"}
          </button>
        </div>
      </div>
      <p className="mt-2 flex items-start gap-1.5 text-[11.5px] leading-snug text-[#8A93A6]">
        <Info className="mt-0.5 h-3.5 w-3.5 shrink-0" aria-hidden />
        Sending a message pauses auto-replies for this customer, so you and the Assistant
        don&apos;t reply over each other.
      </p>
    </div>
  )
}
