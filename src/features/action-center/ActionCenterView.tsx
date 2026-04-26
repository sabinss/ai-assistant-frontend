"use client"

import { useState, useEffect, useCallback } from "react"
import SummaryCards from "./components/actions/SummaryCards"
import TierSection from "./components/actions/TierSection"
import ChatPanel from "./components/chat/ChatPanel"
import DoneModal from "./components/shared/DoneModal"
import Toast from "./components/shared/Toast"
import { fetchActions, fetchSummaryStats, markActionDone, snoozeAction, fetchScoringMeta } from "./api"
import { PROMOTED_BANNER } from "./data/mockData"
import type { ActionItem, ActionTier, MarkDonePayload, PendingDraft, ScoringMeta, SummaryStat } from "./types"

const TIERS: ActionTier[] = ["today", "week", "month", "watch"]

export default function ActionCenterView() {
  const [actions, setActions] = useState<ActionItem[]>([])
  const [summaryStats, setSummaryStats] = useState<SummaryStat[]>([])
  const [scoringMeta, setScoringMeta] = useState<ScoringMeta | null>(null)
  const [loading, setLoading] = useState(true)

  const [modalAction, setModalAction] = useState<ActionItem | null>(null)
  const [pendingDraft, setPendingDraft] = useState<PendingDraft | null>(null)
  const [toast, setToast] = useState("")

  const showToast = useCallback((msg: string) => setToast(msg), [])

  const handleDraftHandled = useCallback(() => setPendingDraft(null), [])

  useEffect(() => {
    async function load() {
      const [acts, stats, meta] = await Promise.all([
        fetchActions(),
        fetchSummaryStats(),
        fetchScoringMeta(),
      ])
      setActions(acts)
      setSummaryStats(stats)
      setScoringMeta(meta)
      setLoading(false)
    }
    void load()
  }, [])

  const actionsByTier = TIERS.reduce<Record<ActionTier, ActionItem[]>>(
    (acc, tier) => {
      acc[tier] = actions.filter((a) => a.tier === tier)
      return acc
    },
    { today: [], week: [], month: [], watch: [] }
  )

  const todayCount = actions.filter((a) => a.tier === "today" && !a.done).length

  function handleGetDraft(action: ActionItem) {
    if (!action.draftKey) return
    const [account, ...rest] = action.draftKey.split("-")
    const draftType = rest.join("-")
    setPendingDraft({
      account,
      draftType,
      label: `${action.company} / ${action.actionType}`,
    })
  }

  function handleMarkDoneClick(action: ActionItem) {
    setModalAction(action)
  }

  async function handleSaveDone({ outcome, notes }: MarkDonePayload) {
    if (!modalAction) return
    await markActionDone(modalAction.id, outcome, notes)
    const outcomeLabel = outcome.split("—")[0].trim()
    setActions((prev) =>
      prev.map((a) =>
        a.id === modalAction.id ? { ...a, done: true, doneOutcome: outcomeLabel } : a
      )
    )
    setSummaryStats((prev) =>
      prev.map((s) =>
        s.id === "today" ? { ...s, count: Math.max(0, s.count - 1) } : s
      )
    )
    setModalAction(null)
    showToast("Action saved and closed")
  }

  async function handleSnooze(action: ActionItem) {
    await snoozeAction(action.id, 24)
    showToast("Snoozed 24 hours")
  }

  function handleViewAccount(action: ActionItem) {
    showToast(`Account view: ${action.company}`)
  }

  if (loading) {
    return (
      <div
        style={{
          height: "100%",
          minHeight: 240,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "#F4F6FA",
          fontFamily: "Inter, sans-serif",
          color: "#8B91A3",
          fontSize: 13,
        }}
      >
        Loading…
      </div>
    )
  }

  return (
    <div
      style={{
        fontFamily: "Inter, sans-serif",
        background: "#F4F6FA",
        color: "#1A1F2E",
        height: "100%",
        minHeight: 0,
        overflow: "hidden",
        display: "flex",
        flexDirection: "column",
        borderRadius: 8,
      }}
    >
      <div
        style={{
          background: "#fff",
          borderBottom: "1px solid #E2E6EF",
          padding: "11px 24px",
          display: "flex",
          alignItems: "center",
          gap: 16,
          flexShrink: 0,
        }}
      >
        <div>
          <div style={{ fontSize: 15, fontWeight: 600 }}>Action Centre</div>
          <div style={{ fontSize: 12, color: "#8B91A3" }}>
            Scored weekly · Last run {scoringMeta?.lastRun}
          </div>
        </div>
        <div style={{ marginLeft: "auto" }}>
          <span
            style={{
              background: "#E8EDF8",
              color: "#1B3A8C",
              fontSize: 12,
              fontWeight: 500,
              padding: "5px 14px",
              borderRadius: 99,
            }}
          >
            {`${todayCount} account${todayCount !== 1 ? "s" : ""} need${
              todayCount === 1 ? "s" : ""
            } attention today`}
          </span>
        </div>
      </div>

      <div style={{ flex: 1, display: "flex", overflow: "hidden", minHeight: 0 }}>
        <div
          style={{
            flex: 1,
            overflowY: "auto",
            padding: "18px 22px",
            minWidth: 0,
          }}
        >
          <SummaryCards stats={summaryStats} />

          <div
            style={{
              background: "#E8EDF8",
              border: "1px solid #C0CCE8",
              borderRadius: 8,
              padding: "8px 14px",
              marginBottom: 16,
              fontSize: 12.5,
              color: "#1B3A8C",
              display: "flex",
              alignItems: "center",
              gap: 8,
            }}
          >
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#1B3A8C" strokeWidth="2">
              <polyline points="23 6 13.5 15.5 8.5 10.5 1 18" />
              <polyline points="17 6 23 6 23 12" />
            </svg>
            {PROMOTED_BANNER.message}
          </div>

          {TIERS.map((tier) => (
            <TierSection
              key={tier}
              tier={tier}
              actions={actionsByTier[tier]}
              onGetDraft={handleGetDraft}
              onMarkDone={handleMarkDoneClick}
              onViewAccount={handleViewAccount}
              onSnooze={handleSnooze}
            />
          ))}
        </div>

        <ChatPanel
          pendingDraft={pendingDraft}
          onDraftHandled={handleDraftHandled}
          onToast={showToast}
        />
      </div>

      <DoneModal
        action={modalAction}
        onSave={handleSaveDone}
        onCancel={() => setModalAction(null)}
      />
      <Toast message={toast} onDismiss={() => setToast("")} />
    </div>
  )
}
