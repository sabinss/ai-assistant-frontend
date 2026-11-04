import type { Conversation } from "./types"

export type CustomerDetailFrom = "dashboard" | "activity"

export type CustomerDetailHrefOptions = {
  name?: string | null
  /** When set to dashboard, Back returns to `/mainapp/dashboard`. */
  from?: CustomerDetailFrom
  dealId?: string | null
  dealName?: string | null
  dealStage?: string | null
  phone?: string | null
  handedOff?: number | boolean | null
}

/** Shared Activity deep-link for customer / patient detail. */
export function activityCustomerDetailHref(
  companyId: string,
  options: CustomerDetailHrefOptions | string | null = {}
): string {
  const opts: CustomerDetailHrefOptions =
    typeof options === "string" || options == null
      ? { name: options }
      : options

  const params = new URLSearchParams({
    companyId,
    detail: "1",
  })

  const name = (opts.name ?? "").trim()
  if (name) params.set("name", name)
  if (opts.from) params.set("from", opts.from)

  const dealId = (opts.dealId ?? "").trim()
  if (dealId) params.set("dealId", dealId)
  const dealName = (opts.dealName ?? "").trim()
  if (dealName) params.set("dealName", dealName)
  const dealStage = (opts.dealStage ?? "").trim()
  if (dealStage) params.set("dealStage", dealStage)
  const phone = (opts.phone ?? "").trim()
  if (phone) params.set("phone", phone)
  if (opts.handedOff != null && Number(opts.handedOff) > 0) {
    params.set("handedOff", "1")
  }

  return `/mainapp/activity?${params.toString()}`
}

export function stubConversationForDetail(
  companyId: string,
  options: CustomerDetailHrefOptions | string = {}
): Conversation {
  const opts: CustomerDetailHrefOptions =
    typeof options === "string" ? { name: options } : options

  const displayName = (opts.name ?? "").trim() || "Patient"
  const parts = displayName.split(/\s+/).filter(Boolean)
  const initials =
    parts.length >= 2
      ? `${parts[0][0]}${parts[1][0]}`.toUpperCase()
      : displayName.slice(0, 2).toUpperCase() || "?"

  const handedOff =
    opts.handedOff === true || Number(opts.handedOff) > 0 ? 1 : 0

  return {
    id: companyId,
    name: displayName,
    initials,
    avatarColor: "#E8EEF9",
    phone: (opts.phone ?? "").trim(),
    companyId,
    dealId: (opts.dealId ?? "").trim(),
    dealName: (opts.dealName ?? "").trim(),
    dealStage: (opts.dealStage ?? "").trim(),
    industry: "",
    preview: "",
    timestamp: "",
    hasInboundMessage: false,
    needReply: 0,
    handedOff,
    status: handedOff ? "paused" : null,
    channel: "texts",
  }
}

export function parseCustomerDetailSearchParams(
  searchParams: URLSearchParams
): {
  companyId: string | null
  isDetail: boolean
  from: CustomerDetailFrom
  options: CustomerDetailHrefOptions
} {
  const companyId = searchParams.get("companyId")?.trim() || null
  const isDetail = searchParams.get("detail") === "1"
  const fromParam = searchParams.get("from")
  const from: CustomerDetailFrom =
    fromParam === "dashboard" ? "dashboard" : "activity"

  return {
    companyId,
    isDetail,
    from,
    options: {
      name: searchParams.get("name"),
      from,
      dealId: searchParams.get("dealId"),
      dealName: searchParams.get("dealName"),
      dealStage: searchParams.get("dealStage"),
      phone: searchParams.get("phone"),
      handedOff: searchParams.get("handedOff") === "1" ? 1 : 0,
    },
  }
}
