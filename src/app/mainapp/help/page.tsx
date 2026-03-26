"use client"

import ChatMain from "../chat/ChatMain"
import ChatTopBar from "../chat/ChatTopBar"
import useAuth from "@/store/user"

const HelpPage = () => {
  const { user_data } = useAuth()
  const publicChatLink = `${process?.env?.NEXT_PUBLIC_APP_FE_URL}/public_chat?org_id=${user_data?.organization}`
  const embedCode = `<div dataOrg="${user_data?.organization}" id="embed-container" style="font-size: 16px;"></div>
<script src="${process?.env?.NEXT_PUBLIC_APP_FE_URL}/embedchat.js"></script>`

  return (
    <div className="flex w-full flex-col gap-3">
      <div className="flex w-full items-center justify-end gap-2 rounded-md border border-[#D7D7D7] bg-white p-3">
        <button
          className="rounded border px-3 py-1 text-sm text-[#333333] hover:bg-gray-100"
          onClick={() => navigator.clipboard.writeText(publicChatLink)}
        >
          Click to copy link
        </button>
        <button
          className="rounded border px-3 py-1 text-sm text-[#333333] hover:bg-gray-100"
          onClick={() => navigator.clipboard.writeText(embedCode)}
        >
          Click to copy EmbedCode
        </button>
      </div>
      <div className="flex w-full flex-col rounded-md border border-[#D7D7D7] bg-white text-[#333333]">
        <ChatTopBar />
        <ChatMain />
      </div>
    </div>
  )
}

export default HelpPage