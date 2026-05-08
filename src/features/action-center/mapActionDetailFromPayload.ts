import type { ActionDetailPart, ActionItem, ActionScores, ActionStage, ActionTier } from "./types"

/** Canonical UI order for tier sections and sorting `actionDetails` */
export const TIER_SECTION_ORDER: ActionTier[] = ["today", "week", "month", "watch"]

function normalizeApiTier(raw: unknown): ActionTier | null {
  if (typeof raw !== "string") return null
  const s = raw.trim().toLowerCase().replace(/-/g, "_")
  if (s === "today") return "today"
  if (s === "this_week" || s === "week") return "week"
  if (s === "this_month" || s === "month") return "month"
  if (s === "watch") return "watch"
  return null
}

function num(ctx: Record<string, unknown> | null, key: string): number | null {
  if (!ctx) return null
  const v = ctx[key]
  return typeof v === "number" && Number.isFinite(v) ? v : null
}

function str(ctx: Record<string, unknown> | null, key: string): string | null {
  if (!ctx) return null
  const v = ctx[key]
  return typeof v === "string" && v.trim() ? v.trim() : null
}

function mapContext(ctx: unknown): ActionScores {
  if (ctx == null || typeof ctx !== "object") return {}
  const o = ctx as Record<string, unknown>
  return {
    risk: num(o, "risk_score"),
    value: num(o, "value_score"),
    opp: num(o, "opportunity_score"),
    engagementTrend: str(o, "engagement_trend"),
    sentimentTrajectory: str(o, "sentiment_trajectory"),
  }
}

function inferStageFromRisk(risk: number | null): { stage: ActionStage; stageLabel: string } {
  if (risk == null) return { stage: "active", stageLabel: "Active" }
  const u = risk > 1 ? risk / 100 : risk
  if (u >= 0.65) return { stage: "risk", stageLabel: "At Risk" }
  return { stage: "active", stageLabel: "Active" }
}

function renewalFromDueDate(due: unknown): { renewal: string | null; renewalUrgent: boolean } {
  if (typeof due !== "string" || !due.trim()) return { renewal: null, renewalUrgent: false }
  const d = new Date(`${due.trim()}T12:00:00`)
  if (Number.isNaN(d.getTime())) return { renewal: null, renewalUrgent: false }
  const now = new Date()
  const diffDays = Math.ceil((d.getTime() - now.getTime()) / 86400000)
  const renewal = diffDays >= 0 ? `${diffDays}d` : "overdue"
  const renewalUrgent = diffDays >= 0 && diffDays <= 14
  return { renewal, renewalUrgent }
}

function parseActionDetailFromRow(row: Record<string, unknown>): {
  parts: ActionDetailPart[] | null
  legacyDetail: string | null
  legacyHtml: boolean
} {
  const raw =
    row.action_details ?? row.actionDetails ?? row.action_detail ?? row.actionDetail

  if (Array.isArray(raw)) {
    const parts: ActionDetailPart[] = []
    for (const item of raw) {
      if (item == null || typeof item !== "object") continue
      const o = item as Record<string, unknown>
      const text = o.action_detail ?? o.actionDetail
      if (typeof text !== "string" || !text.trim()) continue
      const body = text.trim()
      const flag = o.action_detail_html ?? o.actionDetailHtml ?? o.action_detail_is_html
      const html =
        typeof flag === "boolean" ? flag : /<[^>]+>/.test(body)
      parts.push({ body, html })
    }
    if (parts.length > 0) {
      return { parts, legacyDetail: null, legacyHtml: false }
    }
  }

  if (typeof raw === "string" && raw.trim() !== "") {
    const legacyDetail = raw.trim()
    const flag = row.action_detail_html ?? row.actionDetailHtml ?? row.action_detail_is_html
    const legacyHtml =
      typeof flag === "boolean" ? flag : /<[^>]+>/.test(raw)
    return { parts: null, legacyDetail, legacyHtml }
  }

  return { parts: null, legacyDetail: null, legacyHtml: false }
}

export function mapActionDetailRow(row: Record<string, unknown>): ActionItem | null {
  const tier = normalizeApiTier(row.tier)
  if (!tier) return null

  const id = row.id != null ? String(row.id) : ""
  if (!id) return null

  const apiTier = typeof row.tier === "string" ? row.tier : tier
  const scores = mapContext(row.context)
  const { stage, stageLabel } = inferStageFromRisk(scores.risk ?? null)
  const { renewal, renewalUrgent } = renewalFromDueDate(row.due_date)

  const status = typeof row.status === "string" ? row.status.toLowerCase() : ""
  const completed =
    Boolean(row.completed_at) || status === "done" || status === "completed" || status === "closed"

  const assigned = row.assigned_to
  const owner = typeof assigned === "string" && assigned.trim() ? assigned.trim() : null

  const { parts, legacyDetail, legacyHtml } = parseActionDetailFromRow(row)

  return {
    id,
    tier,
    apiTier,
    company: typeof row.company_name === "string" ? row.company_name : "",
    stage,
    stageLabel,
    renewal,
    renewalUrgent,
    actionType: typeof row.action_type === "string" ? row.action_type : "",
    owner,
    scores,
    whyNow: typeof row.description === "string" ? row.description : "",
    whyNowHtml: false,
    actionDetail: legacyDetail,
    actionDetailHtml: legacyHtml,
    actionDetailParts: parts ?? undefined,
    draftKey: null,
    draftLabel: null,
    promoted: false,
    done: completed,
  }
}

function pickActionDetailList(payload: object): unknown[] | null {
  const p = payload as {
    actionDetails?: unknown
    action_details?: unknown
    actionDetail?: unknown
    action_detail?: unknown
  }
  const list =
    p.actionDetails ??
    p.action_details ??
    p.actionDetail ??
    p.action_detail
  if (!Array.isArray(list) || list.length === 0) return null
  return list
}

/**
 * Maps org Action Centre payload (`actionDetails` preferred, then `actionDetail`, snake_case variants)
 * into `ActionItem[]`, sorted by canonical tier so grouping matches `TIER_SECTION_ORDER`.
 */
export function mapOrgPayloadToActionItems(payload: unknown): ActionItem[] | null {
  if (payload == null || typeof payload !== "object") return null
  const list = pickActionDetailList(payload)
  if (!list) return null

  const tierRank = Object.fromEntries(TIER_SECTION_ORDER.map((t, i) => [t, i])) as Record<
    ActionTier,
    number
  >

  const items: ActionItem[] = []
  for (const row of list) {
    if (row == null || typeof row !== "object") continue
    const mapped = mapActionDetailRow(row as Record<string, unknown>)
    if (mapped) items.push(mapped)
  }
  if (items.length === 0) return null

  items.sort((a, b) => tierRank[a.tier] - tierRank[b.tier])
  return items
}
