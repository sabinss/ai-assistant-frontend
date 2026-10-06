import http from "@/config/http"
import type {
  ActivityArchivePayload,
  ActivityCompany,
  ActivityMessage,
} from "../types"
import { normalizeActivityMessages } from "../mapActivityMessages"

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
