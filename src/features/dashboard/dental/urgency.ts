import type { PatientPriorityFilterId } from "./types"

/** Summary cards that drive the dashboard list API `urgency` query. */
export type DentalSummaryCardId =
  | "very_high"
  | "health"
  | "might_leave"
  | "treatment"

/** API `urgency` query values for the Very High / High tabs. */
export const URGENCY_QUERY: Record<PatientPriorityFilterId, string> = {
  very_high: "Very High",
  high: "High",
}

/** API `urgency` for clickable summary cards (except Very High, which uses tabs). */
export const URGENCY_BY_SUMMARY_CARD: Record<DentalSummaryCardId, string> = {
  very_high: "Very High",
  health: "Health",
  might_leave: "Might be leaving",
  treatment: "May want treatment",
}

export const SELECTABLE_SUMMARY_CARD_IDS = new Set<string>([
  "very_high",
  "health",
  "might_leave",
  "treatment",
])

export function isSelectableSummaryCardId(
  id: string
): id is DentalSummaryCardId {
  return SELECTABLE_SUMMARY_CARD_IDS.has(id)
}

export function urgencyQueryFromFilter(
  filterId: PatientPriorityFilterId
): string {
  return URGENCY_QUERY[filterId]
}

/**
 * Resolve API `urgency`:
 * - Very High card → tab controls "Very High" | "High"
 * - Health / Might be leaving / May want treatment → card label as urgency
 */
export function resolveDashboardUrgency(
  summaryCardId: DentalSummaryCardId,
  filterId: PatientPriorityFilterId
): string {
  if (summaryCardId === "very_high") {
    return urgencyQueryFromFilter(filterId)
  }
  return URGENCY_BY_SUMMARY_CARD[summaryCardId]
}
