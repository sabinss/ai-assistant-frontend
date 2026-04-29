"use client"

import { useEffect, useState } from "react"
import { MainAppChatBody } from "@/app/mainapp/chat/MainAppChatBody"
import type { PendingDraft } from "../../types"

type ChatPanelProps = {
  pendingDraft: PendingDraft | null
  onDraftHandled: () => void
  /** Optional; retained for `ActionCentreView` — main chat UI handles feedback via `ChatMain` */
  onToast?: (msg: string) => void
}

/**
 * Action Centre right rail — uses the same `ChatTopBar` + `ChatMain` stack as `/mainapp/chat`
 * (streaming `/conversation/add`, agent flows, history via `ChatMain`), not the mock `chatApi`.
 */
export default function ChatPanel({ pendingDraft, onDraftHandled }: ChatPanelProps) {
  const [bootstrapQuery, setBootstrapQuery] = useState<string | null>(null)
  const [chatKey, setChatKey] = useState(0)

  useEffect(() => {
    if (!pendingDraft) return
    setBootstrapQuery(`Get draft — ${pendingDraft.label}`)
    setChatKey((k) => k + 1)
    onDraftHandled()
  }, [pendingDraft, onDraftHandled])

  return (
    <div
      style={{
        width: "40%",
        minWidth: 340,
        maxWidth: 520,
        flexShrink: 0,
        borderLeft: "1px solid #E2E6EF",
        display: "flex",
        flexDirection: "column",
        background: "#fff",
        minHeight: 0,
      }}
    >
      <div
        className="flex min-h-[420px] flex-1 flex-col overflow-hidden"
        style={{ fontFamily: "Inter, system-ui, sans-serif", minHeight: 0 }}
      >
        <MainAppChatBody key={chatKey} fillContainer initialQuery={bootstrapQuery} />
      </div>
    </div>
  )
}
