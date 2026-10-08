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
  /** Which chips to show. Defaults to all four (Texts). Email uses All + Received only. */
  visibleFilters?: ConversationFilter[]
  hasNextPage: boolean
  loadingMore: boolean
  onSearchChange: (value: string) => void
  onFilterChange: (filter: ConversationFilter) => void
  onSelect: (id: string) => void
  onLoadMore: () => void
}

const DEFAULT_VISIBLE_FILTERS: ConversationFilter[] = [
  "all",
  "received",
  "needs_reply",
  "paused",
]

export default function ConversationList({
  conversations,
  selectedId,
  search,
  activeFilter,
  filterCounts,
  visibleFilters = DEFAULT_VISIBLE_FILTERS,
  hasNextPage,
  loadingMore,
  onSearchChange,
  onFilterChange,
  onSelect,
  onLoadMore,
}: ConversationListProps) {
  const scrollRef = useRef<HTMLDivElement>(null)
  const sentinelRef = useRef<HTMLDivElement>(null)

  const allFilters = [
    { id: "all" as const, label: "All", count: filterCounts.all },
    { id: "received" as const, label: "Received", count: filterCounts.received },
    { id: "needs_reply" as const, label: "Needs reply", count: filterCounts.needs_reply },
    { id: "paused" as const, label: "Paused", count: filterCounts.paused },
  ]
  const filters = allFilters.filter((f) => visibleFilters.includes(f.id))

  useEffect(() => {
    const root = scrollRef.current
    const sentinel = sentinelRef.current
    if (!root || !sentinel || !hasNextPage) return

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((e) => e.isIntersecting) && !loadingMore) {
          onLoadMore()
        }
      },
      { root, rootMargin: "80px", threshold: 0 }
    )

    observer.observe(sentinel)
    return () => observer.disconnect()
  }, [hasNextPage, loadingMore, onLoadMore, conversations.length])

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
            <div ref={sentinelRef} className="h-1 w-full shrink-0" aria-hidden />
            {loadingMore && (
              <p className="px-4 py-3 text-center text-[12px] text-[#8A93A6]">
                Loading more…
              </p>
            )}
          </>
        )}
      </div>
    </div>
  )
}
