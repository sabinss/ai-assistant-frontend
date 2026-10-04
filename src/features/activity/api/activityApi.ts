import http from "@/config/http"
import type { ActivityCompany, ActivityMessage, Pagination } from "../types"
import { normalizeActivityMessages } from "../mapActivityMessages"

export type ActivityCompaniesResult = {
  data: ActivityCompany[]
  pagination: Pagination | null
}

export type ActivityMessagesResult = {
  data: ActivityMessage[]
  pagination: Pagination | null
}

function normalizePagination(data: unknown): Pagination | null {
  if (data && typeof data === "object" && "pagination" in (data as Record<string, unknown>)) {
    return (data as Record<string, unknown>).pagination as Pagination
  }
  return null
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
  if (Array.isArray(data?.companies)) return { data: data.companies as ActivityCompany[], pagination }
  return { data: [], pagination }
}

export async function fetchActivityCompanyById(
  companyId: string,
  accessToken: string,
  page = 1,
  limit = 10
): Promise<ActivityMessagesResult> {
  const { data } = await http.get(
    `/activity/company/${encodeURIComponent(companyId)}`,
    {
      headers: { Authorization: `Bearer ${accessToken}` },
      params: { page, limit },
    }
  )
  console.log("activity company detail response", data)

  return {
    data: normalizeActivityMessages(data),
    pagination: normalizePagination(data),
  }
}
