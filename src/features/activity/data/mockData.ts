import type { ChannelTabConfig, ThreadMessage } from "../types"

export const CHANNEL_TABS: ChannelTabConfig[] = [
  { id: "texts", label: "Texts", badge: "" },
  { id: "emails", label: "Email" },
]

export const MOCK_THREAD_MESSAGES: Record<string, ThreadMessage[]> = {}

export const ASSISTANT_ALERT = {
  title: "The Assistant needs you here",
  body: "",
}
