"use client"

import { useState, type CSSProperties, type ReactNode } from "react"
import Badge from "../shared/Badge"
import type { ActionDetailPart, ActionItem, ActionTier, ScoreLevel } from "../../types"
import { IoDocumentTextOutline } from "react-icons/io5"
import { IoIosArrowDropdown } from "react-icons/io"

const TIER_LEFT_COLORS: Record<ActionTier, string> = {
  today: "#C0392B",
  week: "#D4A017",
  month: "#2E8B57",
  watch: "#1B3A8C",
}

/** Matches section pill colours so the card tier matches `TierSection` / grouping */
const TIER_BADGE_PILL: Record<ActionTier, CSSProperties> = {
  today: { background: "#FDF2F2", color: "#C0392B", border: "1px solid #F5C6C6" },
  week: { background: "#FFFBF0", color: "#7D5A00", border: "1px solid #F0E0A0" },
  month: { background: "#F0F9F4", color: "#1A5C3A", border: "1px solid #B8DFC8" },
  watch: { background: "#F0F4FB", color: "#2C4A7A", border: "1px solid #C0CDE8" },
}

function actionDetailPartUsesHtml(part: ActionDetailPart): boolean {
  return (
    part.html === true ||
    (part.html !== false && typeof part.body === "string" && /<[^>]+>/.test(part.body))
  )
}

function tierBadgeLabel(action: ActionItem): string {
  const raw = action.apiTier?.trim()
  /** Same as `TierSection` pill: uppercase API key (e.g. `this_week` → THIS_WEEK) */
  if (raw) return raw.replace(/-/g, "_").toUpperCase()
  const fallback: Record<ActionTier, string> = {
    today: "TODAY",
    week: "THIS WEEK",
    month: "THIS MONTH",
    watch: "WATCH",
  }
  return fallback[action.tier]
}

const SCORE_CHIP_STYLES: Record<string, CSSProperties> = {
  high: { background: "#FDF2F2", color: "#C0392B", border: "1px solid #F5C6C6" },
  med: { background: "#FFFBF0", color: "#7D5A00", border: "1px solid #F0E0A0" },
  good: { background: "#F0F9F4", color: "#1A5C3A", border: "1px solid #B8DFC8" },
  opp: { background: "#E8EDF8", color: "#1B3A8C", border: "1px solid #C0CDE8" },
  default: { background: "#F2F4F8", color: "#4A5168", border: "1px solid #E2E6EF" },
}

function levelFromUnitRisk(r: number): ScoreLevel {
  if (r >= 0.65) return "high"
  if (r >= 0.35) return "med"
  return "good"
}

function levelFromPctRisk(r: number): ScoreLevel {
  if (r >= 65) return "high"
  if (r >= 35) return "med"
  return "good"
}

function levelFromUnitValue(v: number): ScoreLevel {
  if (v >= 0.55) return "good"
  if (v >= 0.35) return "med"
  return "high"
}

function levelFromPctValue(v: number): ScoreLevel {
  if (v >= 55) return "good"
  if (v >= 35) return "med"
  return "high"
}

function levelFromUnitOpp(o: number): ScoreLevel {
  return o >= 0.45 ? "opp" : "default"
}

function levelFromPctOpp(o: number): ScoreLevel {
  return o >= 45 ? "opp" : "default"
}

function ScoreChip({ label, level }: { label: string; level: ScoreLevel | "default" }) {
  const style = SCORE_CHIP_STYLES[level] || SCORE_CHIP_STYLES.default
  return (
    <span
      style={{
        fontSize: 11,
        fontFamily: "monospace",
        padding: "2px 8px",
        borderRadius: 4,
        fontWeight: 500,
        ...style,
      }}
    >
      {label}
    </span>
  )
}

