import type { ActivityCompany, Conversation } from "./types"

const AVATAR_COLORS = ["#C8D9F5", "#F5D5C8", "#C8E8F0", "#D4D0F0", "#C8EBD4"]

function getInitials(name: string, phone: string): string {
  const trimmed = name.trim()
  if (trimmed) {
    const parts = trimmed.split(/\s+/).filter(Boolean)
    if (parts.length >= 2) {
      return `${parts[0][0]}${parts[1][0]}`.toUpperCase()
    }
    return trimmed.slice(0, 2).toUpperCase()
  }
  const digits = phone.replace(/\D/g, "")
  return (digits.slice(-2) || "?").toUpperCase()
}

export function matchesConversationSearch(conversation: Conversation, query: string): boolean {
  const term = query.trim().toLowerCase()
  if (!term) return true

  const digits = term.replace(/\D/g, "")
  const name = conversation.name.toLowerCase()
  const phone = conversation.phone.toLowerCase()
  const phoneDigits = conversation.phone.replace(/\D/g, "")
  const companyId = (conversation.companyId || "").toLowerCase()

  return (
    name.includes(term) ||
    phone.includes(term) ||
    companyId.includes(term) ||
    (digits.length > 0 && phoneDigits.includes(digits))
  )
}

function formatFullDateTime(isoDate: string | null | undefined): string {
  if (!isoDate) return ""
  const date = new Date(isoDate)
  if (Number.isNaN(date.getTime())) return isoDate
  return date.toLocaleString([], {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
    second: "2-digit",
  })
}

function toCount(value: boolean | number | null | undefined): number {
  if (typeof value === "number" && Number.isFinite(value)) return value
  return value ? 1 : 0
}

export function mapActivityCompaniesToConversations(companies: ActivityCompany[]): Conversation[] {
  const sorted = [...companies].sort((a, b) => {
    const aHasName = Boolean(a.company_name?.trim())
    const bHasName = Boolean(b.company_name?.trim())
    if (aHasName === bHasName) return 0
    return aHasName ? -1 : 1
  })

  return sorted.map((company, index) => {
    const phone = company.to || ""
    const name = company.company_name?.trim() || "Unknown company"
    const needReply = toCount(company.need_reply ?? company.Need_Reply)
    const handedOff = toCount(company.handed_off)
    return {
      id: company.company_id || phone || `company-${index}`,
      name,
      initials: getInitials(name === "Unknown company" ? "" : name, phone),
      avatarColor: AVATAR_COLORS[index % AVATAR_COLORS.length],
      phone,
      companyId: company.company_id,
      dealId: company.deal_id?.trim() || "",
      dealName: company.dealname?.trim() || "",
      dealStage: company.dealstage?.trim() || "",
      industry: "",
      preview: "",
      timestamp: formatFullDateTime(company.latest_updated_at),
      hasInboundMessage: Boolean(company.has_inbound_message),
      needReply,
      handedOff,
      status: null,
      channel: "texts",
    }
  })
}
