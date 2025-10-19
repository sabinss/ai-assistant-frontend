"use client"
import ChatMain from "./ChatMain"
import ChatTopBar from "./ChatTopBar"
import { useEffect } from "react"
import { useSearchParams } from "next/navigation"
import usePublicChat from "@/store/public_chat"

function ChatPage() {
  const { setPublicChat, setPublicChatHeaders } = usePublicChat()
  const searchParams = useSearchParams()

  useEffect(() => {
    setPublicChat(false)
    setPublicChatHeaders({})
  }, [])

  // Get query parameter from URL
  const queryParam = searchParams.get("query")

  return (
    <div className="flex w-full flex-col rounded-md border border-[#D7D7D7] bg-white text-[#333333] ">
      <ChatTopBar />
      <ChatMain initialQuery={queryParam} />
    </div>
  )
}
export default ChatPage
