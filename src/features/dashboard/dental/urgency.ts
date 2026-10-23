import type { PatientPriorityFilterId } from "./types"

/** API `urgency` query values for the Very High / High tabs. */
export const URGENCY_QUERY: Record<PatientPriorityFilterId, string> = {
  very_high: "Very High",
  high: "High",
}

export function urgencyQueryFromFilter(
  filterId: PatientPriorityFilterId
): string {
  return URGENCY_QUERY[filterId]
}
