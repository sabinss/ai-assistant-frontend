"use client"

import { useEffect } from "react"
import ChatMain from "./ChatMain"
import ChatTopBar from "./ChatTopBar"
import usePublicChat from "@/store/public_chat"

export type MainAppChatBodyProps = {
  initialQuery?: string | null
  bootstrapAgentName?: string | null
  onBootstrapAgentMissing?: () => void
  /** Use flex-fill layout for nested shells (e.g. Action Centre page) */
  fillContainer?: boolean
}

/**
 * Shared inner chat UI for `/mainapp/chat` and `/mainapp/action-center/chat`
 * so behaviour (agents, streaming, sessions, public-chat flags) stays identical.
 */
export function MainAppChatBody({
  initialQuery = null,
  bootstrapAgentName = null,
  onBootstrapAgentMissing,
  fillContainer,
}: MainAppChatBodyProps) {
  const { setPublicChat, setPublicChatHeaders } = usePublicChat()

  useEffect(() => {
    setPublicChat(false)
    setPublicChatHeaders({})
  }, [setPublicChat, setPublicChatHeaders])

  if (fillContainer) {
    return (
      <>
        <div className="shrink-0">
          <ChatTopBar />
        </div>
        <div className="flex min-h-0 flex-1 flex-col overflow-hidden">
          <ChatMain
            initialQuery={initialQuery}
            bootstrapAgentName={bootstrapAgentName}
            onBootstrapAgentMissing={onBootstrapAgentMissing}
            fillContainer
          />
        </div>
      </>
    )
  }

  return (
    <>
      <ChatTopBar />
      <ChatMain
        initialQuery={initialQuery}
        bootstrapAgentName={bootstrapAgentName}
        onBootstrapAgentMissing={onBootstrapAgentMissing}
      />
    </>
  )
}
