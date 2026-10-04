"use client"

import { useCallback, useEffect, useMemo, useState } from "react"
import ActivityHeader from "./components/ActivityHeader"
import ChannelTabs from "./components/ChannelTabs"
import ConversationList from "./components/ConversationList"
import ThreadPanel from "./components/ThreadPanel"
import { ASSISTANT_ALERT, CHANNEL_TABS } from "./data/mockData"
import {
  fetchActivityCompanies,
  fetchActivityCompanyById,
} from "./api/activityApi"
import {
  mapActivityCompaniesToConversations,
  matchesConversationSearch,
} from "./mapActivityCompanies"
import { mapActivityMessagesToThread } from "./mapActivityMessages"
import type {
  ActivityCompany,
  ActivityMessage,
  ChannelTab,
  Conversation,
  ConversationFilter,
  Pagination,
} from "./types"
import useAuth from "@/store/user"

export default function ActivityView() {
  const { access_token, _hasHydrated } = useAuth()
  const [activeTab, setActiveTab] = useState<ChannelTab>("texts")
  const [activeFilter, setActiveFilter] = useState<ConversationFilter>("all")
  const [search, setSearch] = useState("")
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [draft, setDraft] = useState("")
  const [showComposer, setShowComposer] = useState(false)

  const [companies, setCompanies] = useState<ActivityCompany[]>([])
  const [companiesPagination, setCompaniesPagination] = useState<Pagination | null>(null)
  const [loading, setLoading] = useState(true)
  const [loadingMoreConversations, setLoadingMoreConversations] = useState(false)
  const [loadError, setLoadError] = useState<string | null>(null)

  const [activityMessages, setActivityMessages] = useState<ActivityMessage[]>([])
  const [messagesPagination, setMessagesPagination] = useState<Pagination | null>(null)
  const [messagesLoading, setMessagesLoading] = useState(false)
  const [loadingMoreMessages, setLoadingMoreMessages] = useState(false)

  const conversations = useMemo(
    () => mapActivityCompaniesToConversations(companies),
    [companies]
  )

  const loadCompanies = useCallback(
    async (page = 1) => {
      if (!_hasHydrated) return
      if (!access_token) {
        setCompanies([])
        setCompaniesPagination(null)
        setLoadError("Sign-in is required to load activity.")
        setLoading(false)
        return
      }

      const isFirstPage = page === 1

      try {
        if (isFirstPage) {
          setLoading(true)
          setLoadError(null)
        } else {
          setLoadingMoreConversations(true)
        }

        const { data, pagination } = await fetchActivityCompanies(access_token, page)
        setCompanies((prev) => (isFirstPage ? data : [...prev, ...data]))
        setCompaniesPagination(pagination)

        if (isFirstPage) {
          const mapped = mapActivityCompaniesToConversations(data)
          setSelectedId((prev) => prev ?? mapped[0]?.id ?? null)
        }
      } catch (err) {
        console.log("Error loading activity companies", err)
        if (isFirstPage) {
          setCompanies([])
          setCompaniesPagination(null)
          setLoadError("Failed to load activity companies.")
        }
      } finally {
        if (isFirstPage) {
          setLoading(false)
        } else {
          setLoadingMoreConversations(false)
        }
      }
    },
    [access_token, _hasHydrated]
  )

  useEffect(() => {
    loadCompanies(1)
  }, [loadCompanies])

  const handleLoadMoreConversations = useCallback(() => {
    if (loading || loadingMoreConversations) return
    if (!companiesPagination?.hasNextPage) return
    const nextPage = companiesPagination.nextPage ?? companiesPagination.currentPage + 1
    loadCompanies(nextPage)
  }, [loadCompanies, companiesPagination, loading, loadingMoreConversations])

  const channelConversations = useMemo(
    () =>
      activeTab === "texts"
        ? conversations
        : conversations.filter((c) => c.channel === activeTab),
    [activeTab, conversations]
  )

  const selectedConversation =
    channelConversations.find((c) => c.id === selectedId) ??
    conversations.find((c) => c.id === selectedId) ??
    null

  const messages = useMemo(
    () =>
      mapActivityMessagesToThread(
        activityMessages,
        selectedConversation?.name
      ),
    [activityMessages, selectedConversation]
  )

  const loadMessages = useCallback(
    async (conversation: Conversation | null, page = 1) => {
      if (!access_token || !conversation?.companyId) {
        setActivityMessages([])
        setMessagesPagination(null)
        return
      }

      const isFirstPage = page === 1

      try {
        if (isFirstPage) {
          setMessagesLoading(true)
        } else {
          setLoadingMoreMessages(true)
        }

        const { data, pagination } = await fetchActivityCompanyById(
          conversation.companyId,
          access_token,
          page
        )
        setActivityMessages((prev) => (isFirstPage ? data : [...prev, ...data]))
        setMessagesPagination(pagination)
      } catch (err) {
        console.log("Error loading activity messages", err)
        if (isFirstPage) {
          setActivityMessages([])
          setMessagesPagination(null)
        }
      } finally {
        if (isFirstPage) {
          setMessagesLoading(false)
        } else {
          setLoadingMoreMessages(false)
        }
      }
    },
    [access_token]
  )

  useEffect(() => {
    loadMessages(selectedConversation, 1)
  }, [loadMessages, selectedConversation])

  const handleLoadMoreMessages = useCallback(() => {
    if (messagesLoading || loadingMoreMessages) return
    if (!messagesPagination?.hasNextPage) return
    const nextPage = messagesPagination.nextPage ?? messagesPagination.currentPage + 1
    loadMessages(selectedConversation, nextPage)
  }, [loadMessages, messagesPagination, messagesLoading, loadingMoreMessages, selectedConversation])

  const filterCounts = useMemo(
    () => ({
      all: channelConversations.length,
      needs_reply: channelConversations.filter((c) => c.status === "needs_reply").length,
      paused: channelConversations.filter((c) => c.status === "paused").length,
    }),
    [channelConversations]
  )

  const filteredConversations = useMemo(() => {
    return channelConversations.filter((conversation) => {
      const matchesFilter =
        activeFilter === "all" ||
        (activeFilter === "needs_reply" && conversation.status === "needs_reply") ||
        (activeFilter === "paused" && conversation.status === "paused")

      return matchesFilter && matchesConversationSearch(conversation, search)
    })
  }, [channelConversations, activeFilter, search])

  const handleTabChange = (tab: ChannelTab) => {
    setActiveTab(tab)
    setActiveFilter("all")
    setSearch("")
    setDraft("")
    setShowComposer(false)
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
              onClick={() => loadCompanies(1)}
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
              hasNextPage={Boolean(companiesPagination?.hasNextPage)}
              loadingMore={loadingMoreConversations}
              onSearchChange={setSearch}
              onFilterChange={setActiveFilter}
              onSelect={(id) => {
                setSelectedId(id)
                setDraft("")
                setShowComposer(false)
              }}
              onLoadMore={handleLoadMoreConversations}
            />
            <ThreadPanel
              conversation={selectedConversation}
              messages={messages}
              messagesLoading={messagesLoading}
              messagesHasNextPage={Boolean(messagesPagination?.hasNextPage)}
              messagesLoadingMore={loadingMoreMessages}
              onLoadMoreMessages={handleLoadMoreMessages}
              alert={selectedConversation ? ASSISTANT_ALERT : null}
              showComposer={showComposer}
              draft={draft}
              onDraftChange={setDraft}
              onSend={() => setDraft("")}
              onTakeOver={() => setShowComposer(true)}
            />
          </>
        )}
      </div>
    </div>
  )
}
