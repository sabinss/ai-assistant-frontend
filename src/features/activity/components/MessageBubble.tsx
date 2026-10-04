"use client"

import { Sparkles } from "lucide-react"
import type { ThreadMessage } from "../types"

type MessageBubbleProps = {
  message: ThreadMessage
}

export default function MessageBubble({ message }: MessageBubbleProps) {
  const isCustomer = message.sender === "customer"
  const isOutbound = !isCustomer

  return (
    <div className={`flex flex-col ${isOutbound ? "items-end" : "items-start"}`}>
      <div className="mb-1 flex flex-wrap items-center gap-1 text-[11px] text-[#8A93A6]">
        {isOutbound && <Sparkles size={11} className="text-[#1B3A8C]" />}
        <span>
          {message.senderLabel} · {message.time}
        </span>
        {(message.from || message.to) && (
          <span className="text-[#A0A8B8]">
            · {message.from || "—"} → {message.to || "—"}
          </span>
        )}
      </div>
      <div
        className={`max-w-[85%] rounded-2xl px-3.5 py-2.5 text-[13px] leading-relaxed ${
          isOutbound
            ? "rounded-br-md bg-[#D6E4F7] text-[#1A2333]"
            : "rounded-bl-md bg-[#F0F2F5] text-[#1A2333]"
        }`}
      >
        {message.text}
      </div>
    </div>
  )
}
