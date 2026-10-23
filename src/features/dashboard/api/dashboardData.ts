import http from "@/config/http"

/**
 * GET `/organization/dashboard/data?industry=...`
 * Industry-specific dashboard payload for the logged-in org.
 */
export async function fetchOrganizationDashboardData(
  accessToken: string,
  industry: string
): Promise<unknown> {
  const { data } = await http.get("/organization/dashboard/data", {
    headers: { Authorization: `Bearer ${accessToken}` },
    params: { industry },
  })
  return data
}
