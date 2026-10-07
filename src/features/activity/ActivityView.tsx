"use client"

import { useCallback, useEffect, useMemo, useRef, useState } from "react"
import { toast } from "react-toastify"
import ActivityHeader from "./components/ActivityHeader"
import ChannelTabs from "./components/ChannelTabs"
import ConversationList from "./components/ConversationList"
import ThreadPanel from "./components/ThreadPanel"
import { ASSISTANT_ALERT, CHANNEL_TABS } from "./data/mockData"
import {
  archiveActivityCompany,
  fetchActivityCompanies,
  fetchActivityCompanyById,
  fetchActivityCounts,
  sendActivityMessage,
} from "./api/activityApi"
import {
  mapActivityCompaniesToConversations,
  matchesConversationSearch,
} from "./mapActivityCompanies"
import { mapActivityMessagesToThread } from "./mapActivityMessages"
import type {
  ActivityFilterCounts,
  ActivityPagination,
  ChannelTab,
  Conversation,
  ConversationFilter,
  ThreadMessage,
} from "./types"
import useAuth from "@/store/user"

const EMPTY_FILTER_COUNTS: ActivityFilterCounts = {
  all: 0,
  received: 0,
  needs_reply: 0,
  paused: 0,
}

export default function ActivityView() {
  const { access_token, user_data, _hasHydrated } = useAuth()
  const [activeTab, setActiveTab] = useState<ChannelTab>("texts")
  const [activeFilter, setActiveFilter] = useState<ConversationFilter>("all")
  const [search, setSearch] = useState("")
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [draft, setDraft] = useState("")
  const [showComposer, setShowComposer] = useState(false)
  const [isArchiving, setIsArchiving] = useState(false)
  const [isSending, setIsSending] = useState(false)
  const [conversations, setConversations] = useState<Conversation[]>([])
  const [messages, setMessages] = useState<ThreadMessage[]>([])
  const [loading, setLoading] = useState(true)
  const [messagesLoading, setMessagesLoading] = useState(false)
  const [loadError, setLoadError] = useState<string | null>(null)
  const [filterCounts, setFilterCounts] =
    useState<ActivityFilterCounts>(EMPTY_FILTER_COUNTS)

  const [page, setPage] = useState(1)
  const limit = 20
  const [pagination, setPagination] = useState<ActivityPagination | null>(null)
  const [isFetching, setIsFetching] = useState(false)
  const requestIdRef = useRef(0)
  const abortRef = useRef<AbortController | null>(null)

  const loadFilterCounts = useCallback(async () => {
    if (!_hasHydrated || !access_token) {
      setFilterCounts(EMPTY_FILTER_COUNTS)
      return
    }
    try {
      const counts = await fetchActivityCounts(access_token)
      setFilterCounts(counts)
    } catch (err) {
      console.log("Error loading activity counts", err)
    }
  }, [access_token, _hasHydrated])

  const loadCompanies = useCallback(async () => {
    if (!_hasHydrated) return
    if (!access_token) {
      setConversations([])
      setFilterCounts(EMPTY_FILTER_COUNTS)
      setLoadError("Sign-in is required to load activity.")
      setLoading(false)
      return
    }

    abortRef.current?.abort()
    const controller = new AbortController()
    abortRef.current = controller
    const requestId = ++requestIdRef.current
    const isStale = () => requestId !== requestIdRef.current

    try {
      setIsFetching(true)
      setLoadError(null)
      const result = await fetchActivityCompanies(
        { page, limit },
        access_token,
        controller.signal
      )
      if (isStale()) return

      const { totalPages } = result.pagination
      const lastPage = Math.max(totalPages, 1)
      if (page > lastPage) {
        // Page no longer exists (e.g. after archive); clamp and refetch.
        setPage(lastPage)
        return
      }

      const mapped = mapActivityCompaniesToConversations(result.data)
      setPagination(result.pagination)
      if (page > 1) {
        // Infinite scroll: append the next page, skipping duplicates.
        setConversations((prev) => {
          const seen = new Set(prev.map((c) => c.id))
          return [...prev, ...mapped.filter((c) => !seen.has(c.id))]
        })
      } else {
        setConversations(mapped)
        setSelectedId((prev) =>
          prev && mapped.some((c) => c.id === prev) ? prev : mapped[0]?.id ?? null
        )
      }
      setLoading(false)
      setIsFetching(false)
    } catch (err: any) {
      if (isStale() || err?.code === "ERR_CANCELED") return
      console.log("Error loading activity companies", err)
      setConversations([])
      setPagination(null)
      setLoadError(
        err?.response?.data?.message || "Failed to load activity companies."
      )
      setLoading(false)
      setIsFetching(false)
    }
  }, [access_token, _hasHydrated, page, limit])

  useEffect(() => {
    loadCompanies()
  }, [loadCompanies])

  useEffect(() => {
    void loadFilterCounts()
  }, [loadFilterCounts])

  useEffect(() => () => abortRef.current?.abort(), [])

  // Reload the list from the first page (used after mutations).
  const refreshCompanies = useCallback(() => {
    if (page === 1) void loadCompanies()
    else setPage(1)
  }, [page, loadCompanies])

  const handleLoadMore = useCallback(() => {
    if (isFetching || !pagination?.hasNextPage) return
    setPage(pagination.currentPage + 1)
  }, [isFetching, pagination])

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

  const loadMessages = useCallback(
    async (conversation: Conversation | null) => {
      if (!access_token || !conversation?.companyId) {
        setMessages([])
        return
      }

      try {
        setMessagesLoading(true)
        const activityMessages = await fetchActivityCompanyById(
          conversation.companyId,
          access_token
        )
        setMessages(
          mapActivityMessagesToThread(activityMessages, conversation.name)
        )
      } catch (err) {
        console.log("Error loading activity messages", err)
        setMessages([])
      } finally {
        setMessagesLoading(false)
      }
    },
    [access_token]
  )

  useEffect(() => {
    loadMessages(selectedConversation)
  }, [loadMessages, selectedConversation])

  const filteredConversations = useMemo(() => {
    return channelConversations.filter((conversation) => {
      const matchesFilter =
        activeFilter === "all" ||
        (activeFilter === "received" && conversation.hasInboundMessage) ||
        (activeFilter === "needs_reply" && conversation.needReply > 0) ||
        (activeFilter === "paused" && conversation.handedOff > 0)

      return matchesFilter && matchesConversationSearch(conversation, search)
    })
  }, [channelConversations, activeFilter, search])

  const handleArchiveToggle = useCallback(
    async (archive: boolean) => {
      if (isArchiving) return

      if (!access_token || !selectedConversation?.companyId) {
        toast.error("Company details are missing", { icon: false })
        return
      }

      const tenantId = user_data?.organization
      if (!tenantId) {
        toast.error("Organization not found", { icon: false })
        return
      }

      const wasPaused = selectedConversation.handedOff > 0

      // Optimistic chip update so Paused reflects immediately
      if (archive !== wasPaused) {
        setFilterCounts((prev) => ({
          ...prev,
          paused: Math.max(0, prev.paused + (archive ? 1 : -1)),
        }))
        setConversations((prev) =>
          prev.map((c) =>
            c.id === selectedConversation.id
              ? { ...c, handedOff: archive ? 1 : 0 }
              : c
          )
        )
      }

      setShowComposer(archive)
      if (!archive) setDraft("")

      try {
        setIsArchiving(true)
        await archiveActivityCompany(
          {
            deal_id: selectedConversation.dealId || "",
            dealname: selectedConversation.dealName || "",
            dealstage: selectedConversation.dealStage || "",
            company_id: selectedConversation.companyId,
            tenant_id: tenantId,
            archive,
          },
          access_token
        )

        refreshCompanies()
        void loadFilterCounts()
        toast.success(archive ? "Conversation paused" : "Takeover revoked", {
          icon: false,
        })
      } catch (err: any) {
        // Roll back optimistic chip / list state
        if (archive !== wasPaused) {
          setFilterCounts((prev) => ({
            ...prev,
            paused: Math.max(0, prev.paused + (archive ? -1 : 1)),
          }))
          setConversations((prev) =>
            prev.map((c) =>
              c.id === selectedConversation.id
                ? { ...c, handedOff: wasPaused ? 1 : 0 }
                : c
            )
          )
          setShowComposer(wasPaused)
        }

        console.log("Error updating archive status", err)
        const status = err?.response?.status
        // Stay on Activity page; do not navigate away
        if (status !== 401 && status !== 403) {
          toast.error(
            archive
              ? "Failed to pause conversation"
              : "Failed to revoke takeover",
            { icon: false }
          )
        } else {
          toast.error("Session expired. Please sign in again.", { icon: false })
        }
      } finally {
        setIsArchiving(false)
      }
    },
    [
      access_token,
      isArchiving,
      refreshCompanies,
      loadFilterCounts,
      selectedConversation,
      user_data?.organization,
    ]
  )

  const handleSendMessage = useCallback(async () => {
    const message = draft.trim()
    if (!message || isSending) return

    if (!access_token || !selectedConversation?.phone) {
      toast.error("Company phone number is missing", { icon: false })
      return
    }

    try {
      setIsSending(true)
      await sendActivityMessage(
        {
          message,
          to: selectedConversation.phone,
        },
        access_token
      )
      setDraft("")
      toast.success("Message sent", { icon: false })
      await loadMessages(selectedConversation)
    } catch (err) {
      console.log("Error sending activity message", err)
      toast.error("Failed to send message", { icon: false })
    } finally {
      setIsSending(false)
    }
  }, [
    access_token,
    draft,
    isSending,
    loadMessages,
    selectedConversation,
  ])

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
              onClick={() => {
                void loadCompanies()
                void loadFilterCounts()
              }}
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
                const next = conversations.find((c) => c.id === id)
                setShowComposer((next?.handedOff ?? 0) > 0)
              }}
              hasMore={Boolean(pagination?.hasNextPage)}
              isFetching={isFetching}
              onLoadMore={handleLoadMore}
            />
            <ThreadPanel
              conversation={selectedConversation}
              messages={messages}
              messagesLoading={messagesLoading}
              alert={selectedConversation ? ASSISTANT_ALERT : null}
              showComposer={showComposer}
              isArchiving={isArchiving}
              isSending={isSending}
              draft={draft}
              onDraftChange={setDraft}
              onSend={handleSendMessage}
              onTakeOver={() => handleArchiveToggle(true)}
              onRevoke={() => handleArchiveToggle(false)}
            />
          </>
        )}
      </div>
    </div>
  )
}
