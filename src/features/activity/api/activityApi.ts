import http from "@/config/http"
import type {
  ActivityArchivePayload,
  ActivityCompaniesParams,
  ActivityCompany,
  ActivityMessage,
  ActivitySendMessagePayload,
  PaginatedActivityCompanies,
} from "../types"
import { normalizeActivityMessages } from "../mapActivityMessages"

export async function fetchActivityCompanies(
  { page, limit }: ActivityCompaniesParams,
  accessToken: string,
  signal?: AbortSignal
): Promise<PaginatedActivityCompanies> {
  const { data } = await http.get("/activity/company", {
    params: { page, limit },
    headers: { Authorization: `Bearer ${accessToken}` },
    signal,
  })

  const rows: ActivityCompany[] = Array.isArray(data?.data) ? data.data : []
  const p = data?.pagination
  const totalRecords = Number(p?.totalRecords) || rows.length
  const pageSize = Number(p?.limit) || limit
  const currentPage = Number(p?.currentPage) || page
  const totalPages =
    Number(p?.totalPages) || Math.max(1, Math.ceil(totalRecords / pageSize))

  return {
    data: rows,
    pagination: {
      currentPage,
      totalPages,
      totalRecords,
      limit: pageSize,
      hasNextPage: p?.hasNextPage ?? currentPage < totalPages,
      hasPrevPage: p?.hasPrevPage ?? currentPage > 1,
      nextPage: p?.nextPage ?? null,
      prevPage: p?.prevPage ?? null,
    },
  }
}

export async function fetchActivityCompanyById(
  companyId: string,
  accessToken: string
): Promise<ActivityMessage[]> {
  const { data } = await http.get(
    `/activity/company/${encodeURIComponent(companyId)}`,
    {
      headers: { Authorization: `Bearer ${accessToken}` },
    }
  )
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
