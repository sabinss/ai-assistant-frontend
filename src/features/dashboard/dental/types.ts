/** Tag chips shown under a patient name. */
export type PatientPriorityTagKind =
  | "very_high"
  | "high"
  | "reply_waiting"
  | "treatment"
  | "health"
  | "might_leave"

export type PatientPriorityTag = {
  id: string
  label: string
  kind: PatientPriorityTagKind
}

/** Priority filter tabs above the patient list (Very High / High). */
export type PatientPriorityFilterId = "very_high" | "high"

export type PatientPriorityFilter = {
  id: PatientPriorityFilterId
  label: string
  count: number
}

/** KPI summary cards at the top of the dashboard. */
export type PatientPrioritySummaryTone =
  | "very_high"
  | "health"
  | "might_leave"
  | "treatment"
  | "total"

/** Counts from GET `/organization/dashboard/data` → `dentalDashboard`. */
export type DentalDashboardApiCounts = {
  veryhigh_urgency_count?: number | null
  high_urgency_count?: number | null
  health_issue_count?: number | null
  churn_risk_count?: number | null
  opp_score_count?: number | null
  total_patient_count?: number | null
}

export type PatientPrioritySummaryStat = {
  id: string
  label: string
  count: number
  description: string
  tone: PatientPrioritySummaryTone
  /** When true, card renders with the selected/active border. */
  active?: boolean
}

export type PatientPriorityItem = {
  id: string
  /** Synthetic display name only — never real PHI in fixtures. */
  patientName: string
  tags: PatientPriorityTag[]
  reason: string
  meta: string
  nextStep: string
  /** Which filter bucket this row belongs to. */
  priority: PatientPriorityFilterId
}

export type PatientPrioritiesDashboardData = {
  clinicName: string
  updatedLabel: string
  title: string
  subtitle: string
  listNote: string
  summaryStats: PatientPrioritySummaryStat[]
  filters: PatientPriorityFilter[]
  patients: PatientPriorityItem[]
}
