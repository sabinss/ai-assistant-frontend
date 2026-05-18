"use client"

import Link from "next/link"
import { useState, useEffect, useCallback } from "react"
import SummaryCards from "./components/actions/SummaryCards"
import TierSection from "./components/actions/TierSection"
import ChatPanel from "./components/chat/ChatPanel"
import DoneModal from "./components/shared/DoneModal"
import Toast from "./components/shared/Toast"
import useAuth from "@/store/user"
import {
  fetchOrganizationActionCenter,
  markActionDone,
  snoozeAction,
  fetchScoringMeta,
} from "./api"
import { PROMOTED_BANNER } from "./data/mockData"
import { mapOrgPayloadToActionItems, TIER_SECTION_ORDER } from "./mapActionDetailFromPayload"
import { buildDraftBestActionChatMessage } from "./buildDraftBestActionChatMessage"
import {
  deriveSummaryStatsFromActions,
  mapOrgPayloadToSummaryStats,
} from "./mapSummaryFromPayload"
import type { ActionItem, ActionTier, MarkDonePayload, PendingDraft, ScoringMeta, SummaryStat } from "./types"

// i need full screen icon
import { Fullscreen } from "lucide-react"

function actionCenterErrorMessage(err: unknown): string {
  if (err && typeof err === "object" && "response" in err) {
    const data = (err as { response?: { data?: { message?: string; error?: string } } }).response?.data
    const msg = data?.message ?? data?.error
    if (typeof msg === "string" && msg.trim()) return msg.trim()
  }
  if (err instanceof Error && err.message.trim()) return err.message.trim()
  return "Something went wrong while loading Action Center."
}

