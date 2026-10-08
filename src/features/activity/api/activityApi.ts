import http from "@/config/http"
import type {
  ActivityArchivePayload,
  ActivityCompany,
  ActivityCompanyListParams,
  ActivityEmailDetail,
  ActivityFilterCounts,
  ActivityMessage,
  ActivitySendMessagePayload,
  ConversationFilter,
  Pagination,
} from "../types"
import { normalizeActivityEmailDetails } from "../mapActivityEmails"
import { normalizeActivityMessages } from "../mapActivityMessages"

export type ActivityCompaniesResult = {
  data: ActivityCompany[]
  pagination: Pagination
}

function normalizePagination(data: unknown): Pagination | null {
  if (!data || typeof data !== "object") return null

  const record = data as Record<string, unknown>
  const raw =
    (record.pagination as Record<string, unknown> | undefined) ??
    (record.meta as Record<string, unknown> | undefined) ??
    null

  if (!raw || typeof raw !== "object") return null

  const currentPage = Number(raw.currentPage ?? raw.current_page ?? raw.page ?? 1)
  const totalPages = Number(raw.totalPages ?? raw.total_pages ?? 1)
  const totalRecords = Number(raw.totalRecords ?? raw.total_records ?? raw.total ?? 0)
  const limit = Number(raw.limit ?? raw.pageSize ?? raw.page_size ?? 10)
  const hasNextPage = Boolean(
    raw.hasNextPage ??
      raw.has_next_page ??
      (Number.isFinite(currentPage) && Number.isFinite(totalPages) && currentPage < totalPages)
  )
  const hasPrevPage = Boolean(raw.hasPrevPage ?? raw.has_prev_page ?? currentPage > 1)
  const nextPage = raw.nextPage ?? raw.next_page ?? (hasNextPage ? currentPage + 1 : null)
  const prevPage = raw.prevPage ?? raw.prev_page ?? (hasPrevPage ? currentPage - 1 : null)

  return {
    currentPage,
    totalPages,
    totalRecords,
    limit,
    hasNextPage,
    hasPrevPage,
    nextPage: nextPage == null ? null : Number(nextPage),
    prevPage: prevPage == null ? null : Number(prevPage),
  }
}

function toNonNegInt(value: unknown): number {
  const n = typeof value === "number" ? value : parseInt(String(value ?? ""), 10)
  if (!Number.isFinite(n) || n < 0) return 0
  return Math.floor(n)
}

/**
 * GET `/activity/count` — totals for All / Received / Needs reply / Paused chips.
 */
export async function fetchActivityCounts(accessToken: string): Promise<ActivityFilterCounts> {
  const { data } = await http.get("/activity/count", {
    headers: { Authorization: `Bearer ${accessToken}` },
  })

  const row =
    data && typeof data === "object" && !Array.isArray(data)
      ? (data as Record<string, unknown>)
      : {}

  return {
    all: toNonNegInt(row.total_cnt),
    received: toNonNegInt(row.total_has_inbound_msg_cnt),
    needs_reply: toNonNegInt(row.total_need_reply_cnt),
    paused: toNonNegInt(row.total_handed_off_cnt),
  }
}

/** Map UI chip → `/activity/company` query flags (All = no filter flags). */
export function companyListParamsFromFilter(
  filter: ConversationFilter
): Pick<
  ActivityCompanyListParams,
  "has_inbound_message" | "need_reply" | "handed_off"
> {
  if (filter === "received") return { has_inbound_message: true }
  if (filter === "needs_reply") return { need_reply: true }
  if (filter === "paused") return { handed_off: true }
  return {}
}

export async function fetchActivityCompanies(
  {
    page = 1,
    limit = 10,
    has_inbound_message,
    need_reply,
    handed_off,
  }: ActivityCompanyListParams = {},
  accessToken: string,
  signal?: AbortSignal
): Promise<ActivityCompaniesResult> {
  const params: Record<string, string | number | boolean> = { page, limit }
  if (has_inbound_message === true) params.has_inbound_message = true
  if (need_reply === true) params.need_reply = true
  if (handed_off === true) params.handed_off = true

  const { data } = await http.get("/activity/company", {
    headers: { Authorization: `Bearer ${accessToken}` },
    params,
    signal,
  })

  return normalizeCompanyListPayload(data, page, limit)
}

export async function fetchActivityCompanyById(
  companyId: string,
  accessToken: string
): Promise<ActivityMessage[]> {
  const { data } = await http.get(`/activity/company/${encodeURIComponent(companyId)}`, {
    headers: { Authorization: `Bearer ${accessToken}` },
  })
  console.log("activity company detail response", data)
  return normalizeActivityMessages(data)
}

function normalizeCompanyListPayload(
  data: unknown,
  page: number,
  limit: number
): ActivityCompaniesResult {
  const pagination = normalizePagination(data) ?? {
    currentPage: page,
    totalPages: 1,
    totalRecords: Array.isArray(data) ? data.length : 0,
    limit,
    hasNextPage: false,
    hasPrevPage: page > 1,
    nextPage: null,
    prevPage: page > 1 ? page - 1 : null,
  }

  if (Array.isArray(data)) return { data: data as ActivityCompany[], pagination }
  if (data && typeof data === "object") {
    const record = data as Record<string, unknown>
    if (Array.isArray(record.data)) {
      return { data: record.data as ActivityCompany[], pagination }
    }
    if (Array.isArray(record.companies)) {
      return { data: record.companies as ActivityCompany[], pagination }
    }
    if (Array.isArray(record.emails)) {
      return { data: record.emails as ActivityCompany[], pagination }
    }
  }
  return { data: [], pagination }
}

/**
 * GET `/activity/email` — email activity company list.
 */
export async function fetchActivityEmails(
  { page = 1, limit = 10 }: { page?: number; limit?: number } = {},
  accessToken: string,
  signal?: AbortSignal
): Promise<ActivityCompaniesResult> {
  const { data } = await http.get("/activity/email", {
    headers: { Authorization: `Bearer ${accessToken}` },
    params: { page, limit },
    signal,
  })
  console.log("[activity/email] list response", data)
  return normalizeCompanyListPayload(data, page, limit)
}

/**
 * GET `/activity/email/:companyId` — email messages for a company.
 */
export async function fetchActivityEmailById(
  companyId: string,
  accessToken: string
): Promise<ActivityEmailDetail[]> {
  const { data } = await http.get(`/activity/email/${encodeURIComponent(companyId)}`, {
    headers: { Authorization: `Bearer ${accessToken}` },
  })
  console.log("[activity/email/:companyId] detail response", data)
  return normalizeActivityEmailDetails(data)
}

export async function archiveActivityCompany(
  payload: ActivityArchivePayload,
  accessToken: string
): Promise<unknown> {
  const { data } = await http.post("/activity/company/archive", payload, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
      Accept: "application/json",
      "Content-Type": "application/json",
    },
  })
  return data
}

export async function sendActivityMessage(
  payload: ActivitySendMessagePayload,
  accessToken: string
): Promise<unknown> {
  const { data } = await http.post("/activity/call/sms", payload, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
      Accept: "application/json",
      "Content-Type": "application/json",
    },
  })
  return data
}
