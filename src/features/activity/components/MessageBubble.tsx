"use client"

import { Sparkles } from "lucide-react"
import type { ThreadMessage } from "../types"

type MessageBubbleProps = {
  message: ThreadMessage
}

export default function MessageBubble({ message }: MessageBubbleProps) {
  const outgoing = message.sender === "assistant"

  return (
    <div
      className={`flex w-full flex-col ${
        outgoing ? "items-end self-end" : "items-start self-start"
      }`}
    >
      <div className="mb-1 flex items-center gap-1 text-[11px] text-[#8A93A6]">
        {outgoing && (
          <Sparkles className="h-3 w-3 shrink-0 text-[#1B3A8C]" aria-hidden />
        )}
        <span>
          {message.senderLabel} · {message.time}
        </span>
      </div>
      <div
        className={`max-w-[85%] rounded-2xl px-3.5 py-2.5 text-[13px] leading-relaxed ${
          outgoing
            ? "rounded-br-md bg-[#D6E4F7] text-[#1A2333]"
            : "rounded-bl-md bg-[#F0F2F5] text-[#1A2333]"
        }`}
      >
        {message.text}
      </div>
    </div>
  )
}
