import type {
  DentalDashboardApiCounts,
  PatientPrioritySummaryStat,
} from "./types"

function toCount(value: number | null | undefined): number {
  if (value == null) return 0
  const n = Number(value)
  if (!Number.isFinite(n) || n < 0) return 0
  return Math.floor(n)
}

/**
 * Map `dentalDashboard` API counts → summary KPI cards.
 * Card order matches the Patient Priorities layout (+ Total Patients last).
 */
export function mapDentalDashboardSummaryStats(
  dentalDashboard: DentalDashboardApiCounts | null | undefined
): PatientPrioritySummaryStat[] {
  const d = dentalDashboard ?? {}

  return [
    {
      id: "very_high",
      label: "Very High",
      count: toCount(d.veryhigh_urgency_count),
      description: "patients need a person today",
      tone: "very_high",
      active: true,
    },
    {
      id: "health",
      label: "Health",
      count: toCount(d.health_issue_count),
      description: "reported pain or symptoms",
      tone: "health",
    },
    {
      id: "might_leave",
      label: "Might be leaving",
      count: toCount(d.churn_risk_count),
      description: "patients drifting away",
      tone: "might_leave",
    },
    {
      id: "treatment",
      label: "May want treatment",
      count: toCount(d.opp_score_count),
      description: "likely to book more care",
      tone: "treatment",
    },
    {
      id: "total_patients",
      label: "Total patients",
      count: toCount(d.total_patient_count),
      description: "patients in your practice",
      tone: "total",
    },
  ]
}

/**
 * Pull `dentalDashboard` from the raw dashboard API response.
 * API returns an array — use the 0th item for summary card counts.
 */
export function extractDentalDashboard(
  response: unknown
): DentalDashboardApiCounts | null {
  if (!response || typeof response !== "object") return null
  const root = response as Record<string, unknown>
  const nested =
    root.dentalDashboard ??
    (root.data as Record<string, unknown> | undefined)?.dentalDashboard

  if (Array.isArray(nested)) {
    const first = nested[0]
    if (!first || typeof first !== "object") return null
    return first as DentalDashboardApiCounts
  }

  if (nested && typeof nested === "object") {
    return nested as DentalDashboardApiCounts
  }

  return null
}
