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

function isScore100(value: unknown): boolean {
  if (value == null || value === "") return false
  return Number(value) === 100
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
 * Patient detail tags when a score is exactly 100:
 * - expansion_opp_score → Treatment Opp
 * - churn_risk_score → Drifting Away
 * - value_realisation_score → Health Issue
 */
export function mapScoreTags(item: ScoredCompanyApiItem): PatientPriorityTag[] {
  const tags: PatientPriorityTag[] = []

  if (isScore100(item.expansion_opp_score)) {
    tags.push({ id: "treatment_opp", label: "Treatment Opp", kind: "treatment" })
  }
  if (isScore100(item.churn_risk_score)) {
    tags.push({ id: "drifting_away", label: "Drifting Away", kind: "might_leave" })
  }
  if (isScore100(item.value_realisation_score)) {
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
 * - score === 100 fields → detail tags
 */
export function mapScoredCompaniesToPatients(
  scoredCompanies: ScoredCompanyApiItem[] | null | undefined,
  priority: PatientPriorityFilterId = "very_high"
): PatientPriorityItem[] {
  if (!Array.isArray(scoredCompanies)) return []

  return scoredCompanies.map((item, index) => ({
    id: companyId(item, index),
    patientName: asText(item.name) || "—",
    tags: mapScoreTags(item),
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
