import type { DentalSummaryCardId } from "./urgency"
import type {
  PatientPriorityFilter,
  PatientPriorityFilterId,
  PatientPriorityItem,
} from "./types"

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

/**
 * Tab badge counts for Health / Might be leaving / May want treatment:
 * - Very High → rows with that card's score === 100
 * - High → rows with that card's score === 75
 */
export function countPatientsBySummaryScore(
  patients: PatientPriorityItem[],
  summaryCardId: DentalSummaryCardId
): PatientPriorityFilter[] | null {
  const field = scoreFieldForSummaryCard(summaryCardId)
  if (!field) return null

  const veryHigh = patients.filter((p) => p[field] === 100).length
  const high = patients.filter((p) => p[field] === 75).length

  return [
    { id: "very_high", label: "Very High", count: veryHigh },
    { id: "high", label: "High", count: high },
  ]
}
