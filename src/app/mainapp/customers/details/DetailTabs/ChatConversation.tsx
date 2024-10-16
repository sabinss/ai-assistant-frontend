"use client"
import ConvoGraph from "@/app/mainapp/admin/convograph"
import React, { useEffect } from "react"

const ChatConversation = ({ customerInfo }: any) => {
  useEffect(() => {
    console.log("ChatConversation>", customerInfo)
  }, [customerInfo?._id])
  return (
    <div className="mb-10 rounded-md bg-white p-4">
      <ConvoGraph customerId={customerInfo?._id} />
    </div>
  )
}

export default ChatConversation
