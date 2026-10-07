"use client"

import { useCallback, useEffect, useMemo, useState } from "react"
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
  sendActivityMessage,
} from "./api/activityApi"
import {
  mapActivityCompaniesToConversations,
  matchesConversationSearch,
} from "./mapActivityCompanies"
import { mapActivityMessagesToThread } from "./mapActivityMessages"
import type {
  ChannelTab,
  Conversation,
  ConversationFilter,
  ThreadMessage,
} from "./types"
import useAuth from "@/store/user"

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

  const filterCounts = useMemo(
    () => ({
      all: channelConversations.length,
      received: channelConversations.filter((c) => c.hasInboundMessage).length,
      needs_reply: channelConversations.reduce(
        (sum, c) => sum + (c.needReply || 0),
        0
      ),
      paused: channelConversations.reduce(
        (sum, c) => sum + (c.handedOff || 0),
        0
      ),
    }),
    [channelConversations]
  )

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

        // Keep company list + conversation view; only toggle composer/revoke state
        setShowComposer(archive)
        if (!archive) setDraft("")
        toast.success(archive ? "Conversation paused" : "Takeover revoked", {
          icon: false,
        })
      } catch (err: any) {
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
                setShowComposer(false)
              }}
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
