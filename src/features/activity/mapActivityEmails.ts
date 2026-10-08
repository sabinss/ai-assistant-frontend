import type { ActivityEmailDetail } from "./types"

function asString(value: unknown): string {
  return typeof value === "string" ? value : value == null ? "" : String(value)
}

export function formatEmailTimestamp(isoDate: string): string {
  if (!isoDate.trim()) return ""
  const date = new Date(isoDate)
  if (Number.isNaN(date.getTime())) return isoDate
  return date.toLocaleString([], {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  })
}

export function normalizeActivityEmailDetails(payload: unknown): ActivityEmailDetail[] {
  let rows: unknown[] = []
  if (Array.isArray(payload)) {
    rows = payload
  } else if (payload && typeof payload === "object") {
    const record = payload as Record<string, unknown>
    if (Array.isArray(record.data)) rows = record.data
    else if (Array.isArray(record.messages)) rows = record.messages
    else if (Array.isArray(record.emails)) rows = record.emails
  }

  return rows
    .filter((row): row is Record<string, unknown> => row != null && typeof row === "object")
    .map((row, index) => {
      const direction = asString(row.direction).toLowerCase()
      const agentSent = Boolean(row.agentsent) || direction === "outbound"
      return {
        id: asString(row.id) || `email-${index}`,
        subject: asString(row.subject).trim(),
        to: asString(row.to).trim(),
        from: asString(row.from).trim(),
        body: asString(row.body),
        companyName: asString(row.company_name ?? row.companyName).trim(),
        createdAt: asString(row.created_at ?? row.updated_at ?? row.createdAt),
        direction,
        agentSent,
      }
    })
}

export function pickEmailThreadSubject(emails: ActivityEmailDetail[]): string {
  for (let i = emails.length - 1; i >= 0; i -= 1) {
    if (emails[i].subject) return emails[i].subject
  }
  return "Email conversation"
}

export function pickEmailThreadTo(emails: ActivityEmailDetail[]): string {
  for (let i = emails.length - 1; i >= 0; i -= 1) {
    if (emails[i].to) return emails[i].to
  }
  return ""
}
