"use client"

import { useCallback, useEffect, useState, type ReactNode } from "react"
import {
  AlertCircle,
  ArrowLeft,
  ExternalLink,
  Mail,
  MessageSquare,
  Pencil,
  Phone,
  User,
} from "lucide-react"
import { toast } from "react-toastify"
import {
  archiveActivityCompany,
  fetchActivityCompanies,
  fetchActivityCompanyById,
  fetchActivityCompanyCustomer,
  fetchActivityEmailById,
  sendActivityMessage,
} from "../api/activityApi"
import { mapActivityCompaniesToConversations } from "../mapActivityCompanies"
import AssistantAlert from "./AssistantAlert"
import EmailMessageCard from "./EmailMessageCard"
import MessageComposer from "./MessageComposer"
import MessageThread from "./MessageThread"
import { ASSISTANT_ALERT } from "../data/mockData"
import { mapActivityMessagesToThread } from "../mapActivityMessages"
import type {
  ActivityCustomerDetail,
  ActivityEmailDetail,
  Conversation,
  ThreadMessage,
} from "../types"
import { useOrganizationIndustry } from "@/features/dashboard/hooks/useOrganizationIndustry"
import { DENTAL_CLINIC_INDUSTRY } from "@/features/dashboard/resolveDashboardKind"
import useAuth from "@/store/user"

type CustomerDetailTab = "details" | "texts" | "calls" | "emails"

type CustomerDetailViewProps = {
  conversation: Conversation
  accessToken: string
  onBack: () => void
}

function formatStartedDate(value: string): string {
  if (!value.trim()) return "—"
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return value
  return date.toLocaleDateString([], {
    month: "short",
    day: "numeric",
    year: "numeric",
  })
}

function websiteHref(website: string): string {
  if (!website) return ""
  if (/^https?:\/\//i.test(website)) return website
  return `https://${website}`
}

function websiteLabel(website: string): string {
  return website.replace(/^https?:\/\//i, "").replace(/\/$/, "")
}

function getInitials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean)
  if (parts.length >= 2) return `${parts[0][0]}${parts[1][0]}`.toUpperCase()
  return (name.trim().slice(0, 2) || "?").toUpperCase()
}

function DetailField({
  label,
  children,
}: {
  label: string
  children: ReactNode
}) {
  return (
    <div>
      <p className="text-[11px] font-medium uppercase tracking-wide text-[#8A93A6]">
        {label}
      </p>
      <div className="mt-1 text-[14px] font-semibold text-[#1A2333]">{children}</div>
    </div>
  )
}

