import type { Conversation } from "./types"

/** Shared Activity deep-link for customer / patient detail. */
export function activityCustomerDetailHref(
  companyId: string,
  name?: string | null
): string {
  const params = new URLSearchParams({
    companyId,
    detail: "1",
  })
  const trimmed = (name ?? "").trim()
  if (trimmed) params.set("name", trimmed)
  return `/mainapp/activity?${params.toString()}`
}

export function stubConversationForDetail(
  companyId: string,
  name = ""
): Conversation {
  const displayName = name.trim() || "Patient"
  const parts = displayName.split(/\s+/).filter(Boolean)
  const initials =
    parts.length >= 2
      ? `${parts[0][0]}${parts[1][0]}`.toUpperCase()
      : displayName.slice(0, 2).toUpperCase() || "?"

  return {
    id: companyId,
    name: displayName,
    initials,
    avatarColor: "#E8EEF9",
    phone: "",
    companyId,
    dealId: "",
    dealName: "",
    dealStage: "",
    industry: "",
    preview: "",
    timestamp: "",
    hasInboundMessage: false,
    needReply: 0,
    handedOff: 0,
    status: null,
    channel: "texts",
  }
}
