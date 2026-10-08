"use client"

import { useCallback, useEffect, useMemo, useRef, useState } from "react"
import { toast } from "react-toastify"
import ActivityHeader from "./components/ActivityHeader"
import ChannelTabs from "./components/ChannelTabs"
import ConversationList from "./components/ConversationList"
import EmailThreadPanel from "./components/EmailThreadPanel"
import ThreadPanel from "./components/ThreadPanel"
import { ASSISTANT_ALERT, CHANNEL_TABS } from "./data/mockData"
import {
  archiveActivityCompany,
  companyListParamsFromFilter,
  fetchActivityCompanies,
  fetchActivityCompanyById,
  fetchActivityCounts,
  fetchActivityEmailById,
  fetchActivityEmails,
  sendActivityMessage,
} from "./api/activityApi"
import {
  mapActivityCompaniesToConversations,
  matchesConversationSearch,
} from "./mapActivityCompanies"
import { mapActivityMessagesToThread } from "./mapActivityMessages"
import type {
  ActivityEmailDetail,
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

const PAGE_SIZE = 10

function mergeConversations(
  existing: Conversation[],
  incoming: Conversation[]
): Conversation[] {
  const seen = new Set(existing.map((c) => c.id))
  const merged = [...existing]
  for (const item of incoming) {
    if (seen.has(item.id)) continue
    seen.add(item.id)
    merged.push(item)
  }
  return merged
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

  const [pagination, setPagination] = useState<ActivityPagination | null>(null)
  const [loadingMore, setLoadingMore] = useState(false)
  const [emailConversations, setEmailConversations] = useState<Conversation[]>([])
  const [emailPagination, setEmailPagination] = useState<ActivityPagination | null>(null)
  const [emailLoading, setEmailLoading] = useState(false)
  const [emailLoadingMore, setEmailLoadingMore] = useState(false)
  const [emailLoadError, setEmailLoadError] = useState<string | null>(null)
  const [emailSelectedId, setEmailSelectedId] = useState<string | null>(null)
  const [emailFilter, setEmailFilter] = useState<ConversationFilter>("all")
  const [emailDetails, setEmailDetails] = useState<ActivityEmailDetail[]>([])
  const [emailDetailsLoading, setEmailDetailsLoading] = useState(false)
  const requestIdRef = useRef(0)
  const abortRef = useRef<AbortController | null>(null)
  const loadingMoreLockRef = useRef(false)
  const emailRequestIdRef = useRef(0)
  const emailAbortRef = useRef<AbortController | null>(null)
  const emailLoadingMoreLockRef = useRef(false)
  const activeFilterRef = useRef(activeFilter)
  activeFilterRef.current = activeFilter

  const isEmailTab = activeTab === "emails"

  const loadCompanies = useCallback(
    async (page = 1, filter: ConversationFilter = activeFilterRef.current) => {
      if (!_hasHydrated) return
      if (!access_token) {
        setConversations([])
        setPagination(null)
        setLoadError("Sign-in is required to load activity.")
        setLoading(false)
        return
      }

      const filterParams = companyListParamsFromFilter(filter)
      const isFirstPage = page === 1

      if (isFirstPage) {
        abortRef.current?.abort()
        const controller = new AbortController()
        abortRef.current = controller
        const requestId = ++requestIdRef.current
        const isStale = () =>
          requestId !== requestIdRef.current ||
          activeFilterRef.current !== filter

        try {
          setLoading(true)
          setLoadError(null)
          loadingMoreLockRef.current = false
          const result = await fetchActivityCompanies(
            { page: 1, limit: PAGE_SIZE, ...filterParams },
            access_token,
            controller.signal
          )
          if (isStale()) return

          const mapped = mapActivityCompaniesToConversations(result.data)
          setPagination(result.pagination)
          setConversations(mapped)
          setSelectedId((prev) =>
            prev && mapped.some((c) => c.id === prev) ? prev : mapped[0]?.id ?? null
          )
          setShowComposer(false)
        } catch (err: any) {
          if (isStale() || err?.code === "ERR_CANCELED") return
          console.log("Error loading activity companies", err)
          setConversations([])
          setPagination(null)
          setLoadError(
            err?.response?.data?.message || "Failed to load activity companies."
          )
        } finally {
          if (!isStale()) setLoading(false)
        }
        return
      }

      if (loadingMoreLockRef.current) return
      loadingMoreLockRef.current = true
      setLoadingMore(true)

      try {
        const result = await fetchActivityCompanies(
          { page, limit: PAGE_SIZE, ...filterParams },
          access_token
        )
        if (activeFilterRef.current !== filter) return
        const mapped = mapActivityCompaniesToConversations(result.data)
        setPagination(result.pagination)
        setConversations((prev) => mergeConversations(prev, mapped))
      } catch (err) {
        console.log("Error loading more activity companies", err)
      } finally {
        loadingMoreLockRef.current = false
        setLoadingMore(false)
      }
    },
    [access_token, _hasHydrated]
  )

  const loadFilterCounts = useCallback(async () => {
    if (!_hasHydrated || !access_token) {
      setFilterCounts(EMPTY_FILTER_COUNTS)
      return
    }
    try {
      const counts = await fetchActivityCounts(access_token)
      setFilterCounts(counts)
    } catch (err) {
      console.log("Error loading activity filter counts", err)
    }
  }, [access_token, _hasHydrated])

  const loadEmails = useCallback(
    async (page = 1) => {
      if (!_hasHydrated) return
      if (!access_token) {
        setEmailConversations([])
        setEmailPagination(null)
        setEmailLoadError("Sign-in is required to load email activity.")
        setEmailLoading(false)
        return
      }

      const isFirstPage = page === 1

      if (isFirstPage) {
        emailAbortRef.current?.abort()
        const controller = new AbortController()
        emailAbortRef.current = controller
        const requestId = ++emailRequestIdRef.current
        const isStale = () => requestId !== emailRequestIdRef.current

        try {
          setEmailLoading(true)
          setEmailLoadError(null)
          emailLoadingMoreLockRef.current = false
          const result = await fetchActivityEmails(
            { page: 1, limit: PAGE_SIZE },
            access_token,
            controller.signal
          )
          if (isStale()) return

          console.log("[ActivityView] email companies list", result)
          const mapped = mapActivityCompaniesToConversations(result.data).map(
            (c) => ({ ...c, channel: "emails" as const })
          )
          setEmailPagination(result.pagination)
          setEmailConversations(mapped)
          setEmailSelectedId((prev) =>
            prev && mapped.some((c) => c.id === prev) ? prev : mapped[0]?.id ?? null
          )
        } catch (err: any) {
          if (isStale() || err?.code === "ERR_CANCELED") return
          console.log("Error loading activity emails", err)
          setEmailConversations([])
          setEmailPagination(null)
          setEmailLoadError(
            err?.response?.data?.message || "Failed to load email companies."
          )
        } finally {
          if (!isStale()) setEmailLoading(false)
        }
        return
      }

      if (emailLoadingMoreLockRef.current) return
      emailLoadingMoreLockRef.current = true
      setEmailLoadingMore(true)

      try {
        const result = await fetchActivityEmails(
          { page, limit: PAGE_SIZE },
          access_token
        )
        console.log("[ActivityView] email companies page", page, result)
        const mapped = mapActivityCompaniesToConversations(result.data).map(
          (c) => ({ ...c, channel: "emails" as const })
        )
        setEmailPagination(result.pagination)
        setEmailConversations((prev) => mergeConversations(prev, mapped))
      } catch (err) {
        console.log("Error loading more activity emails", err)
      } finally {
        emailLoadingMoreLockRef.current = false
        setEmailLoadingMore(false)
      }
    },
    [access_token, _hasHydrated]
  )

  const loadEmailDetail = useCallback(
    async (companyId: string | null) => {
      if (!access_token || !companyId) {
        setEmailDetails([])
        return
      }
      try {
        setEmailDetailsLoading(true)
        const data = await fetchActivityEmailById(companyId, access_token)
        console.log("[ActivityView] email detail for", companyId, data)
        setEmailDetails(data)
      } catch (err) {
        console.log("Error loading activity email detail", err)
        setEmailDetails([])
      } finally {
        setEmailDetailsLoading(false)
      }
    },
    [access_token]
  )

  useEffect(() => {
    if (isEmailTab) {
      setLoading(false)
      setLoadError(null)
      void loadEmails(1)
      return
    }
    void loadCompanies(1, activeFilter)
  }, [loadCompanies, loadEmails, activeFilter, isEmailTab])

  useEffect(() => {
    void loadFilterCounts()
  }, [loadFilterCounts])

  useEffect(() => () => {
    abortRef.current?.abort()
    emailAbortRef.current?.abort()
  }, [])

  const handleLoadMore = useCallback(() => {
    if (isEmailTab) return
    if (loading || loadingMore || loadingMoreLockRef.current) return
    if (!pagination?.hasNextPage) return
    const nextPage = pagination.nextPage ?? pagination.currentPage + 1
    void loadCompanies(nextPage, activeFilter)
  }, [
    activeFilter,
    isEmailTab,
    loadCompanies,
    loading,
    loadingMore,
    pagination,
  ])

  const handleEmailLoadMore = useCallback(() => {
    if (!isEmailTab) return
    if (emailLoading || emailLoadingMore || emailLoadingMoreLockRef.current) return
    if (!emailPagination?.hasNextPage) return
    const nextPage = emailPagination.nextPage ?? emailPagination.currentPage + 1
    void loadEmails(nextPage)
  }, [emailLoading, emailLoadingMore, emailPagination, isEmailTab, loadEmails])

  const handleFilterChange = useCallback((filter: ConversationFilter) => {
    setActiveFilter(filter)
    setSearch("")
    setDraft("")
    setShowComposer(false)
  }, [])

  const selectedConversation =
    conversations.find((c) => c.id === selectedId) ?? null

  const selectedEmailConversation =
    emailConversations.find((c) => c.id === emailSelectedId) ?? null

  const emailFilterCounts = useMemo(
    () => ({
      all: emailPagination?.totalRecords ?? emailConversations.length,
      received: emailConversations.filter((c) => c.hasInboundMessage).length,
      needs_reply: 0,
      paused: 0,
    }),
    [emailConversations, emailPagination?.totalRecords]
  )

  const filteredEmailConversations = useMemo(() => {
    return emailConversations.filter((conversation) => {
      const matchesFilter =
        emailFilter === "all" ||
        (emailFilter === "received" && conversation.hasInboundMessage)
      return matchesFilter && matchesConversationSearch(conversation, search)
    })
  }, [emailConversations, emailFilter, search])

  useEffect(() => {
    if (!isEmailTab) return
    void loadEmailDetail(selectedEmailConversation?.companyId ?? null)
  }, [isEmailTab, loadEmailDetail, selectedEmailConversation?.companyId])

  const loadMessages = useCallback(
    async (conversation: Conversation | null) => {
      if (isEmailTab) {
        setMessages([])
        return
      }
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
    [access_token, isEmailTab]
  )

  useEffect(() => {
    loadMessages(selectedConversation)
  }, [loadMessages, selectedConversation])

  const filteredConversations = useMemo(() => {
    return conversations.filter((conversation) =>
      matchesConversationSearch(conversation, search)
    )
  }, [conversations, search])

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

      const companyId = selectedConversation.companyId
      const wasPaused = selectedConversation.handedOff > 0

      if (archive !== wasPaused) {
        setFilterCounts((prev) => ({
          ...prev,
          paused: Math.max(0, prev.paused + (archive ? 1 : -1)),
        }))
        setConversations((prev) =>
          prev.map((c) =>
            c.companyId === companyId
              ? {
                  ...c,
                  handedOff: archive ? 1 : 0,
                  status: archive ? "paused" : null,
                }
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
            company_id: companyId,
            tenant_id: tenantId,
            archive,
          },
          access_token
        )

        void loadFilterCounts()
        // Re-fetch current chip filter so list matches server query params
        void loadCompanies(1, activeFilterRef.current)
        toast.success(archive ? "Conversation paused" : "Takeover revoked", {
          icon: false,
        })
      } catch (err: any) {
        if (archive !== wasPaused) {
          setFilterCounts((prev) => ({
            ...prev,
            paused: Math.max(0, prev.paused + (archive ? -1 : 1)),
          }))
          setConversations((prev) =>
            prev.map((c) =>
              c.companyId === companyId
                ? {
                    ...c,
                    handedOff: wasPaused ? 1 : 0,
                    status: wasPaused ? "paused" : null,
                  }
                : c
            )
          )
          setShowComposer(wasPaused)
        }

        console.log("Error updating archive status", err)
        const status = err?.response?.status
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
      loadCompanies,
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
  }, [access_token, draft, isSending, loadMessages, selectedConversation])

  const handleTabChange = (tab: ChannelTab) => {
    setActiveTab(tab)
    setActiveFilter("all")
    setSearch("")
    setDraft("")
    setShowComposer(false)
    setSelectedId(null)
    setMessages([])
    if (tab === "emails") {
      setLoadError(null)
      setLoading(false)
      setEmailLoadError(null)
      setEmailFilter("all")
    } else {
      setEmailSelectedId(null)
      setEmailDetails([])
      setEmailFilter("all")
    }
  }

  return (
    <div className="flex h-[min(100dvh,calc(100vh-80px))] min-h-0 w-full min-w-0 flex-col gap-4 overflow-hidden">
      <ActivityHeader />
      <ChannelTabs tabs={CHANNEL_TABS} activeTab={activeTab} onChange={handleTabChange} />

      <div className="flex min-h-0 flex-1 overflow-hidden rounded-lg border border-[#E2E6EF] bg-white">
        {isEmailTab ? (
          emailLoading ? (
            <div className="flex flex-1 items-center justify-center text-[14px] text-[#8A93A6]">
              Loading email activity...
            </div>
          ) : emailLoadError ? (
            <div className="flex flex-1 flex-col items-center justify-center gap-3 px-4 text-center">
              <p className="text-[14px] text-[#C0392B]">{emailLoadError}</p>
              <button
                type="button"
                onClick={() => void loadEmails(1)}
                className="rounded-md bg-[#1B3A8C] px-3 py-1.5 text-[13px] font-medium text-white"
              >
                Retry
              </button>
            </div>
          ) : (
            <>
              <ConversationList
                conversations={filteredEmailConversations}
                selectedId={emailSelectedId}
                search={search}
                activeFilter={emailFilter}
                filterCounts={emailFilterCounts}
                visibleFilters={["all", "received"]}
                hasNextPage={Boolean(emailPagination?.hasNextPage)}
                loadingMore={emailLoadingMore}
                onSearchChange={setSearch}
                onFilterChange={(filter) => {
                  if (filter === "all" || filter === "received") {
                    setEmailFilter(filter)
                  }
                }}
                onSelect={(id) => setEmailSelectedId(id)}
                onLoadMore={handleEmailLoadMore}
              />
              <EmailThreadPanel
                conversation={selectedEmailConversation}
                emails={emailDetails}
                loading={emailDetailsLoading}
              />
            </>
          )
        ) : loading ? (
          <div className="flex flex-1 items-center justify-center text-[14px] text-[#8A93A6]">
            Loading activity...
          </div>
        ) : loadError ? (
          <div className="flex flex-1 flex-col items-center justify-center gap-3 px-4 text-center">
            <p className="text-[14px] text-[#C0392B]">{loadError}</p>
            <button
              type="button"
              onClick={() => {
                void loadCompanies(1, activeFilter)
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
              hasNextPage={Boolean(pagination?.hasNextPage)}
              loadingMore={loadingMore}
              onSearchChange={setSearch}
              onFilterChange={handleFilterChange}
              onSelect={(id) => {
                setSelectedId(id)
                setDraft("")
                const next = conversations.find((c) => c.id === id)
                setShowComposer((next?.handedOff ?? 0) > 0)
              }}
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
