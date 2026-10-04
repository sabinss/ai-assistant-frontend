"use client"

import { useCallback, useEffect, useMemo, useState } from "react"
import ActivityHeader from "./components/ActivityHeader"
import ChannelTabs from "./components/ChannelTabs"
import ConversationList from "./components/ConversationList"
import ThreadPanel from "./components/ThreadPanel"
import { ASSISTANT_ALERT, CHANNEL_TABS, MOCK_THREAD_MESSAGES } from "./data/mockData"
import {
  fetchActivityCompanies,
  fetchActivityCompanyById,
} from "./api/activityApi"
import { mapActivityCompaniesToConversations } from "./mapActivityCompanies"
import type { ChannelTab, Conversation, ConversationFilter } from "./types"
import useAuth from "@/store/user"

export default function ActivityView() {
  const { access_token, _hasHydrated } = useAuth()
  const [activeTab, setActiveTab] = useState<ChannelTab>("texts")
  const [activeFilter, setActiveFilter] = useState<ConversationFilter>("all")
  const [search, setSearch] = useState("")
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [draft, setDraft] = useState("")
  const [conversations, setConversations] = useState<Conversation[]>([])
  const [loading, setLoading] = useState(true)
  const [loadError, setLoadError] = useState<string | null>(null)

  const loadCompanies = useCallback(async () => {
    if (!_hasHydrated) return
    if (!access_token) {
      setConversations([])
      setLoadError("Sign-in is required to load activity.")
      setLoading(false)
      return
    }

    try {
      setLoading(true)
      setLoadError(null)
      const companies = await fetchActivityCompanies(access_token)
      const mapped = mapActivityCompaniesToConversations(companies)
      setConversations(mapped)
      setSelectedId((prev) => prev ?? mapped[0]?.id ?? null)

      const firstCompanyId = companies.find((c) => c.company_id)?.company_id
      if (firstCompanyId) {
        const companyDetail = await fetchActivityCompanyById(
          firstCompanyId,
          access_token
        )
        console.log("activity company detail response", companyDetail)
      }
    } catch (err) {
      console.log("Error loading activity companies", err)
      setConversations([])
      setLoadError("Failed to load activity companies.")
    } finally {
      setLoading(false)
    }
  }, [access_token, _hasHydrated])

  useEffect(() => {
    loadCompanies()
  }, [loadCompanies])

  const channelConversations = useMemo(
    () =>
      activeTab === "texts"
        ? conversations
        : conversations.filter((c) => c.channel === activeTab),
    [activeTab, conversations]
  )

  const filterCounts = useMemo(
    () => ({
      all: channelConversations.length,
      needs_reply: channelConversations.filter((c) => c.status === "needs_reply").length,
      paused: channelConversations.filter((c) => c.status === "paused").length,
    }),
    [channelConversations]
  )

  const filteredConversations = useMemo(() => {
    const query = search.trim().toLowerCase()
    return channelConversations.filter((conversation) => {
      const matchesFilter =
        activeFilter === "all" ||
        (activeFilter === "needs_reply" && conversation.status === "needs_reply") ||
        (activeFilter === "paused" && conversation.status === "paused")

      const matchesSearch =
        !query ||
        conversation.name.toLowerCase().includes(query) ||
        conversation.phone.toLowerCase().includes(query)

      return matchesFilter && matchesSearch
    })
  }, [channelConversations, activeFilter, search])

  const selectedConversation =
    filteredConversations.find((c) => c.id === selectedId) ??
    channelConversations.find((c) => c.id === selectedId) ??
    null

  const messages = selectedConversation
    ? MOCK_THREAD_MESSAGES[selectedConversation.id] ?? []
    : []

  const showAlert =
    selectedConversation?.status === "needs_reply" ? ASSISTANT_ALERT : null

  const handleTabChange = (tab: ChannelTab) => {
    setActiveTab(tab)
    setActiveFilter("all")
    setSearch("")
    setDraft("")
  }

  return (
    <div className="flex h-[min(100dvh,calc(100vh-80px))] min-h-0 w-full min-w-0 flex-col gap-4 overflow-hidden">
      <ActivityHeader />
      <ChannelTabs tabs={CHANNEL_TABS} activeTab={activeTab} onChange={handleTabChange} />

      <div className="flex min-h-0 flex-1 overflow-hidden rounded-lg border border-[#E2E6EF] bg-white">
        {loading ? (
          <div className="flex flex-1 items-center justify-center text-[14px] text-[#8A93A6]">
            Loading activity...
          </div>
        ) : loadError ? (
          <div className="flex flex-1 flex-col items-center justify-center gap-3 px-4 text-center">
            <p className="text-[14px] text-[#C0392B]">{loadError}</p>
            <button
              type="button"
              onClick={loadCompanies}
              className="rounded-md bg-[#1B3A8C] px-3 py-1.5 text-[13px] font-medium text-white"
            >
              Retry
            </button>
          </div>
        ) : (
          <>
            <ConversationList
              conversations={filteredConversations}
              selectedId={selectedId}
              search={search}
              activeFilter={activeFilter}
              filterCounts={filterCounts}
              onSearchChange={setSearch}
              onFilterChange={setActiveFilter}
              onSelect={(id) => {
                setSelectedId(id)
                setDraft("")
              }}
            />
            <ThreadPanel
              conversation={selectedConversation}
              messages={messages}
              alert={showAlert}
              draft={draft}
              onDraftChange={setDraft}
              onSend={() => setDraft("")}
            />
          </>
        )}
      </div>
    </div>
  )
}
