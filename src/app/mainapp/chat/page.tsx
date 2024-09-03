"use client"
import ChatMain from "./ChatMain"
import ChatTopBar from "./ChatTopBar"
import { useEffect } from "react"
import usePublicChat from "@/store/public_chat"
function ChatPage() {
    const { setPublicChat, setPublicChatHeaders } = usePublicChat()
    useEffect(() => {
        setPublicChat(false)
        setPublicChatHeaders({})
    }, [])
    return (
        <div className="border w-full border-[#D7D7D7] bg-white rounded-md flex flex-col text-[#333333] ">
            <ChatTopBar />
            <ChatMain />
        </div>
    )
}
export default ChatPage