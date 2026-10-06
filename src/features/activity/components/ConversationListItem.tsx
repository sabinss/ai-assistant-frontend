"use client"

import { FaReply } from "react-icons/fa"
import type { Conversation, ConversationStatus } from "../types"

const STATUS_STYLES: Record<
  ConversationStatus,
  { label: string; className: string }
> = {
  needs_reply: {
    label: "Needs your reply",
    className: "bg-[#FCE8DF] text-[#C05621]",
  },
  paused: {
    label: "Auto-replies paused",
    className: "bg-[#ECEEF2] text-[#4A5168]",
  },
  assistant_replying: {
    label: "Assistant replying",
    className: "bg-[#E8EDF8] text-[#1B3A8C]",
  },
}

type ConversationListItemProps = {
  conversation: Conversation
  isSelected: boolean
  onSelect: (id: string) => void
}

export default function ConversationListItem({
  conversation,
  isSelected,
  onSelect,
}: ConversationListItemProps) {
  const status = conversation.status
    ? STATUS_STYLES[conversation.status]
    : null

  return (
    <button
      type="button"
      onClick={() => onSelect(conversation.id)}
      className={`w-full border-b border-[#EEF0F5] px-3 py-3 text-left transition-colors ${
        isSelected ? "bg-[#EAF1FC]" : "bg-white hover:bg-[#F7F9FC]"
      }`}
    >
      <div className="flex gap-2.5">
        <div
          className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-[12px] font-semibold text-[#1B3A8C]"
          style={{ backgroundColor: conversation.avatarColor }}
        >
          {conversation.initials}
        </div>
        <div className="min-w-0 flex-1">
          <p className="truncate text-[13px] font-semibold text-[#1A2333]">
            {conversation.name}
            {conversation.phone ? ` (${conversation.phone})` : ""}
          </p>
          {conversation.timestamp && (
            <p className="mt-0.5 text-[12px] text-[#6B7280]">
              {conversation.timestamp}
            </p>
          )}
          {conversation.preview && (
            <p className="mt-0.5 truncate text-[12px] text-[#6B7280]">
              {conversation.preview}
            </p>
          )}
          {status && (
            <span
              className={`mt-1.5 inline-block rounded-full px-2 py-0.5 text-[10.5px] font-medium ${status.className}`}
            >
              {status.label}
            </span>
          )}
        </div>
        {conversation.hasInboundMessage && (
          <FaReply
            className="mt-1 h-3.5 w-3.5 shrink-0 text-[#1B3A8C]"
            size={14}
            title="Needs reply"
            aria-hidden
          />
        )}
      </div>
    </button>
  )
}
