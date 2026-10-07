"use client"

import { useEffect, useState } from "react"
import { MainAppChatBody } from "@/app/mainapp/chat/MainAppChatBody"
import type { PendingDraft } from "../../types"

/** Agent chip label to select when opening chat from "View account" (match is case-insensitive). */
const ACCOUNT_SUMMARY_AGENT_NAME = "Account Summary"

/** Agent chip for "Draft Best Action" (match is case-insensitive). */
const DRAFT_BEST_ACTION_AGENT_NAME = "Draft Best Action"

type ChatPanelProps = {
  pendingDraft: PendingDraft | null
  onDraftHandled: () => void
  pendingAccountView: { company: string } | null
  onAccountViewHandled: () => void
  pendingDraftBestAction: { message: string } | null
  onDraftBestActionHandled: () => void
  /** Optional; retained for `ActionCentreView` — main chat UI handles feedback via `ChatMain` */
  onToast?: (msg: string) => void
}

/**
 * Action Centre right rail — uses the same `ChatTopBar` + `ChatMain` stack as `/mainapp/chat`
 * (streaming `/conversation/add`, agent flows, history via `ChatMain`), not the mock `chatApi`.
 */
export default function ChatPanel({
  pendingDraft,
  onDraftHandled,
  pendingAccountView,
  onAccountViewHandled,
  pendingDraftBestAction,
  onDraftBestActionHandled,
  onToast,
}: ChatPanelProps) {
  const [bootstrapQuery, setBootstrapQuery] = useState<string | null>(null)
  const [bootstrapAgentName, setBootstrapAgentName] = useState<string | null>(null)
  const [bootstrapAgentMissingMessage, setBootstrapAgentMissingMessage] = useState(
    "Account summary agent not found"
  )
  const [chatKey, setChatKey] = useState(0)

  useEffect(() => {
    if (!pendingDraft) return
    setBootstrapAgentName(null)
    setBootstrapQuery(`Get draft — ${pendingDraft.label}`)
    setChatKey((k) => k + 1)
    onDraftHandled()
  }, [pendingDraft, onDraftHandled])

  useEffect(() => {
    if (!pendingAccountView) return
    setBootstrapAgentMissingMessage("Account summary agent not found")
    setBootstrapAgentName(ACCOUNT_SUMMARY_AGENT_NAME)
    setBootstrapQuery(pendingAccountView.company)
    setChatKey((k) => k + 1)
    onAccountViewHandled()
  }, [pendingAccountView, onAccountViewHandled])

  useEffect(() => {
    if (!pendingDraftBestAction) return
    setBootstrapAgentMissingMessage("Draft Best Action agent not found")
    setBootstrapAgentName(DRAFT_BEST_ACTION_AGENT_NAME)
    setBootstrapQuery(pendingDraftBestAction.message)
    setChatKey((k) => k + 1)
    onDraftBestActionHandled()
  }, [pendingDraftBestAction, onDraftBestActionHandled])

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
        <MainAppChatBody
          key={chatKey}
          fillContainer
          initialQuery={bootstrapQuery}
          bootstrapAgentName={bootstrapAgentName}
          onBootstrapAgentMissing={() => onToast?.(bootstrapAgentMissingMessage)}
        />
      </div>
    </div>
  )
}
