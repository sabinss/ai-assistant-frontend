import type { DentalSummaryCardId } from "./urgency"
import type { PatientPriorityFilterId, PatientPriorityItem } from "./types"

/** Exact score required by Very High (100) / High (75) tabs. */
export function scoreThresholdForFilter(
  filterId: PatientPriorityFilterId
): number {
  return filterId === "high" ? 75 : 100
}

/**
 * Which score field the selected summary card uses for High / Very High filtering.
 * Very High card: no client score filter (API urgency already scopes the list).
 */
export function scoreFieldForSummaryCard(
  summaryCardId: DentalSummaryCardId
):
  | "valueRealisationScore"
  | "churnRiskScore"
  | "expansionOppScore"
  | null {
  switch (summaryCardId) {
    case "health":
      return "valueRealisationScore"
    case "might_leave":
      return "churnRiskScore"
    case "treatment":
      return "expansionOppScore"
    case "very_high":
    default:
      return null
  }
}

/**
 * Filter list by the card's score field at the Very High (100) / High (75) tab value.
 */
export function filterPatientsBySummaryScore(
  patients: PatientPriorityItem[],
  summaryCardId: DentalSummaryCardId,
  filterId: PatientPriorityFilterId
): PatientPriorityItem[] {
  const field = scoreFieldForSummaryCard(summaryCardId)
  if (!field) return patients

  const threshold = scoreThresholdForFilter(filterId)
  return patients.filter((p) => p[field] === threshold)
}
