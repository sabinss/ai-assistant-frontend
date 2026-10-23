import http from "@/config/http"

/**
 * Fetch the logged-in user's organization industry.
 *
 * Organization settings saves industry on GET/POST `/organization/:id/detail`.
 * Prefer detail over `/organization/` so dashboard routing matches what users set.
 */
export async function fetchOrganizationIndustry(
  accessToken: string,
  organizationId?: string | null
): Promise<string | null> {
  const { data } = await http.get("/organization/", {
    headers: { Authorization: `Bearer ${accessToken}` },
  })

  const org = data?.org ?? data?.data ?? data
  const orgId = organizationId || org?._id || org?.id || null

  let industryFromOrg: string | null = null
  if (org?.industry != null && String(org.industry).trim() !== "") {
    industryFromOrg = String(org.industry).trim()
  }

  let industryFromDetail: string | null = null
  if (orgId) {
    try {
      const detailRes = await http.get(`/organization/${orgId}/detail`, {
        headers: { Authorization: `Bearer ${accessToken}` },
      })
      const detail = detailRes?.data?.data ?? detailRes?.data
      if (detail?.industry != null && String(detail.industry).trim() !== "") {
        industryFromDetail = String(detail.industry).trim()
      }
    } catch (err) {
      console.error(
        "[fetchOrganizationIndustry] Failed to load org detail",
        err
      )
    }
  }

  const resolved = industryFromDetail ?? industryFromOrg
  console.log("[fetchOrganizationIndustry]", {
    orgId,
    industryFromOrg,
    industryFromDetail,
    resolved,
  })
  return resolved
}
