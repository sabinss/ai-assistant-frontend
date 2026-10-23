import type {
  PatientPriorityFilterId,
  PatientPriorityItem,
  PatientPriorityTag,
} from "./types"

/** One entry from GET `/organization/dashboard/data` → `scoredCompanies`. */
export type ScoredCompanyApiItem = {
  _id?: string
  id?: string
  company_id?: string
  name?: string | null
  context?: string | null
  waiting_days?: string | number | null
  last_visit?: string | number | null
  description?: string | null
  expansion_opp_score?: string | number | null
  churn_risk_score?: string | number | null
  value_realisation_score?: string | number | null
  [key: string]: unknown
}

function asText(value: unknown): string {
  if (value == null) return ""
  return String(value).trim()
}

/**
 * Bubble exact scores by urgency tab:
 * - Very High → score must be exactly 100
 * - High → score must be exactly 75
 */
function exactScoreForPriority(priority: PatientPriorityFilterId): number {
  return priority === "high" ? 75 : 100
}

function meetsScoreThreshold(
  value: unknown,
  priority: PatientPriorityFilterId
): boolean {
  if (value == null || value === "") return false
  const n = Number(value)
  if (!Number.isFinite(n)) return false
  return n === exactScoreForPriority(priority)
}

function companyId(item: ScoredCompanyApiItem, index: number): string {
  return (
    asText(item._id) ||
    asText(item.id) ||
    asText(item.company_id) ||
    `scored-company-${index}`
  )
}

/**
 * Build the meta line under context:
 * `Waiting for {waiting_days} : Last visit {last_visit}`
 */
export function formatWaitingAndLastVisit(
  waitingDays: unknown,
  lastVisit: unknown
): string {
  const waiting = asText(waitingDays) || "—"
  const visit = asText(lastVisit) || "—"
  return `Waiting for ${waiting} : Last visit ${visit}`
}

/**
 * Patient detail bubbles by exact score (Very High: 100, High: 75):
 * - expansion_opp_score → Treatment Opp
 * - churn_risk_score → Drifting Away
 * - value_realisation_score → Health Issue
 */
export function mapScoreTags(
  item: ScoredCompanyApiItem,
  priority: PatientPriorityFilterId = "very_high"
): PatientPriorityTag[] {
  const tags: PatientPriorityTag[] = []

  if (meetsScoreThreshold(item.expansion_opp_score, priority)) {
    tags.push({ id: "treatment_opp", label: "Treatment Opp", kind: "treatment" })
  }
  if (meetsScoreThreshold(item.churn_risk_score, priority)) {
    tags.push({ id: "drifting_away", label: "Drifting Away", kind: "might_leave" })
  }
  if (meetsScoreThreshold(item.value_realisation_score, priority)) {
    tags.push({ id: "health_issue", label: "Health Issue", kind: "health" })
  }

  return tags
}

/**
 * Map `scoredCompanies` → patient list rows.
 * - name → patient name
 * - context → second column
 * - waiting_days : last_visit → below context
 * - description → third column
 * - score bubbles use exact urgency scores (100 / 75)
 */
export function mapScoredCompaniesToPatients(
  scoredCompanies: ScoredCompanyApiItem[] | null | undefined,
  priority: PatientPriorityFilterId = "very_high"
): PatientPriorityItem[] {
  if (!Array.isArray(scoredCompanies)) return []

  return scoredCompanies.map((item, index) => ({
    id: companyId(item, index),
    patientName: asText(item.name) || "—",
    tags: mapScoreTags(item, priority),
    reason: asText(item.context),
    meta: formatWaitingAndLastVisit(item.waiting_days, item.last_visit),
    nextStep: asText(item.description),
    priority,
  }))
}

/** Pull `scoredCompanies` from the raw dashboard API response. */
export function extractScoredCompanies(
  response: unknown
): ScoredCompanyApiItem[] {
  if (!response || typeof response !== "object") return []
  const root = response as Record<string, unknown>
  const list =
    root.scoredCompanies ??
    (root.data as Record<string, unknown> | undefined)?.scoredCompanies
  return Array.isArray(list) ? (list as ScoredCompanyApiItem[]) : []
}
