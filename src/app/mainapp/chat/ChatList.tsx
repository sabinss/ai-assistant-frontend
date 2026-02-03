import React, { CSSProperties, useEffect, useRef } from "react"
import { MessageDiv } from "./MessageDiv"
import { MessageObject } from "./ChatMain"
import { motion } from "framer-motion"
import useNavBarStore from "@/store/store"
import useFormStore from "@/store/formdata"
import useChatConfig from "@/store/useChatSetting"
import BeatLoader from "react-spinners/BeatLoader"

interface ChatListProps {
  messages: MessageObject[]
}

const ChatList: React.FC<ChatListProps> = ({ messages }: ChatListProps) => {
  const { botName, greeting } = useNavBarStore()
  const { selectedAgentGreeting, selectedAgentName } = useChatConfig()
  const { isMessageLoading } = useFormStore()
  const chatListRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    // Scroll to the bottom when messages update
    if (chatListRef.current) {
      chatListRef.current.scrollTop = chatListRef.current.scrollHeight
    }
  }, [messages, isMessageLoading])

  const greeting_message = {
    sender: botName,
    time: "",
    message: greeting,
    id: "greeting",
  }

  const agent_greeting_message =
    selectedAgentGreeting && selectedAgentName
      ? {
        sender: selectedAgentName,
        time: "",
        message: selectedAgentGreeting,
        id: "agent_greeting",
      }
      : null

  const override: CSSProperties = {
    display: "block",
    marginLeft: "10px",
  }

  return (
    <div
      ref={chatListRef}
      className=" flex h-full w-full flex-col gap-5 overflow-y-scroll px-2"
    >
      <MessageDiv key="greeting" msg={greeting_message} />
      {agent_greeting_message && (
        <MessageDiv key="agent_greeting" msg={agent_greeting_message} />
      )}

      {messages.map((msg, index) => {
        // Check if this is a streaming message with a status
        if (msg.isStreaming && msg.status) {
          return (
            <div
              key={`${msg.id}-${index}`}
              style={{
                display: "flex",
                alignItems: "center",
                marginBottom: 20,
                marginLeft: 12,
              }}
            >
              <p
                style={{
                  fontSize: "14px",
                  fontWeight: "bold",
                  margin: 0,
                  lineHeight: "1",
                }}
              >
                {msg.status}
              </p>
              <BeatLoader
                style={{ marginTop: 8, marginLeft: 5 }}
                color={"#174894"}
                loading={true}
                cssOverride={override}
                size={10}
                aria-label="Loading Spinner"
                data-testid="loader"
              />
            </div>
          )
        }

        // Regular message or streaming message with content
        return <MessageDiv key={`${msg.id}-${index}`} msg={msg} />
      })}

      {isMessageLoading && !messages.some((msg) => msg.isStreaming) && (
        <div
          style={{
            display: "flex",
            alignItems: "center",
            marginBottom: 20,
            marginLeft: 12,
          }}
        >
          <p
            style={{
              fontSize: "18px",
              fontWeight: "bold",
              margin: 0,
              lineHeight: "1",
            }}
          >
            Analyzing
          </p>
          <BeatLoader
            style={{ marginTop: 8, marginLeft: 5 }}
            color={"#174894"}
            loading={true}
            cssOverride={override}
            size={10}
            aria-label="Loading Spinner"
            data-testid="loader"
          />
        </div>
      )}
    </div>
  )
}

export default ChatList
