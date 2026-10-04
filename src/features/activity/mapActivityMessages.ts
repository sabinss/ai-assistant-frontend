import type { ActivityMessage, ThreadMessage } from "./types"

function formatMessageTime(isoDate: string): string {
  const date = new Date(isoDate)
  if (Number.isNaN(date.getTime())) return ""
  return date.toLocaleTimeString([], { hour: "numeric", minute: "2-digit" })
}

function formatDateGroup(isoDate: string): string {
  const date = new Date(isoDate)
  if (Number.isNaN(date.getTime())) return ""

  const today = new Date()
  const yesterday = new Date()
  yesterday.setDate(today.getDate() - 1)

  const isSameDay = (a: Date, b: Date) =>
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()

  if (isSameDay(date, today)) return "Today"
  if (isSameDay(date, yesterday)) return "Yesterday"
  return date.toLocaleDateString([], {
    weekday: "short",
    month: "short",
    day: "numeric",
  })
}

export function mapActivityMessagesToThread(
  messages: ActivityMessage[],
  fallbackCustomerName = "Customer"
): ThreadMessage[] {
  return [...messages]
    .sort(
      (a, b) =>
        new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
    )
    .map((message) => {
      const isOutbound =
        message.direction === "outbound" || Boolean(message.agentsent)

      return {
        id: message.id,
        sender: isOutbound ? "assistant" : "customer",
        senderLabel: isOutbound
          ? "Assistant"
          : message.company_name?.trim() || fallbackCustomerName,
        time: formatMessageTime(message.created_at),
        text: message.body || "",
        dateGroup: formatDateGroup(message.created_at),
      }
    })
}

export function normalizeActivityMessages(data: unknown): ActivityMessage[] {
  if (Array.isArray(data)) return data as ActivityMessage[]
  if (data && typeof data === "object") {
    const record = data as Record<string, unknown>
    if (Array.isArray(record.data)) return record.data as ActivityMessage[]
    if (Array.isArray(record.messages)) return record.messages as ActivityMessage[]
  }
  return []
}
