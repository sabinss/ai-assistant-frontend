import React, { useEffect, useRef } from "react"
import { MessageDiv } from "./MessageDiv"
import { MessageObject } from "./ChatMain"
import { motion } from "framer-motion"
import useNavBarStore from "@/store/store"
import useFormStore from "@/store/formdata"
interface ChatListProps {
  messages: MessageObject[]
}
const ChatList: React.FC<ChatListProps> = ({ messages }: ChatListProps) => {
  const { botName, greeting } = useNavBarStore()
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
  return (
    <div
      ref={chatListRef}
      className=" flex h-full w-full flex-col gap-5 overflow-y-scroll px-2"
    >
      <MessageDiv key="greeting" msg={greeting_message} />
      {messages.map((msg, index) => (
        <MessageDiv key={index} msg={msg} />
      ))}
      {isMessageLoading && (
        <motion.div
          initial={{ opacity: 0, scale: 0.5 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 1 }}
        >
          <MessageDiv
            msg={{
              sender: botName,
              message:
                "Thanks for waiting! If it were a human, you might be waiting for ages just for them to type this. Lucky for you, I'm quicker than a turbo-charged turtle. Just a sec!",
              time: "",
              id: "loading",
            }}
          />
        </motion.div>
      )}
    </div>
  )
}
export default ChatList
