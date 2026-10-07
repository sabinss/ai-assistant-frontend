export type ChannelTab = "texts" | "calls" | "emails"

export type ConversationFilter = "all" | "received" | "needs_reply" | "paused"

export type ConversationStatus = "needs_reply" | "paused" | "assistant_replying"

export type MessageSender = "assistant" | "customer" | "user"

export type ActivityCompany = {
  to: string
  company_name: string | null
  company_id: string | null
  latest_updated_at?: string | null
  has_inbound_message?: boolean
  need_reply?: boolean | number | null
  handed_off?: boolean | number | null
  deal_id?: string | null
  dealname?: string | null
  dealstage?: string | null
}

export type Pagination = {
  currentPage: number
  totalPages: number
  totalRecords: number
  limit: number
  hasNextPage: boolean
  hasPrevPage: boolean
  nextPage: number | null
  prevPage: number | null
}

export type ActivityArchivePayload = {
  deal_id: string
  dealname: string
  dealstage: string
  company_id: string
  tenant_id: string
  archive: boolean
}

export type ActivitySendMessagePayload = {
  message: string
  to: string
}

export type ActivityMessage = {
  id: string
  body: string
  company_id: string | null
  company_name: string | null
  contact_id: string | null
  conversation_id: string | null
  created_at: string
  direction: "inbound" | "outbound" | string
  from: string | null
  to: string | null
  status: string | null
  subject: string | null
  thread_id: string | null
  type: string | null
  agentsent?: boolean
  updated_at?: string
}

export type Conversation = {
  id: string
  name: string
  initials: string
  avatarColor: string
  phone: string
  companyId: string | null
  dealId: string
  dealName: string
  dealStage: string
  industry: string
  preview: string
  timestamp: string
  hasInboundMessage: boolean
  needReply: number
  handedOff: number
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
  from: string
  to: string
}

export type ChannelTabConfig = {
  id: ChannelTab
  label: string
  badge?: string
}
