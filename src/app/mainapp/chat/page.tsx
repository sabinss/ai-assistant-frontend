"use client"

import { Suspense } from "react"
import { useSearchParams } from "next/navigation"
import { MainAppChatBody } from "./MainAppChatBody"

function ChatPageInner() {
  const searchParams = useSearchParams()
  const queryParam = searchParams.get("query")

  return (
    <div className="flex w-full flex-col rounded-md border border-[#D7D7D7] bg-white text-[#333333] ">
      <MainAppChatBody initialQuery={queryParam} />
    </div>
  )
}

export default function ChatPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-[200px] items-center justify-center rounded-md border border-[#D7D7D7] bg-white text-sm text-muted-foreground">
          Loading chat…
        </div>
      }
    >
      <ChatPageInner />
    </Suspense>
  )
}
