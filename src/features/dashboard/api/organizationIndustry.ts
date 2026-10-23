import http from "@/config/http"

/**
 * Fetch the logged-in user's organization industry.
 * Prefer `org.industry` from GET /organization/; fall back to detail if needed.
 */
export async function fetchOrganizationIndustry(
  accessToken: string,
  organizationId?: string | null
): Promise<string | null> {
  const { data } = await http.get("/organization/", {
    headers: { Authorization: `Bearer ${accessToken}` },
  })

  const org = data?.org ?? data?.data ?? data
  if (org?.industry != null && String(org.industry).trim() !== "") {
    return String(org.industry)
  }

  const orgId = organizationId || org?._id
  if (!orgId) return null

  const detailRes = await http.get(`/organization/${orgId}/detail`, {
    headers: { Authorization: `Bearer ${accessToken}` },
  })
  const detail = detailRes?.data?.data ?? detailRes?.data
  if (detail?.industry != null && String(detail.industry).trim() !== "") {
    return String(detail.industry)
  }

  return null
}
