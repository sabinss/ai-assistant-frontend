import React, { useEffect, useRef, useState } from "react"
import ChatInput from "./ChatInput"
import ChatList from "./ChatList"
import http from "@/config/http"
import useAuth from "@/store/user"
import useNavBarStore from "@/store/store"
import usePublicChat from "@/store/public_chat"
import useOrgCustomer from "@/store/organization_customer"
import useChatConfig from "@/store/useChatSetting"
export interface MessageObject {
  id: string
  sender: string
  message: string
  status?: string
  liked?: boolean
  time: string
  disliked?: boolean
  isStreaming?: boolean
}

export interface ChatMainProps {
  initialQuery?: string | null
  /** Expand to fill a flex parent (e.g. Action Centre chat page) instead of fixed viewport height */
  fillContainer?: boolean
}

const ChatMain: React.FC<ChatMainProps> = ({ initialQuery, fillContainer }) => {
  const [messages, setMessages] = useState<MessageObject[]>([])
  const { user_data, access_token, chatSession, setChatSession } = useAuth()
  const { greeting, botName, setBotName, setGreeting } = useNavBarStore()
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const { setOrgAgents } = useOrgCustomer()
  const [agentList, setAgentList] = useState<any>([])

  const { publicChat, publicChatHeaders, setPublicChatHeaders } =
    usePublicChat()
  const { sessionId, newSessionKey, selectedAgentName, skipNextHistoryLoad, clearSkipNextHistoryLoad } = useChatConfig()
  const skipNextLoadHistoryRef = useRef(false)
  const prevNewSessionKeyRef = useRef<number | undefined>(undefined)

  useEffect(() => {
    console.log("ChatMain")
    const fetchBotNameAndMessages = async () => {
      // Public/Help: do not clear here — GET /conversations/public often returns the newest
      // row with an empty `answer` before the DB matches POST; clearing would wipe the reply we just showed.
      if (!publicChat) {
        setMessages([])
      }
      setIsLoading(true)
      try {
        if (greeting === "Hello X" || botName === "Bot X") {
          // only fetch if it hasn't fetched, by default the zustand store will have Hello X
          await fetchBotData()
        }

        // When an agent is selected, treat as new session: do not load old chat history
        // When user clicked "New Session", skip loading history (skipNextHistoryLoad set synchronously in store; ref is backup)
        const shouldSkipHistory =
          selectedAgentName || skipNextLoadHistoryRef.current || skipNextHistoryLoad
        if (!shouldSkipHistory) {
          await getUserMessages()
        }
        skipNextLoadHistoryRef.current = false
        clearSkipNextHistoryLoad()
      } catch (error) {
        console.error("Error fetching data:", error)
        setError("Error fetching data")
      } finally {
        setIsLoading(false)
      }
    }

    fetchBotNameAndMessages()
  }, [user_data, access_token, chatSession, publicChat, publicChatHeaders, newSessionKey])

  useEffect(() => {
    if (publicChat) return
    async function getOrgAgentList() {
      await fetchOrgAgentInstructions()
    }
    getOrgAgentList()
  }, [publicChat])

  useEffect(() => {
    setMessages([])
    // Only skip loading history when user explicitly triggered "New Session" (newSessionKey incremented), not on initial load
    const isUserTriggeredNewSession =
      prevNewSessionKeyRef.current !== undefined &&
      newSessionKey !== prevNewSessionKeyRef.current
    prevNewSessionKeyRef.current = newSessionKey
    if (isUserTriggeredNewSession) {
      skipNextLoadHistoryRef.current = true
    }
  }, [sessionId, newSessionKey])

  // When user selects an agent, clear messages immediately so only greeting shows (new session)
  useEffect(() => {
    if (selectedAgentName) {
      setMessages([])
    }
  }, [selectedAgentName])

  const fetchBotData = async () => {
    let org_id
    if (publicChat) {
      org_id = (publicChatHeaders as any)?.org_id
    } else {
      org_id = user_data?.organization
    }
    if (!org_id) return

    if (publicChat) {
      try {
        const response = await http.get(
          "/organization/greeting_botname?org_id=" + org_id
        )
        const org_data = response?.data
        if (org_data?.assistant_name != null && org_data.assistant_name !== "") {
          setBotName(String(org_data.assistant_name))
        }
        if (org_data?.greeting != null && org_data.greeting !== "") {
          setGreeting(String(org_data.greeting))
        }
      } catch {
        /* public embed: keep defaults on timeout / errors */
      }
      return
    }

    const response = await http.get(
      "/organization/greeting_botname?org_id=" + org_id
    )
    const org_data = response?.data
    setBotName(org_data?.assistant_name)
    setGreeting(org_data?.greeting)
  }

  const fetchOrgAgentInstructions = async () => {
    try {
      // const response = await http.get("/organization/agent/instruction", {
      //   headers: { Authorization: `Bearer ${access_token}` },
      // })
      const response = await http.get("/organization/agent/instruction", {
        params: { from: "chat" },
        headers: { Authorization: `Bearer ${access_token}` },
      })

      const agentsRecords: any = response?.data?.data
        ? response?.data?.data.filter((x: any) => x?.active == true)
        : []

      if (agentsRecords.length > 0) {
        setOrgAgents(agentsRecords)
      }

      setAgentList(agentsRecords)
    } catch (err: any) { }
  }

  const getUserMessages = async () => {
    // Capture session we're fetching for so we can ignore stale responses
    const sessionWeAreFetching =
      publicChat
        ? (publicChatHeaders as { chat_session?: string })?.chat_session
        : chatSession

    let res
    try {
      if (publicChat) {
        res = await http.get(
          `/conversations/public?org_id=${(publicChatHeaders as any)?.org_id}`,
          {
            headers: publicChatHeaders,
          }
        )
      } else {
        res = await http.get(
          `/conversations?user_id=${user_data?.user_id}&chatSession=${chatSession}`,
          {
            headers: { Authorization: `Bearer ${access_token}` },
          }
        )
      }

      // Ignore response if session changed while we were fetching (e.g. user clicked New Session)
      const currentSession = publicChat
        ? (usePublicChat.getState().publicChatHeaders as { chat_session?: string })?.chat_session
        : useAuth.getState().chatSession
      if (currentSession !== sessionWeAreFetching) return

      const raw = res?.data
      const messageArray = Array.isArray(raw)
        ? raw
        : raw && typeof raw === "object" && Array.isArray((raw as { data?: unknown }).data)
          ? (raw as { data: any[] }).data
          : []

      const next: MessageObject[] = []
      messageArray?.forEach((message: any) => {
        if (!message || typeof message !== "object") return
        const answerRaw =
          message.answer ?? message.response ?? message.text ?? message.reply ?? message.content
        const answerText =
          typeof answerRaw === "string"
            ? answerRaw
            : answerRaw != null && typeof answerRaw !== "object"
              ? String(answerRaw)
              : ""
        const msgTime = safeFormatMessageTime(message.createdAt)
        const rowId = message._id != null ? String(message._id) : ""
        if (!rowId) return
        next.push({
          id: rowId,
          sender: "user",
          message: message.question ?? "",
          time: msgTime,
          liked: false,
          disliked: false,
        })
        next.push({
          id: `ANS_${rowId}`,
          sender: publicChat ? (botName ?? "Gabby") : botName,
          message: answerText,
          time: msgTime,
          liked: message.liked_disliked === "liked",
          disliked: message.liked_disliked === "disliked",
        })
      })

      setMessages((prev) =>
        next.map((m) => {
          if (m.sender !== "user" && (!m.message || !String(m.message).trim())) {
            const old = prev.find((p) => p.id === m.id)
            if (old?.message && String(old.message).trim()) {
              return { ...m, message: old.message }
            }
          }
          return m
        })
      )
    } catch (error) {
      console.error("Error fetching user messages:", error)
      setError("Error fetching user messages")
    }
  }

  const appendMessage = (message: MessageObject) => {
    setMessages((prevMessages) => {
      // Check if this is an update to an existing streaming message
      if (message.id && message.id.startsWith("stream_")) {
        const existingIndex = prevMessages.findIndex((m) => m.id === message.id)
        if (existingIndex !== -1) {
          const updatedMessages = [...prevMessages]
          updatedMessages[existingIndex] = message
          return updatedMessages
        }
      }
      return [...prevMessages, message]
    })
  }

  return (
    <div
      className={`mx-1 flex flex-col px-1 ${
        publicChat
          ? "min-h-0 flex-1 overflow-hidden"
          : fillContainer
            ? "min-h-0 flex-1 overflow-hidden"
            : "h-[75vh] md:h-[77vh]"
      } `}
    >
      {error && <div className="mb-2 bg-red-500 p-2 text-white">{error}</div>}

      {isLoading && (
        <div className="mb-2 bg-gray-200 p-2 text-gray-700">Loading...</div>
      )}
      <div className={publicChat ? "min-h-0 flex-1 overflow-hidden" : "min-h-0 flex-1"}>
        <ChatList messages={messages} />
      </div>
      <div className="shrink-0">
        <ChatInput
          appendMessage={appendMessage}
          agentList={agentList}
          initialQuery={initialQuery}
          historyLoading={publicChat && isLoading}
        />
      </div>
    </div>
  )
}

function formatDate(dateStr: string) {
  const date = new Date(dateStr)
  if (Number.isNaN(date.getTime())) return ""
  const options: Intl.DateTimeFormatOptions = {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  }
  return new Intl.DateTimeFormat("en-US", options).format(date)
}

function safeFormatMessageTime(createdAt: unknown): string {
  if (createdAt == null) return ""
  try {
    const s =
      typeof createdAt === "string"
        ? createdAt
        : typeof (createdAt as { toString?: () => string })?.toString ===
            "function"
          ? (createdAt as { toString: () => string }).toString()
          : String(createdAt)
    return formatDate(s)
  } catch {
    return ""
  }
}

export default ChatMain
