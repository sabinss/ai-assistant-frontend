import { useState, useEffect, useCallback } from "react"

// Layout
import Header from "./components/layout/Header"
import Sidebar from "./components/layout/Sidebar"

// Actions
import SummaryCards from "./components/actions/SummaryCards"
import TierSection from "./components/actions/TierSection"

// Chat
import ChatPanel from "./components/chat/ChatPanel"

// Shared
import DoneModal from "./components/shared/Modal"
import Toast from "./components/shared/Toast"

// API
import { fetchActions, fetchSummaryStats, markActionDone, snoozeAction } from "./api/actionApi"
import { fetchScoringMeta } from "./api/scoringApi"

// Data
import { CURRENT_USER, PROMOTED_BANNER } from "./data/mockData"

const TIERS = ["today", "week", "month", "watch"]

export default function App() {
  // ── State ──────────────────────────────────────
  const [actions, setActions] = useState([])
  const [summaryStats, setSummaryStats] = useState([])
  const [scoringMeta, setScoringMeta] = useState(null)
  const [loading, setLoading] = useState(true)

  const [modalAction, setModalAction] = useState(null) // action being marked done
  const [pendingDraft, setPendingDraft] = useState(null) // draft request routed to chat
  const [toast, setToast] = useState("")

  // ── Data loading ───────────────────────────────
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
    load()
  }, [])

  // ── Derived ────────────────────────────────────
  const actionsByTier = TIERS.reduce((acc, tier) => {
    acc[tier] = actions.filter((a) => a.tier === tier)
    return acc
  }, {})

  const todayCount = actions.filter((a) => a.tier === "today" && !a.done).length

  // ── Handlers ───────────────────────────────────
  const showToast = useCallback((msg) => setToast(msg), [])

  function handleGetDraft(action) {
    // Extract account key and draft type from draftKey e.g. 'northgate-champion'
    const [account, ...rest] = action.draftKey.split("-")
    const draftType = rest.join("-")
    setPendingDraft({ account, draftType, label: `${action.company} / ${action.actionType}` })
  }

  function handleMarkDone(action) {
    setModalAction(action)
  }

  async function handleSaveDone({ outcome, notes }) {
    if (!modalAction) return
    await markActionDone(modalAction.id, outcome, notes)
    const outcomeLabel = outcome.split("—")[0].trim()
    setActions((prev) =>
      prev.map((a) =>
        a.id === modalAction.id ? { ...a, done: true, doneOutcome: outcomeLabel } : a
      )
    )
    setSummaryStats((prev) =>
      prev.map((s) => (s.id === "today" ? { ...s, count: Math.max(0, s.count - 1) } : s))
    )
    setModalAction(null)
    showToast("Action saved and closed")
  }

  async function handleSnooze(action) {
    await snoozeAction(action.id, 24)
    showToast("Snoozed 24 hours")
  }

  function handleViewAccount(action) {
    showToast(`Account view: ${action.company}`)
  }

  // ── Render ─────────────────────────────────────
  if (loading) {
    return (
      <div
        style={{
          height: "100vh",
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
        height: "100vh",
        overflow: "hidden",
        display: "flex",
        flexDirection: "column",
      }}
    >
      <Header user={CURRENT_USER} />

      <div style={{ flex: 1, display: "flex", overflow: "hidden" }}>
        <Sidebar onNav={showToast} onToast={showToast} />

        {/* Main */}
        <div style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden" }}>
          {/* Page header */}
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
              <div style={{ fontSize: 15, fontWeight: 600 }}>Customer Intelligence Briefing</div>
              <div style={{ fontSize: 12, color: "#8B91A3" }}>
                Customer sentiment, engagement, and value signals turned into prioritized actions.
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
                {todayCount} account{todayCount !== 1 ? "s" : ""} need{todayCount === 1 ? "s" : ""}{" "}
                attention today
              </span>
            </div>
          </div>

          {/* Content */}
          <div style={{ flex: 1, display: "flex", overflow: "hidden" }}>
            {/* Action list */}
            <div style={{ flex: 1, overflowY: "auto", padding: "18px 22px" }}>
              <SummaryCards stats={summaryStats} />

              {/* Promoted banner */}
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
                <svg
                  width="13"
                  height="13"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="#1B3A8C"
                  strokeWidth="2"
                >
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
                  onMarkDone={handleMarkDone}
                  onViewAccount={handleViewAccount}
                  onSnooze={handleSnooze}
                  onToast={showToast}
                />
              ))}
            </div>

            {/* Chat */}
            <ChatPanel
              pendingDraft={pendingDraft}
              onDraftHandled={() => setPendingDraft(null)}
              onToast={showToast}
            />
          </div>
        </div>
      </div>

      {/* Overlays */}
      <DoneModal
        action={modalAction}
        onSave={handleSaveDone}
        onCancel={() => setModalAction(null)}
      />
      <Toast message={toast} onDismiss={() => setToast("")} />
    </div>
  )
}
