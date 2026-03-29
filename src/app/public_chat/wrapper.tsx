"use client"
import { useSearchParams } from "next/navigation"
import { useEffect, useState } from "react"
import usePublicChat from "@/store/public_chat"
import { generateSessionIdLength5 } from "@/lib/utils"
import ChatMain from "../mainapp/chat/ChatMain"
import ChatTopbar from "../mainapp/chat/ChatTopBar"

export default function Wrapper() {
  const searchParams = useSearchParams()
  const {
    setPublicChat,
    setPublicChatHeaders,
    setPublicVisitorDisplayName,
    publicChat,
  } = usePublicChat()

  const orgId = searchParams.get("org_id")
  const userNameParam =
    searchParams.get("user_name") ?? searchParams.get("display_name")

  useEffect(() => {
    async function setSession() {
      let chat_session = localStorage.getItem("chat_session_agile_move")
      if (!chat_session) {
        chat_session = String(generateSessionIdLength5())
        localStorage.setItem("chat_session_agile_move", chat_session)
      }
      const headers = {
        org_id: orgId,
        chat_session: chat_session,
      }
      setPublicChatHeaders(headers)
      setPublicChat(true)
    }

    setSession()
  }, [orgId, setPublicChat, setPublicChatHeaders])

  useEffect(() => {
    const trimmed = userNameParam?.trim() || null
    setPublicVisitorDisplayName(trimmed)
    return () => setPublicVisitorDisplayName(null)
  }, [userNameParam, setPublicVisitorDisplayName])

  return (
    <>
      {publicChat && (
        <div className="flex h-screen min-h-0 w-full flex-col overflow-hidden rounded-md border border-[#D7D7D7] bg-white p-1 text-[#333333]">
          <ChatTopbar />
          <ChatMain />
        </div>
      )}
    </>
  )
}
