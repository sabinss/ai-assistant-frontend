import http from "@/config/http"
import type { ActivityCompany } from "../types"

export async function fetchActivityCompanies(
  accessToken: string
): Promise<ActivityCompany[]> {
  const { data } = await http.get("/activity/company", {
    headers: { Authorization: `Bearer ${accessToken}` },
  })

  if (Array.isArray(data)) return data as ActivityCompany[]
  if (Array.isArray(data?.data)) return data.data as ActivityCompany[]
  if (Array.isArray(data?.companies)) return data.companies as ActivityCompany[]
  return []
}

export async function fetchActivityCompanyById(
  companyId: string,
  accessToken: string
): Promise<unknown> {
  const { data } = await http.get(
    `/activity/company/${encodeURIComponent(companyId)}`,
    {
      headers: { Authorization: `Bearer ${accessToken}` },
    }
  )
  return data
}
