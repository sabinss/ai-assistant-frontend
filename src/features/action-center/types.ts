export type ActionTier = "today" | "week" | "month" | "watch"

export type ActionStage = "onb" | "active" | "risk"

export type ScoreLevel = "high" | "med" | "good" | "opp" | "default"

export type ActionDetailPart = {
  body: string
  /** Explicit HTML from API; otherwise inferred from markup in `body`. */
  html?: boolean
}

export type ActionScores = {
  risk?: number | null
  riskLevel?: ScoreLevel
  value?: number | null
  valueLevel?: ScoreLevel
  opp?: number | null
  oppLevel?: ScoreLevel
  /** From API `context.engagement_trend` */
  engagementTrend?: string | null
  /** From API `context.sentiment_trajectory` */
  sentimentTrajectory?: string | null
}

export type ActionItem = {
  id: string
  tier: ActionTier
  /** Raw `tier` from API (e.g. `this_week`) for section headers */
  apiTier?: string
  company: string
  stage: ActionStage
  stageLabel: string
  renewal: string | null
  renewalUrgent: boolean
  actionType: string
  owner: string | null
  scores: ActionScores
  whyNow: string
  /** When false, `whyNow` is plain text (API). Mock rows omit this and render HTML. */
  whyNowHtml?: boolean
  /** From API `action_detail` / `actionDetail` — expanded “View action detail” panel (single string). */
  actionDetail?: string | null
  /** When false, `actionDetail` is plain text. */
  actionDetailHtml?: boolean
  /** From API when `action_detail` / `actionDetail` is an array of `{ action_detail: string, ... }`. */
  actionDetailParts?: ActionDetailPart[]
  draftKey: string | null
  draftLabel: string | null
  promoted: boolean
  tripwire?: string
  done?: boolean
  doneOutcome?: string
}

export type SummaryStat = {
  id: string
  label: string
  count: number
  sub: string
  tier: ActionTier
}

export type ScoringMeta = {
  lastRun: string
  nextRun: string
  scoringWindowDays: number
  todayActionCount: number
}

export type OutcomeOption = { value: string; label: string }

export type ChatMessageItem =
  | {
      id: number
      role: "user" | "agent"
      type: "text"
      time: string
      content: string
    }
  | {
      id: number
      role: "agent"
      type: "draft"
      time: string
      subject: string
      body: string
    }

export type PendingDraft = {
  account: string
  draftType: string
  label: string
}

export type MarkDonePayload = { outcome: string; notes: string }
