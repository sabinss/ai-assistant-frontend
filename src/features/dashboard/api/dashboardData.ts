import http from "@/config/http"

export type DashboardDataParams = {
  industry: string
  /** Patient priority tab: "Very High" | "High" */
  urgency?: string
}

/**
 * GET `/organization/dashboard/data?industry=...&urgency=...`
 * Industry-specific dashboard payload for the logged-in org.
 */
export async function fetchOrganizationDashboardData(
  accessToken: string,
  params: DashboardDataParams
): Promise<unknown> {
  const { data } = await http.get("/organization/dashboard/data", {
    headers: { Authorization: `Bearer ${accessToken}` },
    params: {
      industry: params.industry,
      ...(params.urgency ? { urgency: params.urgency } : {}),
    },
  })
  return data
}