export default function ActionCenterView() {
  const { user_data, access_token, _hasHydrated } = useAuth()
  const [actions, setActions] = useState<ActionItem[]>([])
  const [summaryStats, setSummaryStats] = useState<SummaryStat[]>([])
  const [scoringMeta, setScoringMeta] = useState<ScoringMeta | null>(null)
  const [loading, setLoading] = useState(true)
  const [loadError, setLoadError] = useState<string | null>(null)

  const [modalAction, setModalAction] = useState<ActionItem | null>(null)
  const [pendingDraft, setPendingDraft] = useState<PendingDraft | null>(null)
  const [pendingAccountView, setPendingAccountView] = useState<{ company: string } | null>(null)
  const [pendingDraftBestAction, setPendingDraftBestAction] = useState<{ message: string } | null>(
    null
  )
  const [toast, setToast] = useState("")
  /** `null` = show all tier sections; otherwise only that tier’s `TierSection` is shown. */
  const [summaryTierFilter, setSummaryTierFilter] = useState<ActionTier | null>(null)

  const showToast = useCallback((msg: string) => setToast(msg), [])

  const handleSummaryTierClick = useCallback((tier: ActionTier) => {
    setSummaryTierFilter((prev) => (prev === tier ? null : tier))
  }, [])

  const handleDraftHandled = useCallback(() => setPendingDraft(null), [])
  const handleAccountViewHandled = useCallback(() => setPendingAccountView(null), [])
  const handleDraftBestActionHandled = useCallback(() => setPendingDraftBestAction(null), [])

  const loadActionCenter = useCallback(async () => {
    setLoadError(null)
    const orgId = user_data?.organization?.trim()

    if (!_hasHydrated) {
      return
    }

    if (!orgId || !access_token) {
      setActions([])
      setSummaryStats([])
      setScoringMeta(null)
      setLoadError(
        "Organization or sign-in is required. Check that you are logged in and your profile includes an organization."
      )
      setLoading(false)
      return
    }

    setLoading(true)
    try {
      const orgAcPayload = await fetchOrganizationActionCenter(orgId, access_token)

      if (process.env.NODE_ENV === "development" && orgAcPayload != null) {
        try {
          console.log("[ActionCenterView] org payload\n" + JSON.stringify(orgAcPayload, null, 2))
        } catch {
          console.log("[ActionCenterView] org payload (not JSON-serializable)", orgAcPayload)
        }
      }

      const mappedActions = mapOrgPayloadToActionItems(orgAcPayload) ?? []
      setActions(mappedActions)

      const statsFromPayload = mapOrgPayloadToSummaryStats(orgAcPayload)
      setSummaryStats(statsFromPayload ?? deriveSummaryStatsFromActions(mappedActions))

      try {
        const meta = await fetchScoringMeta()
        setScoringMeta(meta)
      } catch {
        setScoringMeta(null)
      }
    } catch (err: unknown) {
      console.error("[ActionCenterView] fetchOrganizationActionCenter failed", err)
      setActions([])
      setSummaryStats([])
      setScoringMeta(null)
      setLoadError(actionCenterErrorMessage(err))
    } finally {
      setLoading(false)
    }
  }, [_hasHydrated, user_data?.organization, access_token])

  useEffect(() => {
    void loadActionCenter()
  }, [loadActionCenter])

  const actionsByTier = TIER_SECTION_ORDER.reduce<Record<ActionTier, ActionItem[]>>(
    (acc, tier) => {
      acc[tier] = actions.filter((a) => a.tier === tier)
      return acc
    },
    { today: [], week: [], month: [], watch: [] }
  )

  const tiersWithActions = TIER_SECTION_ORDER.filter((t) => actionsByTier[t].length > 0)
  const tierSectionsToShow = summaryTierFilter
    ? tiersWithActions.filter((t) => t === summaryTierFilter)
    : tiersWithActions

  const todayCount =
    summaryStats.find((s) => s.tier === "today")?.count ??
    actions.filter((a) => a.tier === "today" && !a.done).length

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
        s.tier === modalAction.tier ? { ...s, count: Math.max(0, s.count - 1) } : s
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
    setPendingAccountView({ company: action.company })
  }

  function handleDraftBestAction(action: ActionItem) {
    const message = buildDraftBestActionChatMessage(action)
    if (!message.trim()) {
      showToast("No description or action detail to send.")
      return
    }
    setPendingDraftBestAction({ message })
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

  if (loadError) {
    return (
      <div
        style={{
          height: "100%",
          minHeight: 280,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "#F4F6FA",
          fontFamily: "Inter, sans-serif",
          padding: 24,
        }}
      >
        <div
          style={{
            maxWidth: 420,
            width: "100%",
            background: "#fff",
            borderRadius: 12,
            border: "1px solid #E2E6EF",
            boxShadow: "0 4px 24px rgba(26, 31, 46, 0.06)",
            padding: "28px 26px",
            textAlign: "center",
          }}
        >
          <div
            style={{
              width: 44,
              height: 44,
              margin: "0 auto 16px",
              borderRadius: 10,
              background: "#FDF2F2",
              border: "1px solid #F5C6C6",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "#C0392B",
            }}
            aria-hidden
          >
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="10" />
              <path d="M12 8v5M12 16h.01" strokeLinecap="round" />
            </svg>
          </div>
          <div style={{ fontSize: 16, fontWeight: 600, color: "#1A1F2E", marginBottom: 8 }}>
            Couldn’t load Action Center
          </div>
          <div style={{ fontSize: 13, color: "#4A5168", lineHeight: 1.55, marginBottom: 22 }}>
            {loadError}
          </div>
          <button
            type="button"
            onClick={() => void loadActionCenter()}
            style={{
              fontFamily: "inherit",
              fontSize: 13,
              fontWeight: 600,
              color: "#fff",
              background: "#1B3A8C",
              border: "none",
              borderRadius: 8,
              padding: "10px 20px",
              cursor: "pointer",
            }}
          >
            Try again
          </button>
        </div>
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
          <div style={{ fontSize: 15, fontWeight: 600 }}>Intel Briefing</div>
          <div style={{ fontSize: 12, color: "#8B91A3" }}>
            Customer sentiment, engagement, and value signals turned into prioritized actions.
          </div>
        </div>
        <div style={{ marginLeft: "auto", display: "flex", alignItems: "center", gap: 12 }}>

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
            {`${todayCount} account${todayCount !== 1 ? "s" : ""} need${todayCount === 1 ? "s" : ""
              } attention today`}
          </span>

          <Link
            href="/mainapp/action-center/chat"
            style={{
              fontSize: 12,
              fontWeight: 600,
              color: "#1B3A8C",
              textDecoration: "none",
              padding: "5px 12px",
              borderRadius: 8,
              border: "1px solid #C0CCE8",
              background: "#fff",
            }}
          >
            {/* Assistant chat → */}
            <Fullscreen className="w-4 h-4" />
          </Link>


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
          <SummaryCards
            stats={summaryStats}
            selectedTier={summaryTierFilter}
            onTierClick={handleSummaryTierClick}
          />

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

          {tierSectionsToShow.map((tier) => (
            <TierSection
              key={tier}
              tier={tier}
              sectionLabel={actionsByTier[tier][0]?.apiTier}
              actions={actionsByTier[tier]}
              onGetDraft={handleGetDraft}
              onMarkDone={handleMarkDoneClick}
              onViewAccount={handleViewAccount}
              onDraftBestAction={handleDraftBestAction}
              onSnooze={handleSnooze}
            />
          ))}
        </div>

        <ChatPanel
          pendingDraft={pendingDraft}
          onDraftHandled={handleDraftHandled}
          pendingAccountView={pendingAccountView}
          onAccountViewHandled={handleAccountViewHandled}
          pendingDraftBestAction={pendingDraftBestAction}
          onDraftBestActionHandled={handleDraftBestActionHandled}
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
