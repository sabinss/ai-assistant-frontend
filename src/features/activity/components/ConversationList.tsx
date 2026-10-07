"use client"

import { useEffect, useRef } from "react"
import ConversationSearch from "./ConversationSearch"
import ConversationFilters from "./ConversationFilters"
import ConversationListItem from "./ConversationListItem"
import type { Conversation, ConversationFilter } from "../types"

type ConversationListProps = {
  conversations: Conversation[]
  selectedId: string | null
  search: string
  activeFilter: ConversationFilter
  filterCounts: { all: number; received: number; needs_reply: number; paused: number }
  hasNextPage?: boolean
  loadingMore?: boolean
  onSearchChange: (value: string) => void
  onFilterChange: (filter: ConversationFilter) => void
  onSelect: (id: string) => void
  onLoadMore?: () => void
}

export default function ConversationList({
  conversations,
  selectedId,
  search,
  activeFilter,
  filterCounts,
  hasNextPage = false,
  loadingMore = false,
  onSearchChange,
  onFilterChange,
  onSelect,
  onLoadMore,
}: ConversationListProps) {
  const scrollRef = useRef<HTMLDivElement | null>(null)
  const sentinelRef = useRef<HTMLDivElement | null>(null)

  useEffect(() => {
    const root = scrollRef.current
    const sentinel = sentinelRef.current
    if (!root || !sentinel || !hasNextPage || !onLoadMore) return

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting && !loadingMore) {
          onLoadMore()
        }
      },
      { root, rootMargin: "80px" }
    )

    observer.observe(sentinel)
    return () => observer.disconnect()
  }, [hasNextPage, onLoadMore, loadingMore, conversations.length])

  const filters = [
    { id: "all" as const, label: "All", count: filterCounts.all },
    { id: "received" as const, label: "Received", count: filterCounts.received },
    { id: "needs_reply" as const, label: "Needs reply", count: filterCounts.needs_reply },
    { id: "paused" as const, label: "Paused", count: filterCounts.paused },
  ]

  return (
    <div className="flex h-full min-h-0 w-full flex-col border-r border-[#E2E6EF] bg-white md:w-[340px] md:shrink-0">
      <div className="space-y-3 border-b border-[#EEF0F5] p-3">
        <ConversationSearch value={search} onChange={onSearchChange} />
        <ConversationFilters
          filters={filters}
          activeFilter={activeFilter}
          onChange={onFilterChange}
        />
      </div>
      <div ref={scrollRef} className="min-h-0 flex-1 overflow-y-auto">
        {conversations.length === 0 ? (
          <p className="px-4 py-8 text-center text-[13px] text-[#8A93A6]">
            No conversations found
          </p>
        ) : (
          <>
            {conversations.map((conversation) => (
              <ConversationListItem
                key={conversation.id}
                conversation={conversation}
                isSelected={selectedId === conversation.id}
                onSelect={onSelect}
              />
            ))}
            {hasNextPage ? (
              <div ref={sentinelRef} className="flex items-center justify-center py-3">
                {loadingMore ? (
                  <span className="text-[12px] text-[#8A93A6]">Loading more...</span>
                ) : (
                  <span className="h-4 w-full" aria-hidden />
                )}
              </div>
            ) : (
              <p className="px-4 py-3 text-center text-[11px] text-[#8A93A6]">
                No more conversations
              </p>
            )}
          </>
        )}
      </div>
    </div>
  )
}
