"use client"

import type { ActivityPagination } from "../types"

export const PAGE_SIZE_OPTIONS = [10, 25, 50, 100]

type ConversationPaginationProps = {
  pagination: ActivityPagination
  limit: number
  disabled?: boolean
  onPrev: () => void
  onNext: () => void
  onLimitChange: (limit: number) => void
}

const buttonClass =
  "rounded-md border border-[#E2E6EF] px-2.5 py-1 text-[12px] font-medium text-[#1B3A8C] disabled:cursor-not-allowed disabled:opacity-40"

export default function ConversationPagination({
  pagination,
  limit,
  disabled,
  onPrev,
  onNext,
  onLimitChange,
}: ConversationPaginationProps) {
  return (
    <div className="space-y-2 border-t border-[#EEF0F5] p-3 text-[12px] text-[#8A93A6]">
      <div className="flex items-center justify-between gap-2">
        <span>
          Page {pagination.currentPage} of {Math.max(pagination.totalPages, 1)}
        </span>
        <span>{pagination.totalRecords} total</span>
      </div>
      <div className="flex items-center justify-between gap-2">
        <label className="flex items-center gap-1">
          <span>Per page</span>
          <select
            value={limit}
            disabled={disabled}
            onChange={(e) => onLimitChange(Number(e.target.value))}
            className="rounded-md border border-[#E2E6EF] bg-white px-1 py-1 text-[12px] text-[#1B3A8C]"
          >
            {PAGE_SIZE_OPTIONS.map((size) => (
              <option key={size} value={size}>
                {size}
              </option>
            ))}
          </select>
        </label>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={onPrev}
            disabled={disabled || !pagination.hasPrevPage}
            className={buttonClass}
          >
            Prev
          </button>
          <button
            type="button"
            onClick={onNext}
            disabled={disabled || !pagination.hasNextPage}
            className={buttonClass}
          >
            Next
          </button>
        </div>
      </div>
    </div>
  )
}
