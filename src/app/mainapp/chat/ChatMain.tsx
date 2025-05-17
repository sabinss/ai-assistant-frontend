import React, { useEffect, useState } from "react"
import ChatInput from "./ChatInput"
import ChatList from "./ChatList"
import http from "@/config/http"
import useAuth from "@/store/user"
import useNavBarStore from "@/store/store"
import usePublicChat from "@/store/public_chat"
import useOrgCustomer from "@/store/organization_customer"
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

const ChatMain: React.FC = () => {
  const [messages, setMessages] = useState<MessageObject[]>([])
  const { user_data, access_token, chatSession } = useAuth()
  const { greeting, botName, setBotName, setGreeting } = useNavBarStore()
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const { setOrgAgents } = useOrgCustomer()
  const [agentList, setAgentList] = useState<any>([])

  const { publicChat, publicChatHeaders, setPublicChatHeaders } =
    usePublicChat()

  useEffect(() => {
    const fetchBotNameAndMessages = async () => {
      setIsLoading(true)
      try {
        if (greeting === "Hello X" || botName === "Bot X") {
          // only fetch if it hasn't fetched, by default the zustand store will have Hello X
          await fetchBotData()
        }

        await getUserMessages()
      } catch (error) {
        console.error("Error fetching data:", error)
        setError("Error fetching data")
      } finally {
        setIsLoading(false)
      }
    }

    fetchBotNameAndMessages()
  }, [user_data, access_token, chatSession, publicChat, publicChatHeaders])
  useEffect(() => {
    async function getOrgAgentList() {
      await fetchOrgAgentInstructions()
    }
    getOrgAgentList()
  }, [])

  const fetchBotData = async () => {
    let org_id
    if (publicChat) {
      org_id = publicChatHeaders?.org_id
    } else {
      org_id = user_data?.organization
    }
    const response = await http.get(
      "/organization/greeting_botname?org_id=" + org_id
    )
    const org_data = response?.data
    console.log("we are setting organization here", org_data)
    setBotName(org_data?.assistant_name)
    setGreeting(org_data?.greeting)
  }

  const fetchOrgAgentInstructions = async () => {
    try {
      const response = await http.get("/organization/agent/instruction", {
        headers: { Authorization: `Bearer ${access_token}` },
      })

      const agentsRecords: any = response?.data?.data
        ? response?.data?.data.filter((x: any) => x?.active == true)
        : []
      console.log("Agent List Chat Input", agentsRecords)

      if (agentsRecords.length > 0) {
        setOrgAgents(agentsRecords)
      }

      setAgentList(agentsRecords)
    } catch (err: any) {}
  }

  const getUserMessages = async () => {
    let res
    try {
      if (publicChat) {
        res = await http.get(
          `/conversations/public?org_id=${publicChatHeaders?.org_id}`,
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
      const messageArray = res?.data || []
      setMessages([])
      messageArray?.forEach((message: any) => {
        appendMessage({
          id: message._id,
          sender: "user",
          message: message.question,
          time: formatDate(message.createdAt.toString()),
          liked: false,
          disliked: false,
        })
        appendMessage({
          id: `ANS_${message._id}`,
          sender: botName,
          message: message.answer,
          time: formatDate(message.createdAt.toString()),
          liked: message.liked_disliked === "liked",
          disliked: message.liked_disliked === "disliked",
        })
      })
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
      className={`mx-1 flex    flex-col px-1 ${publicChat ? "h-[90vh] md:h-[87vh]" : "h-[75vh] md:h-[77vh]"} `}
    >
      {error && <div className="mb-2 bg-red-500 p-2 text-white">{error}</div>}

      {isLoading && (
        <div className="mb-2 bg-gray-200 p-2 text-gray-700">Loading...</div>
      )}
      <ChatList messages={messages} />
      <ChatInput appendMessage={appendMessage} agentList={agentList} />
    </div>
  )
}

function formatDate(dateStr: string) {
  const date = new Date(dateStr)
  const options = {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  }
  return new Intl.DateTimeFormat("en-US", options).format(date)
}

export default ChatMain
