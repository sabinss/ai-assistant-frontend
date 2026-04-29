"use client"

import { Suspense } from "react"
import Link from "next/link"
import { useSearchParams } from "next/navigation"
import { ChevronLeft } from "lucide-react"
import { MainAppChatBody } from "@/app/mainapp/chat/MainAppChatBody"

function ActionCenterChatContent() {
  const searchParams = useSearchParams()
  const queryParam = searchParams.get("query")

  return (
    <div
      className="flex min-h-0 flex-1 flex-col overflow-hidden bg-[#F4F6FA]"
      style={{ fontFamily: "Inter, system-ui, sans-serif" }}
    >
      <header className="flex shrink-0 items-center gap-3 border-b border-[#E2E6EF] bg-white px-5 py-3">
        <Link
          href="/mainapp/action-center"
          className="inline-flex items-center gap-1.5 text-[13px] font-medium text-[#1B3A8C] transition-colors hover:text-[#152a66]"
        >
          <ChevronLeft className="h-4 w-4 shrink-0" aria-hidden />
          Action Centre
        </Link>
        <span className="text-[#CDD3E0]" aria-hidden>
          /
        </span>
        <div>
          <h1 className="text-[15px] font-semibold leading-tight text-[#1A1F2E]">Chat</h1>
          <p className="text-[12px] text-[#8B91A3]">Same behaviour as main Chat — Action Centre layout</p>
        </div>
      </header>

      <div className="box-border flex min-h-0 flex-1 flex-col overflow-hidden p-4">
        <div className="flex min-h-0 flex-1 flex-col overflow-hidden rounded-lg border border-[#E2E6EF] bg-white shadow-sm">
          <div className="flex min-h-0 flex-1 flex-col overflow-hidden px-1 pb-2 pt-0">
            <MainAppChatBody initialQuery={queryParam} fillContainer />
          </div>
        </div>
      </div>
    </div>
  )
}

export default function ActionCenterChatPage() {
  return (
    <Suspense
      fallback={
        <div
          className="flex flex-1 items-center justify-center bg-[#F4F6FA] text-[13px] text-[#8B91A3]"
          style={{ fontFamily: "Inter, system-ui, sans-serif", minHeight: 240 }}
        >
          Loading chat…
        </div>
      }
    >
      <ActionCenterChatContent />
    </Suspense>
  )
}
