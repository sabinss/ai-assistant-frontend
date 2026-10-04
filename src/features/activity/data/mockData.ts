import type { ChannelTabConfig, ThreadMessage } from "../types"

export const CHANNEL_TABS: ChannelTabConfig[] = [
  { id: "texts", label: "Texts", badge: "2 need reply" },
  // { id: "calls", label: "Calls" },
  // { id: "emails", label: "Emails", badge: "1 needs reply" },
]

export const MOCK_THREAD_MESSAGES: Record<string, ThreadMessage[]> = {}

export const ASSISTANT_ALERT = {
  title: "The Assistant needs you here",
  body: "Dana asked for a walkthrough of the reporting module. The Assistant can't arrange that, so it passed the conversation to you.",
}
