export type ActionTier = "today" | "week" | "month" | "watch"

export type ActionStage = "onb" | "active" | "risk"

export type ScoreLevel = "high" | "med" | "good" | "opp" | "default"

export type ActionScores = {
  risk?: number | null
  riskLevel?: ScoreLevel
  value?: number | null
  valueLevel?: ScoreLevel
  opp?: number | null
  oppLevel?: ScoreLevel
}

export type ActionItem = {
  id: string
  tier: ActionTier
  company: string
  stage: ActionStage
  stageLabel: string
  renewal: string | null
  renewalUrgent: boolean
  actionType: string
  owner: string | null
  scores: ActionScores
  whyNow: string
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
