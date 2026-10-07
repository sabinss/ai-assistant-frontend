/**
 * Action Center — scoring metadata API.
 */

import type { ScoringMeta } from "../types"

const MOCK_SCORING_META: ScoringMeta = {
  lastRun: "today at 08:45 AM",
  nextRun: "in 7 days",
  scoringWindowDays: 60,
  todayActionCount: 2,
}

export async function fetchScoringMeta(): Promise<ScoringMeta> {
  // return http.get<ScoringMeta>("/action-center/scoring/meta").then((r) => r.data)
  return Promise.resolve({ ...MOCK_SCORING_META })
}

export async function fetchCompanyScores(companyId: string) {
  // return http.get(`/action-center/scoring/companies/${companyId}`).then((r) => r.data)
  console.log("[scoringApi] fetchCompanyScores", companyId)
  return Promise.resolve({
    companyId,
    valueScore: null,
    riskScore: null,
    opportunityScore: null,
  })
}