export default function CustomerDetailView({
  conversation,
  accessToken,
  onBack,
}: CustomerDetailViewProps) {
  const { user_data } = useAuth()
  const { industry: orgIndustry } = useOrganizationIndustry()
  const detailsTitle =
    orgIndustry === DENTAL_CLINIC_INDUSTRY
      ? "Patient Detail"
      : "Customer details"

  const companyId = conversation.companyId
  const [activeTab, setActiveTab] = useState<CustomerDetailTab>("details")
  const [customer, setCustomer] = useState<ActivityCustomerDetail | null>(null)
  const [customerLoading, setCustomerLoading] = useState(true)
  const [customerError, setCustomerError] = useState<string | null>(null)

  const [textMessages, setTextMessages] = useState<ThreadMessage[]>([])
  const [textsLoading, setTextsLoading] = useState(false)
  const [handedOff, setHandedOff] = useState(conversation.handedOff > 0)
  const [isArchiving, setIsArchiving] = useState(false)
  const [draft, setDraft] = useState("")
  const [isSending, setIsSending] = useState(false)
  /** Filled from Activity company list when opened from dashboard stub. */
  const [dealId, setDealId] = useState(conversation.dealId || "")
  const [dealName, setDealName] = useState(conversation.dealName || "")
  const [dealStage, setDealStage] = useState(conversation.dealStage || "")
  const [activityPhone, setActivityPhone] = useState(conversation.phone || "")

  const [emails, setEmails] = useState<ActivityEmailDetail[]>([])
  const [emailsLoading, setEmailsLoading] = useState(false)

  useEffect(() => {
    setHandedOff(conversation.handedOff > 0)
    setDealId(conversation.dealId || "")
    setDealName(conversation.dealName || "")
    setDealStage(conversation.dealStage || "")
    setActivityPhone(conversation.phone || "")
  }, [
    conversation.companyId,
    conversation.dealId,
    conversation.dealName,
    conversation.dealStage,
    conversation.handedOff,
    conversation.phone,
  ])

  // Enrich deal/phone/handed_off from Activity company list (needed for Pause from dashboard).
  useEffect(() => {
    if (!companyId || !accessToken) return
    let cancelled = false

    const enrich = async () => {
      try {
        const result = await fetchActivityCompanies(
          { page: 1, limit: 100 },
          accessToken
        )
        if (cancelled) return
        const mapped = mapActivityCompaniesToConversations(result.data)
        const match = mapped.find((c) => c.companyId === companyId)
        if (!match) return

        if (match.dealId) setDealId(match.dealId)
        if (match.dealName) setDealName(match.dealName)
        if (match.dealStage) setDealStage(match.dealStage)
        if (match.phone) setActivityPhone(match.phone)
        setHandedOff(match.handedOff > 0)
      } catch (err) {
        console.log("Error enriching patient activity meta", err)
      }
    }

    void enrich()
    return () => {
      cancelled = true
    }
  }, [accessToken, companyId])

  const loadCustomer = useCallback(async () => {
    if (!companyId) {
      setCustomer(null)
      setCustomerError("Company id is missing")
      setCustomerLoading(false)
      return
    }
    try {
      setCustomerLoading(true)
      setCustomerError(null)
      const data = await fetchActivityCompanyCustomer(companyId, accessToken)
      setCustomer(data)
      if (!data) setCustomerError("Customer details not found")
    } catch (err) {
      console.log("Error loading customer detail", err)
      setCustomer(null)
      setCustomerError("Failed to load customer details")
    } finally {
      setCustomerLoading(false)
    }
  }, [accessToken, companyId])

  const loadTexts = useCallback(async () => {
    if (!companyId) {
      setTextMessages([])
      return
    }
    try {
      setTextsLoading(true)
      const messages = await fetchActivityCompanyById(companyId, accessToken)
      setTextMessages(
        mapActivityMessagesToThread(
          messages,
          customer?.name || conversation.name
        )
      )
    } catch (err) {
      console.log("Error loading customer texts", err)
      setTextMessages([])
    } finally {
      setTextsLoading(false)
    }
  }, [accessToken, companyId, conversation.name, customer?.name])

  const loadEmails = useCallback(async () => {
    if (!companyId) {
      setEmails([])
      return
    }
    try {
      setEmailsLoading(true)
      const data = await fetchActivityEmailById(companyId, accessToken)
      setEmails(data)
    } catch (err) {
      console.log("Error loading customer emails", err)
      setEmails([])
    } finally {
      setEmailsLoading(false)
    }
  }, [accessToken, companyId])

  useEffect(() => {
    void loadCustomer()
  }, [loadCustomer])

  useEffect(() => {
    if (activeTab === "texts") void loadTexts()
    if (activeTab === "emails") void loadEmails()
  }, [activeTab, loadEmails, loadTexts])

  const displayName = customer?.name || conversation.name
  const industry = customer?.industry || conversation.industry || "—"
  const email = customer?.companyEmail || ""
  const phone =
    customer?.phoneNumber || activityPhone || conversation.phone || ""
  const website = customer?.website || ""
  const startedDate = formatStartedDate(customer?.startedDate || "")
  const initials = getInitials(displayName)
  const needsTextReply = conversation.needReply > 0 || conversation.hasInboundMessage

  const handleArchiveToggle = useCallback(
    async (archive: boolean) => {
      if (isArchiving) return
      if (!accessToken || !companyId) {
        toast.error("Company details are missing", { icon: false })
        return
      }
      const tenantId = user_data?.organization
      if (!tenantId) {
        toast.error("Organization not found", { icon: false })
        return
      }
      if (!dealId) {
        toast.error(
          "Deal details are missing for this patient. Open them from Activity Texts first, or try again.",
          { icon: false }
        )
        return
      }

      const wasPaused = handedOff
      setHandedOff(archive)
      if (!archive) setDraft("")

      try {
        setIsArchiving(true)
        await archiveActivityCompany(
          {
            deal_id: dealId,
            dealname: dealName || "",
            dealstage: dealStage || "",
            company_id: companyId,
            tenant_id: tenantId,
            archive,
          },
          accessToken
        )
        toast.success(archive ? "Conversation paused" : "Takeover revoked", {
          icon: false,
        })
      } catch (err: any) {
        setHandedOff(wasPaused)
        console.log("Error updating archive status", err)
        const status = err?.response?.status
        const apiMessage = err?.response?.data?.message
        if (status !== 401 && status !== 403) {
          toast.error(
            apiMessage ||
            (archive
              ? "Failed to pause conversation"
              : "Failed to revoke takeover"),
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
      accessToken,
      companyId,
      dealId,
      dealName,
      dealStage,
      handedOff,
      isArchiving,
      user_data?.organization,
    ]
  )

  const handleSendMessage = useCallback(async () => {
    const message = draft.trim()
    if (!message || isSending) return
    if (!accessToken || !phone) {
      toast.error("Phone number is missing", { icon: false })
      return
    }

    try {
      setIsSending(true)
      await sendActivityMessage({ message, to: phone }, accessToken)
      setDraft("")
      toast.success("Message sent", { icon: false })
      await loadTexts()
    } catch (err) {
      console.log("Error sending customer detail message", err)
      toast.error("Failed to send message", { icon: false })
    } finally {
      setIsSending(false)
    }
  }, [accessToken, draft, isSending, loadTexts, phone])

  const tabs: {
    id: CustomerDetailTab
    label: string
    icon: typeof User
    badge?: { label: string; tone: "alert" | "count" }
  }[] = [
      { id: "details", label: "Details", icon: User },
      {
        id: "texts",
        label: "Texts",
        icon: MessageSquare,
        badge: needsTextReply ? { label: "", tone: "alert" } : undefined,
      },
      {
        id: "calls",
        label: "Calls",
        icon: Phone,
        badge: { label: "0", tone: "count" },
      },
      {
        id: "emails",
        label: "Emails",
        icon: Mail,
      },
    ]

  return (
    <div className="flex min-h-0 flex-1 flex-col overflow-hidden rounded-lg border border-[#E2E6EF] bg-[#F4F6FA]">
      <div className="min-h-0 flex-1 overflow-y-auto p-4 sm:p-5">
        <button
          type="button"
          onClick={onBack}
          className="mb-3 inline-flex items-center gap-1.5 text-[13px] font-medium text-[#1B3A8C] hover:text-[#163075]"
        >
          <ArrowLeft size={16} strokeWidth={2.25} />
          Back
        </button>

        <div className="mb-4 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div className="flex min-w-0 items-center gap-3">
            <div
              className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full text-[15px] font-semibold text-[#1B3A8C]"
              style={{ backgroundColor: conversation.avatarColor }}
            >
              {initials}
            </div>
            <div className="min-w-0">
              <h2 className="truncate text-[22px] font-bold tracking-tight text-[#1B3A8C]">
                {displayName}
              </h2>
              <p className="mt-0.5 text-[13px] text-[#5A6478]">
                {industry}
                {startedDate !== "—" ? ` · Customer since ${startedDate}` : null}
              </p>
            </div>
          </div>

          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => setActiveTab("texts")}
              className="inline-flex items-center gap-1.5 rounded-md bg-[#1B3A8C] px-3 py-2 text-[13px] font-medium text-white hover:bg-[#163075]"
            >
              <MessageSquare size={15} strokeWidth={2.25} />
              Send text
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("emails")}
              className="inline-flex items-center gap-1.5 rounded-md border border-[#1B3A8C] bg-white px-3 py-2 text-[13px] font-medium text-[#1B3A8C] hover:bg-[#EEF2FB]"
            >
              <Mail size={15} strokeWidth={2.25} />
              Send email
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("calls")}
              className="inline-flex items-center gap-1.5 rounded-md border border-[#1B3A8C] bg-white px-3 py-2 text-[13px] font-medium text-[#1B3A8C] hover:bg-[#EEF2FB]"
            >
              <Phone size={15} strokeWidth={2.25} />
              Call
            </button>
          </div>
        </div>

        <div className="mb-4 flex gap-5 border-b border-[#E2E6EF]">
          {tabs.map((tab) => {
            const Icon = tab.icon
            const isActive = tab.id === activeTab
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id)}
                className={`relative inline-flex items-center gap-1.5 pb-2.5 text-[13px] font-medium transition-colors ${isActive ? "text-[#1B3A8C]" : "text-[#6B7280] hover:text-[#1B3A8C]"
                  }`}
              >
                <Icon size={15} strokeWidth={2.25} />
                {tab.label}
                {tab.badge ? (
                  tab.badge.tone === "alert" ? (
                    <span className="rounded-full bg-[#E85D3B] px-1.5 py-0.5 text-[10px] font-medium text-white">
                      {tab.badge.label}
                    </span>
                  ) : (
                    <span className="rounded bg-[#ECEEF2] px-1.5 py-0.5 text-[10px] font-medium text-[#4A5168]">
                      {tab.badge.label}
                    </span>
                  )
                ) : null}
                {isActive ? (
                  <span className="absolute inset-x-0 -bottom-px h-[2px] rounded-full bg-[#1B3A8C]" />
                ) : null}
              </button>
            )
          })}
        </div>

        {activeTab === "details" && (
          <>
            <div className="mb-4 flex flex-col gap-3 rounded-lg border border-[#F0C9AE] bg-[#FDF3EC] p-3.5 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex min-w-0 gap-3">
                <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-[#E85D3B] text-white">
                  <AlertCircle className="h-4 w-4" strokeWidth={2.5} aria-hidden />
                </div>
                <p className="text-[13px] leading-relaxed text-[#8A4A28]">
                  <span className="font-semibold text-[#8A3A12]">
                    {displayName} is waiting for your reply.
                  </span>{" "}
                  Review their latest messages and follow up when ready.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setActiveTab("texts")}
                className="shrink-0 rounded-md bg-[#1B3A8C] px-3 py-2 text-[12.5px] font-medium text-white hover:bg-[#163075]"
              >
                Open texts
              </button>
            </div>

            <div className="rounded-xl border border-[#E2E6EF] bg-white p-5 shadow-sm">
              <div className="mb-5 flex items-center justify-between gap-3">
                <h3 className="text-[16px] font-semibold text-[#1A2333]">
                  {detailsTitle}
                </h3>
                <button
                  type="button"
                  className="inline-flex items-center gap-1.5 rounded-md border border-[#1B3A8C] bg-white px-3 py-1.5 text-[12.5px] font-medium text-[#1B3A8C] hover:bg-[#EEF2FB]"
                >
                  <Pencil size={13} strokeWidth={2.25} />
                  Edit details
                </button>
              </div>

              {customerLoading ? (
                <p className="py-6 text-center text-[13px] text-[#8A93A6]">
                  Loading customer details…
                </p>
              ) : customerError ? (
                <div className="py-6 text-center">
                  <p className="text-[13px] text-[#C0392B]">{customerError}</p>
                  <button
                    type="button"
                    onClick={() => void loadCustomer()}
                    className="mt-3 rounded-md bg-[#1B3A8C] px-3 py-1.5 text-[12px] font-medium text-white"
                  >
                    Retry
                  </button>
                </div>
              ) : (
                <div className="grid gap-x-10 gap-y-5 sm:grid-cols-2">
                  <DetailField label="Name">{displayName || "—"}</DetailField>
                  <DetailField label="Industry">{industry}</DetailField>
                  <DetailField label="Email">
                    {email ? (
                      <a
                        href={`mailto:${email}`}
                        className="font-semibold text-[#1B3A8C] underline-offset-2 hover:underline"
                      >
                        {email}
                      </a>
                    ) : (
                      "—"
                    )}
                  </DetailField>
                  <DetailField label="Phone">
                    {phone ? (
                      <a
                        href={`tel:${phone}`}
                        className="font-semibold text-[#1B3A8C] underline-offset-2 hover:underline"
                      >
                        {phone}
                      </a>
                    ) : (
                      "—"
                    )}
                  </DetailField>
                  <DetailField label="Website">
                    {website ? (
                      <a
                        href={websiteHref(website)}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-1 font-semibold text-[#1B3A8C] underline-offset-2 hover:underline"
                      >
                        {websiteLabel(website)}
                        <ExternalLink size={13} strokeWidth={2.25} />
                      </a>
                    ) : (
                      "—"
                    )}
                  </DetailField>
                  <DetailField label="Customer since">{startedDate}</DetailField>
                </div>
              )}
            </div>
          </>
        )}

        {activeTab === "texts" && (
          <div className="flex min-h-[420px] flex-col overflow-hidden rounded-xl border border-[#E2E6EF] bg-white shadow-sm">
            <div className="border-b border-[#EEF0F5] px-4 py-3">
              <h3 className="text-[15px] font-semibold text-[#1A2333]">Texts</h3>
              <p className="text-[12px] text-[#8A93A6]">
                Conversation for {displayName}
              </p>
            </div>
            <AssistantAlert
              title={ASSISTANT_ALERT.title}
              body={ASSISTANT_ALERT.body}
              isTakenOver={handedOff}
              isLoading={isArchiving}
              onTakeOver={() => handleArchiveToggle(true)}
              onRevoke={() => handleArchiveToggle(false)}
            />
            <MessageThread messages={textMessages} loading={textsLoading} />
            {handedOff ? (
              <div className="shrink-0">
                <MessageComposer
                  customerName={displayName}
                  value={draft}
                  onChange={setDraft}
                  onSend={handleSendMessage}
                  isSending={isSending}
                />
              </div>
            ) : null}
          </div>
        )}

        {activeTab === "emails" && (
          <div className="flex min-h-[420px] flex-col overflow-hidden rounded-xl border border-[#E2E6EF] bg-white shadow-sm">
            <div className="border-b border-[#EEF0F5] px-4 py-3">
              <h3 className="text-[15px] font-semibold text-[#1A2333]">Emails</h3>
              <p className="text-[12px] text-[#8A93A6]">
                Email thread for {displayName}
              </p>
            </div>
            <div className="min-h-0 flex-1 space-y-3 overflow-y-auto px-4 py-4">
              {emailsLoading ? (
                <p className="py-8 text-center text-[13px] text-[#8A93A6]">
                  Loading emails…
                </p>
              ) : emails.length === 0 ? (
                <p className="py-8 text-center text-[13px] text-[#8A93A6]">
                  No emails found
                </p>
              ) : (
                emails.map((emailItem) => (
                  <EmailMessageCard key={emailItem.id} email={emailItem} />
                ))
              )}
            </div>
          </div>
        )}

        {activeTab === "calls" && (
          <div className="rounded-xl border border-[#E2E6EF] bg-white px-4 py-10 text-center shadow-sm">
            <p className="text-[14px] font-medium text-[#1A2333]">Calls coming soon</p>
            <p className="mt-1 text-[13px] text-[#8A93A6]">
              Call history for this customer will appear here.
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
