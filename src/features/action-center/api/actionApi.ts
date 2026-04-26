/**
 * Action Center — server actions API.
 * Replace mock implementations with real HTTP calls (e.g. via `@/config/http`) when the backend is ready.
 */

import type { ActionItem, SummaryStat } from "../types"
import { ACTIONS, SUMMARY_STATS } from "../data/mockData"

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
