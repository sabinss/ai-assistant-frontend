import React, { CSSProperties, useEffect, useRef } from "react"
import { MessageDiv } from "./MessageDiv"
import { MessageObject } from "./ChatMain"
import { motion } from "framer-motion"
import useNavBarStore from "@/store/store"
import useFormStore from "@/store/formdata"
import BeatLoader from "react-spinners/BeatLoader"

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
      {messages.map((msg, index) => (
        <MessageDiv key={index} msg={msg} />
      ))}
      {isMessageLoading && (
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
            size={10} // Adjust size as needed
            aria-label="Loading Spinner"
            data-testid="loader"
          />
        </div>
        // <motion.div
        //   initial={{ opacity: 0, scale: 0.5 }}
        //   animate={{ opacity: 1, scale: 1 }}
        //   transition={{ duration: 1 }}
        // >
        //   {/* <MessageDiv
        //     msg={{
        //       sender: botName,
        //       message:
        //         "Thanks for waiting! If it were a human, you might be waiting for ages just for them to type this. Lucky for you, I'm quicker than a turbo-charged turtle. Just a sec!",
        //       time: "",
        //       id: "loading",
        //     }}
        //   /> */}
        //   <MessageDiv
        //     msg={{
        //       sender: botName,
        //       message: "Analyzing...",
        //       time: "",
        //       id: "loading",
        //     }}
        //   />
        // </motion.div>
      )}
    </div>
  )
}
export default ChatList
