export type ChannelTab = "texts" | "calls" | "emails"

export type ConversationFilter = "all" | "needs_reply" | "paused"

export type ConversationStatus = "needs_reply" | "paused" | "assistant_replying"

export type MessageSender = "assistant" | "customer" | "user"

export type ActivityCompany = {
  to: string
  company_name: string | null
  company_id: string | null
}

export type Conversation = {
  id: string
  name: string
  initials: string
  avatarColor: string
  phone: string
  companyId: string | null
  industry: string
  preview: string
  timestamp: string
  status: ConversationStatus | null
  channel: ChannelTab
}

export type ThreadMessage = {
  id: string
  sender: MessageSender
  senderLabel: string
  time: string
  text: string
  dateGroup: string
}

export type ChannelTabConfig = {
  id: ChannelTab
  label: string
  badge?: string
}
