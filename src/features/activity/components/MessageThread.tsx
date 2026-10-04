"use client"

import { useEffect, useRef } from "react"
import MessageBubble from "./MessageBubble"
import type { ThreadMessage } from "../types"

type MessageThreadProps = {
  messages: ThreadMessage[]
  loading?: boolean
  hasNextPage?: boolean
  loadingMore?: boolean
  onLoadMore?: () => void
}

export default function MessageThread({
  messages,
  loading,
  hasNextPage = false,
  loadingMore = false,
  onLoadMore,
}: MessageThreadProps) {
  const sentinelRef = useRef<HTMLDivElement | null>(null)

  useEffect(() => {
    const sentinel = sentinelRef.current
    if (!sentinel || !hasNextPage || !onLoadMore) return

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting) {
          onLoadMore()
        }
      },
      { rootMargin: "100px" }
    )

    observer.observe(sentinel)
    return () => observer.disconnect()
  }, [hasNextPage, onLoadMore])

  const groups: { date: string; items: ThreadMessage[] }[] = []

  for (const message of messages) {
    const last = groups[groups.length - 1]
    if (last && last.date === message.dateGroup) {
      last.items.push(message)
    } else {
      groups.push({ date: message.dateGroup, items: [message] })
    }
  }

  if (loading) {
    return (
      <div className="flex min-h-0 flex-1 items-center justify-center px-4 py-8 text-[13px] text-[#8A93A6]">
        Loading messages...
      </div>
    )
  }

  if (messages.length === 0) {
    return (
      <div className="flex min-h-0 flex-1 items-center justify-center px-4 py-8 text-[13px] text-[#8A93A6]">
        No messages in this conversation yet
      </div>
    )
  }

  return (
    <div className="min-h-0 flex-1 space-y-4 overflow-y-auto px-4 py-4">
      {groups.map((group) => (
        <div key={group.date} className="flex flex-col gap-3">
          <div className="flex justify-center">
            <span className="rounded-full bg-[#ECEEF2] px-2.5 py-0.5 text-[11px] font-medium text-[#6B7280]">
              {group.date}
            </span>
          </div>
          {group.items.map((message) => (
            <MessageBubble key={message.id} message={message} />
          ))}
        </div>
      ))}
      {hasNextPage ? (
        <div ref={sentinelRef} className="flex items-center justify-center py-2">
          {loadingMore && (
            <span className="text-[11px] text-[#8A93A6]">Loading more...</span>
          )}
        </div>
      ) : (
        <p className="py-2 text-center text-[11px] text-[#8A93A6]">
          Start of conversation
        </p>
      )}
    </div>
  )
}
