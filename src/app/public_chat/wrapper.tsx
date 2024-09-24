"use client"
import { useSearchParams } from "next/navigation"
import { useEffect, useState } from "react"
import usePublicChat from "@/store/public_chat"
import ChatMain from "../mainapp/chat/ChatMain"
import ChatTopbar from "../mainapp/chat/ChatTopBar"

export default function Wrapper() {
  const searchParams = useSearchParams()
  const { setPublicChat, setPublicChatHeaders, publicChat } = usePublicChat()
  useEffect(() => {
    async function setSession() {
      let chat_session = localStorage.getItem("chat_session_agile_move")
      if (!chat_session) {
        chat_session = Math.floor(Math.random() * 9000).toString()
        localStorage.setItem("chat_session_agile_move", chat_session)
      }
      const headers = {
        org_id: searchParams.get("org_id"),
        chat_session: chat_session,
      }
      setPublicChatHeaders(headers)
      setPublicChat(true)
    }

    setSession()
  }, [])

  return (
    <>
      {publicChat && (
        <div className="flex h-screen w-full flex-col rounded-md border border-[#D7D7D7] bg-white p-1 text-[#333333]">
          <ChatTopbar />
          <ChatMain />
        </div>
      )}
    </>
  )
}
