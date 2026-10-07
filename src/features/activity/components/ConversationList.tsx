"use client"

import ConversationSearch from "./ConversationSearch"
import ConversationFilters from "./ConversationFilters"
import ConversationListItem from "./ConversationListItem"
import ConversationPagination from "./ConversationPagination"
import type {
  ActivityPagination,
  Conversation,
  ConversationFilter,
} from "../types"

type ConversationListProps = {
  conversations: Conversation[]
  selectedId: string | null
  search: string
  activeFilter: ConversationFilter
  filterCounts: { all: number; received: number; needs_reply: number; paused: number }
  onSearchChange: (value: string) => void
  onFilterChange: (filter: ConversationFilter) => void
  onSelect: (id: string) => void
  pagination: ActivityPagination | null
  limit: number
  isFetching: boolean
  onPrevPage: () => void
  onNextPage: () => void
  onLimitChange: (limit: number) => void
}

export default function ConversationList({
  conversations,
  selectedId,
  search,
  activeFilter,
  filterCounts,
  onSearchChange,
  onFilterChange,
  onSelect,
  pagination,
  limit,
  isFetching,
  onPrevPage,
  onNextPage,
  onLimitChange,
}: ConversationListProps) {
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
      <div
        className={`min-h-0 flex-1 overflow-y-auto transition-opacity ${
          isFetching ? "opacity-60" : ""
        }`}
      >
        {conversations.length === 0 ? (
          <p className="px-4 py-8 text-center text-[13px] text-[#8A93A6]">
            No conversations found
          </p>
        ) : (
          conversations.map((conversation) => (
            <ConversationListItem
              key={conversation.id}
              conversation={conversation}
              isSelected={selectedId === conversation.id}
              onSelect={onSelect}
            />
          ))
        )}
      </div>
      {pagination && (
        <ConversationPagination
          pagination={pagination}
          limit={limit}
          disabled={isFetching}
          onPrev={onPrevPage}
          onNext={onNextPage}
          onLimitChange={onLimitChange}
        />
      )}
    </div>
  )
}
