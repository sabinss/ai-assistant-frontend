import type { PatientPriorityItem } from "./types"

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
  [key: string]: unknown
}

function asText(value: unknown): string {
  if (value == null) return ""
  return String(value).trim()
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
 * Map `scoredCompanies` → patient list rows.
 * - name → patient name
 * - context → second column
 * - waiting_days : last_visit → below context
 * - description → third column
 */
export function mapScoredCompaniesToPatients(
  scoredCompanies: ScoredCompanyApiItem[] | null | undefined
): PatientPriorityItem[] {
  if (!Array.isArray(scoredCompanies)) return []

  return scoredCompanies.map((item, index) => ({
    id: companyId(item, index),
    patientName: asText(item.name) || "—",
    tags: [],
    reason: asText(item.context),
    meta: formatWaitingAndLastVisit(item.waiting_days, item.last_visit),
    nextStep: asText(item.description),
    // List filter: show under Very High until API exposes priority buckets.
    priority: "very_high" as const,
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
