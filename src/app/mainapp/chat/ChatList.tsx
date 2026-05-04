import React, { useEffect, useRef } from "react"
import { MessageDiv } from "./MessageDiv"
import { MessageObject } from "./ChatMain"
import { motion } from "framer-motion"
import useNavBarStore from "@/store/store"
import useFormStore from "@/store/formdata"
import useChatConfig from "@/store/useChatSetting"
import usePublicChat from "@/store/public_chat"
interface ChatListProps {
  messages: MessageObject[]
}

const ChatList: React.FC<ChatListProps> = ({ messages }: ChatListProps) => {
  const { publicChat } = usePublicChat()
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
    sender: publicChat ? (botName ?? "Gabby") : botName,
    time: "",
    message: publicChat
      ? typeof greeting === "string"
        ? greeting
        : "Hello X"
      : greeting,
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

  return (
    <div
      ref={chatListRef}
      className="flex h-full w-full flex-col gap-2.5 overflow-y-scroll bg-[#F4F6FA] px-3.5 py-3.5 font-sans"
    >
      <MessageDiv key="greeting" msg={greeting_message} />

      {/* Agent greeting stays in chat when agent is selected, shown after default greeting and before messages */}
      {agent_greeting_message && (
        <MessageDiv key="agent_greeting" msg={agent_greeting_message} />
      )}

      {messages.map((msg, index) => {
        // Check if this is a streaming message with a status
        if (msg.isStreaming && msg.status) {
          return (
            <div key={`${msg.id}-${index}`} className="flex flex-col items-start gap-1">
              <div
                className="flex max-w-[90%] flex-wrap items-center gap-2 rounded-[10px] border border-[#E2E6EF] bg-white px-3 py-2"
                style={{ borderBottomLeftRadius: 3 }}
              >
                <p className="m-0 text-[13px] font-semibold leading-none text-[#1A1F2E]">
                  {msg.status}
                </p>
                <span className="inline-flex gap-1">
                  {[0, 150, 300].map((d) => (
                    <span
                      key={d}
                      className="inline-block h-[5px] w-[5px] rounded-full bg-[#8B91A3]"
                      style={{
                        animation: "chatTypingBounce 1.2s ease-in-out infinite",
                        animationDelay: `${d}ms`,
                      }}
                    />
                  ))}
                </span>
              </div>
            </div>
          )
        }

        // Regular message or streaming message with content
        return <MessageDiv key={`${msg.id}-${index}`} msg={msg} />
      })}

      {isMessageLoading && !messages.some((msg) => msg.isStreaming) && (
        <div className="flex flex-col items-start gap-1">
          <div
            className="flex max-w-[90%] flex-wrap items-center gap-2 rounded-[10px] border border-[#E2E6EF] bg-white px-3 py-2"
            style={{ borderBottomLeftRadius: 3 }}
          >
            <p className="m-0 text-[13px] font-semibold leading-none text-[#1A1F2E]">Analyzing</p>
            <span className="inline-flex gap-1">
              {[0, 150, 300].map((d) => (
                <span
                  key={d}
                  className="inline-block h-[5px] w-[5px] rounded-full bg-[#8B91A3]"
                  style={{
                    animation: "chatTypingBounce 1.2s ease-in-out infinite",
                    animationDelay: `${d}ms`,
                  }}
                />
              ))}
            </span>
          </div>
        </div>
      )}
      <style>{`
        @keyframes chatTypingBounce {
          0%, 80%, 100% { transform: translateY(0); }
          40% { transform: translateY(-4px); }
        }
      `}</style>
    </div>
  )
}

export default ChatList
