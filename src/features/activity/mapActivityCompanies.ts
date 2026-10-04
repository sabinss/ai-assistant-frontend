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

export function mapActivityCompaniesToConversations(
  companies: ActivityCompany[]
): Conversation[] {
  return companies.map((company, index) => {
    const phone = company.to || ""
    const name = company.company_name?.trim() || "Unknown company"
    return {
      id: company.company_id || phone || `company-${index}`,
      name,
      initials: getInitials(name === "Unknown company" ? "" : name, phone),
      avatarColor: AVATAR_COLORS[index % AVATAR_COLORS.length],
      phone,
      companyId: company.company_id,
      industry: "",
      preview: "",
      timestamp: "",
      status: null,
      channel: "texts",
    }
  })
}
