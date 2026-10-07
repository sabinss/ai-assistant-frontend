/**
 * Action Center — server actions API.
 * Replace mock implementations with real HTTP calls (e.g. via `@/config/http`) when the backend is ready.
 */

import http from "@/config/http"
import type { ActionItem, SummaryStat } from "../types"
import { ACTIONS, SUMMARY_STATS } from "../data/mockData"

/**
 * GET `/organization/:org_id/action-center` — Action Centre payload for the current org.
 * Response shape is defined by your backend; consume via `organizationActionCenter` state in `ActionCenterView`.
 */
export async function fetchOrganizationActionCenter(
  orgId: string,
  accessToken: string
): Promise<unknown> {
  const { data } = await http.get(
    `/organization/${encodeURIComponent(orgId)}/action-center`,
    {
      headers: { Authorization: `Bearer ${accessToken}` },
    }
  )
  return data
}

export async function fetchActions(): Promise<ActionItem[]> {
  // return http.get<ActionItem[]>("/action-center/actions").then((r) => r.data)
  return Promise.resolve([...ACTIONS])
}

export async function fetchSummaryStats(): Promise<SummaryStat[]> {
  // return http.get<SummaryStat[]>("/action-center/summary").then((r) => r.data)
  return Promise.resolve([...SUMMARY_STATS])
}

export async function markActionDone(
  actionId: string,
  outcome: string,
  notes: string
): Promise<{ success: boolean }> {
  // await http.patch(`/action-center/actions/${actionId}/done`, { outcome, notes })
  console.log("[actionApi] markActionDone", { actionId, outcome, notes })
  return Promise.resolve({ success: true })
}

export async function snoozeAction(
  actionId: string,
  hours = 24
): Promise<{ success: boolean }> {
  // await http.patch(`/action-center/actions/${actionId}/snooze`, { hours })
  console.log("[actionApi] snoozeAction", { actionId, hours })
  return Promise.resolve({ success: true })
}