function Btn({
  onClick,
  color,
  hoverBg,
  borderColor,
  children,
}: {
  onClick: () => void
  color: string
  hoverBg?: string
  borderColor?: string
  children: ReactNode
}) {
  const [hovered, setHovered] = useState(false)
  return (
    <button
      type="button"
      onClick={onClick}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        fontFamily: "inherit",
        fontSize: 12,
        fontWeight: 500,
        padding: "6px 13px",
        borderRadius: 6,
        cursor: "pointer",
        display: "flex",
        alignItems: "center",
        gap: 5,
        border: `1px solid ${borderColor || color}`,
        color,
        background: hovered ? hoverBg || "#F2F5FC" : "#fff",
        transition: "background 0.12s",
      }}
    >
      {children}
    </button>
  )
}

type ActionCardProps = {
  action: ActionItem
  onGetDraft: (action: ActionItem) => void
  onMarkDone: (action: ActionItem) => void
  onViewAccount: (action: ActionItem) => void
  onDraftBestAction: (action: ActionItem) => void
  onSnooze: (action: ActionItem) => void
}

export default function ActionCard({
  action,
  onGetDraft,
  onMarkDone,
  onViewAccount,
  onDraftBestAction,
  onSnooze,
}: ActionCardProps) {
  const [hovered, setHovered] = useState(false)
  const [detailExpanded, setDetailExpanded] = useState(false)
  const tierColor = TIER_LEFT_COLORS[action.tier]
  const isDone = action.done
  const hasActionDetail =
    (action.actionDetailParts?.length ?? 0) > 0 || Boolean(action.actionDetail?.trim())
  const legacyDetailUsesHtml =
    action.actionDetailHtml === true ||
    (action.actionDetailHtml !== false &&
      typeof action.actionDetail === "string" &&
      /<[^>]+>/.test(action.actionDetail))

  const chips: { label: string; level: ScoreLevel | "default" }[] = []
  const { risk, riskLevel, value, valueLevel, opp, oppLevel, engagementTrend, sentimentTrajectory } =
    action.scores

  if (risk != null) {
    const isUnit = risk >= 0 && risk <= 1
    const label = isUnit ? `Risk ${Math.round(risk * 100)}%` : `Risk ${risk}`
    const level = riskLevel ?? (isUnit ? levelFromUnitRisk(risk) : levelFromPctRisk(risk))
    chips.push({ label, level })
  }
  if (value != null) {
    const isUnit = value >= 0 && value <= 1
    const label = isUnit ? `Value ${Math.round(value * 100)}%` : `Value ${value}`
    const level = valueLevel ?? (isUnit ? levelFromUnitValue(value) : levelFromPctValue(value))
    chips.push({ label, level })
  }
  if (opp != null) {
    const isUnit = opp >= 0 && opp <= 1
    const label = isUnit ? `Opp ${Math.round(opp * 100)}%` : `Opp ${opp}`
    const level = oppLevel ?? (isUnit ? levelFromUnitOpp(opp) : levelFromPctOpp(opp))
    chips.push({ label, level })
  } else if (
    risk != null &&
    engagementTrend == null &&
    sentimentTrajectory == null
  ) {
    chips.push({ label: "Opp —", level: "default" })
  }

  if (engagementTrend)
    chips.push({ label: `Engagement ${engagementTrend}`, level: "default" })
  if (sentimentTrajectory)
    chips.push({ label: `Sentiment ${sentimentTrajectory}`, level: "default" })

  return (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        background: "#fff",
        border: `1px solid ${hovered && !isDone ? "#CDD3E0" : "#E2E6EF"}`,
        borderLeft: `3px solid ${tierColor}`,
        borderRadius: 10,
        padding: 15,
        marginBottom: 8,
        boxShadow: hovered && !isDone ? "0 2px 8px rgba(0,0,0,0.05)" : "none",
        transition: "border-color 0.15s, box-shadow 0.15s",
        opacity: isDone ? 0.45 : action.tier === "watch" ? 0.7 : 1,
      }}
    >
      <div style={{ display: "flex", alignItems: "flex-start", gap: 12, marginBottom: 8 }}>
        <div style={{ flex: 1 }}>
          <div
            style={{
              fontSize: 14,
              fontWeight: 600,
              color: "#1A1F2E",
              marginBottom: 3,
              display: "flex",
              alignItems: "center",
              gap: 6,
              flexWrap: "wrap",
            }}
          >
            {action.company}
            <span
              style={{
                fontSize: 10,
                fontWeight: 600,
                letterSpacing: "0.05em",
                padding: "2px 8px",
                borderRadius: 4,
                whiteSpace: "nowrap",
                ...TIER_BADGE_PILL[action.tier],
              }}
            >
              {tierBadgeLabel(action)}
            </span>
            <Badge variant={`stage-${action.stage}`}>{action.stageLabel}</Badge>
            {action.renewal && (
              <Badge variant={action.renewalUrgent ? "renewal-urgent" : "renewal"}>
                Renewal {action.renewal}
              </Badge>
            )}
            {action.promoted && <Badge variant="new-badge">Promoted</Badge>}
          </div>
          <div style={{ fontSize: 12.5, color: "#4A5168", fontWeight: 500 }}>{action.actionType}</div>
        </div>
        {action.owner && <Badge variant="owner">{action.owner}</Badge>}
      </div>

      {chips.length > 0 && (
        <div style={{ display: "flex", gap: 6, marginBottom: 10, flexWrap: "wrap" }}>
          {chips.map((c, i) => (
            <ScoreChip key={i} label={c.label} level={c.level} />
          ))}
        </div>
      )}

      {action.whyNowHtml === false ? (
        <div
          style={{
            fontSize: 12.5,
            color: "#4A5168",
            lineHeight: 1.6,
            marginBottom: hasActionDetail ? 10 : 12,
            padding: "10px 12px",
            background: "#F4F6FA",
            borderRadius: 8,
            border: "1px solid #E2E6EF",
            whiteSpace: "pre-wrap",
          }}
        >
          {action.whyNow}
        </div>
      ) : (
        <div
          style={{
            fontSize: 12.5,
            color: "#4A5168",
            lineHeight: 1.6,
            marginBottom: hasActionDetail ? 10 : 12,
            padding: "10px 12px",
            background: "#F4F6FA",
            borderRadius: 8,
            border: "1px solid #E2E6EF",
          }}
          dangerouslySetInnerHTML={{ __html: action.whyNow }}
        />
      )}

      {hasActionDetail && (
        <>
          <button
            type="button"
            onClick={() => setDetailExpanded((v) => !v)}
            aria-expanded={detailExpanded}
            style={{
              width: "100%",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              gap: 12,
              marginBottom: detailExpanded ? 10 : 12,
              padding: "10px 12px",
              borderRadius: 8,
              border: `1px solid ${hovered && !isDone ? "#CDD3E0" : "#E2E6EF"}`,
              background: detailExpanded ? "#F4F6FA" : "#fff",
              cursor: "pointer",
              fontFamily: "inherit",
              textAlign: "left",
              transition: "background 0.15s, border-color 0.15s",
            }}
          >
            <span
              style={{
                display: "flex",
                alignItems: "center",
                gap: 10,
                flex: 1,
                minWidth: 0,
              }}
            >
              <span
                aria-hidden
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  flexShrink: 0,
                  width: 36,
                  height: 36,
                  borderRadius: 8,
                  background: `${tierColor}14`,
                  border: `1px solid ${tierColor}33`,
                  color: tierColor,
                }}
              >
                <IoDocumentTextOutline size={20} strokeWidth={1.75} />
              </span>
              <span
                style={{
                  fontSize: 12.5,
                  fontWeight: 600,
                  color: "#1A1F2E",
                  letterSpacing: "-0.01em",
                }}
              >
                View action detail
              </span>
            </span>
            <span
              aria-hidden
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                flexShrink: 0,
                width: 28,
                height: 28,
                borderRadius: 6,
                background: "#fff",
                border: "1px solid #E2E6EF",
                color: tierColor,
                transition: "transform 0.2s ease",
                transform: detailExpanded ? "rotate(0deg)" : "rotate(-90deg)",
              }}
            >
              <IoIosArrowDropdown size={18} />
            </span>
          </button>

          {detailExpanded &&
            ((action.actionDetailParts?.length ?? 0) > 0 ? (
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: 10,
                  marginBottom: 12,
                }}
              >
                {(action.actionDetailParts ?? []).map((part, i) => (
                  <div
                    key={i}
                    style={{
                      fontSize: 12.5,
                      color: "#4A5168",
                      lineHeight: 1.6,
                      padding: "10px 12px",
                      background: "#fff",
                      borderRadius: 8,
                      border: "1px solid #E2E6EF",
                      borderLeft: `3px solid ${tierColor}`,
                    }}
                  >
                    {actionDetailPartUsesHtml(part) ? (
                      <div dangerouslySetInnerHTML={{ __html: part.body }} />
                    ) : (
                      <div style={{ whiteSpace: "pre-wrap" }}>{part.body}</div>
                    )}
                  </div>
                ))}
              </div>
            ) : action.actionDetail?.trim() ? (
              !legacyDetailUsesHtml ? (
                <div
                  style={{
                    fontSize: 12.5,
                    color: "#4A5168",
                    lineHeight: 1.6,
                    marginBottom: 12,
                    padding: "10px 12px",
                    background: "#fff",
                    borderRadius: 8,
                    border: "1px solid #E2E6EF",
                    borderLeft: `3px solid ${tierColor}`,
                    whiteSpace: "pre-wrap",
                  }}
                >
                  {action.actionDetail}
                </div>
              ) : (
                <div
                  style={{
                    fontSize: 12.5,
                    color: "#4A5168",
                    lineHeight: 1.6,
                    marginBottom: 12,
                    padding: "10px 12px",
                    background: "#fff",
                    borderRadius: 8,
                    border: "1px solid #E2E6EF",
                    borderLeft: `3px solid ${tierColor}`,
                  }}
                  dangerouslySetInnerHTML={{ __html: action.actionDetail ?? "" }}
                />
              )
            ) : null)}
        </>
      )}

      {isDone ? (
        <div style={{ fontSize: 12, color: "#2E7D52", display: "flex", alignItems: "center", gap: 5 }}>
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <polyline points="20 6 9 17 4 12" />
          </svg>
          Done · {action.doneOutcome}
        </div>
      ) : (
        <div style={{ display: "flex", gap: 7, alignItems: "center", flexWrap: "wrap" }}>
          {action.draftKey && (
            <Btn onClick={() => onGetDraft(action)} color="#1B3A8C" hoverBg="#E8EDF8">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M12 20h9M16.5 3.5a2.121 2.121 0 013 3L7 19l-4 1 1-4z" />
              </svg>
              {action.draftLabel || "Get Draft"}
            </Btn>
          )}
          {action.tier !== "watch" && (
            <Btn
              onClick={() => onMarkDone(action)}
              color="#2E7D52"
              hoverBg="#F0F9F4"
              borderColor="#2E7D52"
            >
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <polyline points="20 6 9 17 4 12" />
              </svg>
              Mark Done
            </Btn>
          )}
          <Btn onClick={() => onViewAccount(action)} color="#4A5168" hoverBg="#F4F6FA" borderColor="#CDD3E0">
            View Accounts
          </Btn>
          <Btn
            onClick={() => onDraftBestAction(action)}
            color="#1B3A8C"
            hoverBg="#E8EDF8"
            borderColor="#C0CCE8"
          >
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M12 20h9M16.5 3.5a2.121 2.121 0 013 3L7 19l-4 1 1-4z" />
            </svg>
            Draft Best Action
          </Btn>
          {action.tier === "today" && (
            <button
              type="button"
              onClick={() => onSnooze(action)}
              style={{
                background: "transparent",
                color: "#8B91A3",
                border: "1px solid transparent",
                fontSize: 11.5,
                padding: "6px 13px",
                borderRadius: 6,
                cursor: "pointer",
                fontFamily: "inherit",
                marginLeft: "auto",
              }}
            >
              Snooze
            </button>
          )}
          {action.tripwire && (
            <span style={{ fontSize: 11, color: "#8B91A3", marginLeft: 6 }}>{action.tripwire}</span>
          )}
        </div>
      )}
    </div>
  )
}
