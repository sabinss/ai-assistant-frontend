"use client"

import { Suspense } from "react"
import { useSearchParams } from "next/navigation"
import { MainAppChatBody } from "./MainAppChatBody"

function ChatPageInner() {
  const searchParams = useSearchParams()
  const queryParam = searchParams.get("query")

  return (
    <div className="flex w-full flex-col overflow-hidden rounded-lg border border-[#E2E6EF] bg-white text-[#1A1F2E]">
      <MainAppChatBody initialQuery={queryParam} />
    </div>
  )
}

export default function ChatPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-[200px] items-center justify-center rounded-lg border border-[#E2E6EF] bg-white text-sm text-[#8B91A3]">
          Loading chat…
        </div>
      }
    >
      <ChatPageInner />
    </Suspense>
  )
}
