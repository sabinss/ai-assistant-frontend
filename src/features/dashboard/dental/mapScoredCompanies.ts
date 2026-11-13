import type { DentalSummaryCardId } from "./urgency"
import type {
  PatientPriorityFilterId,
  PatientPriorityItem,
  PatientPriorityTag,
} from "./types"
import { scoreThresholdForFilter } from "./scoreFilter"

/** One entry from GET `/organization/dashboard/data` → `scoredCompanies`. */
export type ScoredCompanyApiItem = {
  _id?: string
  id?: string
  company_id?: string
  name?: string | null
  context?: string | null
  notes?: string | null
  waiting_days?: string | number | null
  last_visit?: string | number | null
  description?: string | null
  assigned_to?: string | null
  deal_id?: string | null
  dealname?: string | null
  dealstage?: string | null
  to?: string | null
  phone?: string | null
  phone_number?: string | null
  handed_off?: string | number | boolean | null
  expansion_opp_score?: string | number | null
  churn_risk_score?: string | number | null
  value_realisation_score?: string | number | null
  [key: string]: unknown
}

function asText(value: unknown): string {
  if (value == null) return ""
  return String(value).trim()
}

function toScore(value: unknown): number | null {
  if (value == null || value === "") return null
  const n = Number(value)
  if (!Number.isFinite(n)) return null
  return n
}

function meetsScoreThreshold(
  value: unknown,
  priority: PatientPriorityFilterId
): boolean {
  const n = toScore(value)
  if (n == null) return false
  return n === scoreThresholdForFilter(priority)
}

function toHandedOff(value: unknown): number {
  if (typeof value === "number" && Number.isFinite(value)) return value > 0 ? 1 : 0
  if (typeof value === "boolean") return value ? 1 : 0
  if (typeof value === "string") {
    const s = value.trim().toLowerCase()
    if (s === "true" || s === "1" || s === "yes") return 1
    if (s === "false" || s === "0" || s === "no" || s === "") return 0
    const n = Number(s)
    return Number.isFinite(n) && n > 0 ? 1 : 0
  }
  return value ? 1 : 0
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
 * Bubbles by selected card + Very High (100) / High (75) tab:
 * - Health card → value_realisation_score → Health Issue
 * - Might be leaving → churn_risk_score → Drifting Away
 * - May want treatment → expansion_opp_score → Treatment Opp
 * - Very High card → any matching score tag
 */
export function mapScoreTags(
  item: ScoredCompanyApiItem,
  priority: PatientPriorityFilterId = "very_high",
  summaryCardId: DentalSummaryCardId = "very_high"
): PatientPriorityTag[] {
  const tags: PatientPriorityTag[] = []

  const addTreatment = () => {
    if (meetsScoreThreshold(item.expansion_opp_score, priority)) {
      tags.push({
        id: "treatment_opp",
        label: "Treatment Opp",
        kind: "treatment",
      })
    }
  }
  const addDrifting = () => {
    if (meetsScoreThreshold(item.churn_risk_score, priority)) {
      tags.push({
        id: "drifting_away",
        label: "Drifting Away",
        kind: "might_leave",
      })
    }
  }
  const addHealth = () => {
    if (meetsScoreThreshold(item.value_realisation_score, priority)) {
      tags.push({
        id: "health_issue",
        label: "Health Issue",
        kind: "health",
      })
    }
  }

  switch (summaryCardId) {
    case "health":
      addHealth()
      break
    case "might_leave":
      addDrifting()
      break
    case "treatment":
      addTreatment()
      break
    case "very_high":
    default:
      addTreatment()
      addDrifting()
      addHealth()
      break
  }

  return tags
}

/**
 * Map `scoredCompanies` → patient list rows.
 */
export function mapScoredCompaniesToPatients(
  scoredCompanies: ScoredCompanyApiItem[] | null | undefined,
  priority: PatientPriorityFilterId = "very_high",
  summaryCardId: DentalSummaryCardId = "very_high"
): PatientPriorityItem[] {
  if (!Array.isArray(scoredCompanies)) return []

  return scoredCompanies.map((item, index) => ({
    id: companyId(item, index),
    patientName: asText(item.name) || "—",
    tags: mapScoreTags(item, priority, summaryCardId),
    reason: asText(item.notes),
    meta: formatWaitingAndLastVisit(item.waiting_days, item.last_visit),
    nextStep: asText(item.description),
    assignedTo: asText(item.assigned_to),
    dealId: asText(item.deal_id),
    dealName: asText(item.dealname),
    dealStage: asText(item.dealstage),
    phone: asText(item.to) || asText(item.phone) || asText(item.phone_number),
    handedOff: toHandedOff(item.handed_off),
    expansionOppScore: toScore(item.expansion_opp_score),
    churnRiskScore: toScore(item.churn_risk_score),
    valueRealisationScore: toScore(item.value_realisation_score),
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
