"use client"

import ThreadHeader from "./ThreadHeader"
import AssistantAlert from "./AssistantAlert"
import MessageThread from "./MessageThread"
import MessageComposer from "./MessageComposer"
import type { Conversation, ThreadMessage } from "../types"

type ThreadPanelProps = {
  conversation: Conversation | null
  messages: ThreadMessage[]
  alert?: { title: string; body: string } | null
  draft: string
  onDraftChange: (value: string) => void
  onSend?: () => void
  onTakeOver?: () => void
  onViewCustomer?: () => void
}

export default function ThreadPanel({
  conversation,
  messages,
  alert,
  draft,
  onDraftChange,
  onSend,
  onTakeOver,
  onViewCustomer,
}: ThreadPanelProps) {
  if (!conversation) {
    return (
      <div className="flex min-h-0 flex-1 items-center justify-center bg-white text-[14px] text-[#8A93A6]">
        Select a conversation to view messages
      </div>
    )
  }

  return (
    <div className="flex min-h-0 min-w-0 flex-1 flex-col bg-white">
      <ThreadHeader conversation={conversation} onViewCustomer={onViewCustomer} />
      {alert && (
        <AssistantAlert title={alert.title} body={alert.body} onTakeOver={onTakeOver} />
      )}
      <MessageThread messages={messages} />
      <MessageComposer
        customerName={conversation.name}
        value={draft}
        onChange={onDraftChange}
        onSend={onSend}
      />
    </div>
  )
}
