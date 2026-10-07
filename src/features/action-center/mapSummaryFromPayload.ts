import { SUMMARY_STATS } from "./data/mockData"
import type { ActionItem, ActionTier, SummaryStat } from "./types"

/** API keys on `actionStats[i]` → internal tier keys used by `SummaryCards` */
const API_TO_TIER: { apiKey: string; tier: ActionTier }[] = [
  { apiKey: "today", tier: "today" },
  { apiKey: "this_week", tier: "week" },
  { apiKey: "this_month", tier: "month" },
  { apiKey: "watch", tier: "watch" },
]

/**
 * Maps `organization/:org_id/action-center` `actionStats[0]` counts into `SummaryStat[]`,
 * keeping the same labels/subcopy as the default cards (`SUMMARY_STATS`) so layout stays identical.
 */
export function mapActionStatsRowToSummaryStats(
  row: Record<string, unknown> | null | undefined
): SummaryStat[] {
  if (!row || typeof row !== "object") return []

  const templateByTier = Object.fromEntries(
    SUMMARY_STATS.map((s) => [s.tier, s])
  ) as Record<ActionTier, SummaryStat>

  return API_TO_TIER.map(({ apiKey, tier }) => {
    const raw = row[apiKey]
    const count = typeof raw === "number" ? raw : Number(raw ?? 0)
    const t = templateByTier[tier]
    return {
      id: t.id,
      label: t.label,
      sub: t.sub,
      tier: t.tier,
      count: Number.isFinite(count) ? count : 0,
    }
  })
}

/**
 * Reads `actionStats[0]` from the org Action Centre GET payload when present.
 */
export function mapOrgPayloadToSummaryStats(payload: unknown): SummaryStat[] | null {
  if (payload == null || typeof payload !== "object") return null
  const actionStats = (payload as { actionStats?: unknown }).actionStats
  if (!Array.isArray(actionStats) || actionStats.length === 0) return null
  const row = actionStats[0]
  if (row == null || typeof row !== "object") return null
  const stats = mapActionStatsRowToSummaryStats(row as Record<string, unknown>)
  return stats.length > 0 ? stats : null
}

/** Tier counts for summary cards when `actionStats` is absent but actions were mapped (not mock fallback). */
export function deriveSummaryStatsFromActions(actions: ActionItem[]): SummaryStat[] {
  const counts: Record<ActionTier, number> = {
    today: 0,
    week: 0,
    month: 0,
    watch: 0,
  }
  for (const a of actions) {
    if (a.done) continue
    counts[a.tier] += 1
  }
  return SUMMARY_STATS.map((t) => ({
    ...t,
    count: counts[t.tier],
  }))
}
