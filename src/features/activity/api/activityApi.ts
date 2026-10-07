import http from "@/config/http"
import type {
  ActivityArchivePayload,
  ActivityCompany,
  ActivityFilterCounts,
  ActivityMessage,
  ActivitySendMessagePayload,
  Pagination,
} from "../types"
import { normalizeActivityMessages } from "../mapActivityMessages"

export type ActivityCompaniesResult = {
  data: ActivityCompany[]
  pagination: Pagination | null
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

export async function fetchActivityCompanies(
  accessToken: string,
  page = 1,
  limit = 10
): Promise<ActivityCompaniesResult> {
  const { data } = await http.get("/activity/company", {
    headers: { Authorization: `Bearer ${accessToken}` },
    params: { page, limit },
  })

  const pagination = normalizePagination(data)

  if (Array.isArray(data)) return { data: data as ActivityCompany[], pagination }
  if (Array.isArray(data?.data)) return { data: data.data as ActivityCompany[], pagination }
  if (Array.isArray(data?.companies)) {
    return { data: data.companies as ActivityCompany[], pagination }
  }
  return { data: [], pagination }
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
