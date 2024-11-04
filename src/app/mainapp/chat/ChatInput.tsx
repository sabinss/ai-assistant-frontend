import React, { useState, useEffect, useRef } from "react"
import { buttonVariants } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { IoMdSend } from "react-icons/io"
import http from "@/config/http"
import useFormStore from "@/store/formdata"
import useAuth from "@/store/user"
import useNavBarStore from "@/store/store"
import usePublicChat from "@/store/public_chat"
import useChatConfig from "@/store/useChatSetting"
import { MOCK_DATA } from "@/constants"
interface ChildProps {
  appendMessage: (newMessage: any) => void
}

const ChatInput: React.FC<ChildProps> = ({ appendMessage }) => {
  const { botName } = useNavBarStore()
  const { workflowFlag, setWorkFlowFlag, setSessionId, sessionId } =
    useChatConfig()
  const [message, setMessage] = useState("")
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const { access_token, user_data, chatSession } = useAuth() // Call useAuth here
  const { isMessageLoading, updateMessageLoading } = useFormStore()
  const { publicChat, publicChatHeaders } = usePublicChat()
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    async function getOrgDetails() {
      try {
        setIsLoading(true)
        const res = await http.get("/organization/", {
          headers: { Authorization: `Bearer ${access_token}` },
        })
        const orgData = res?.data?.org
        setWorkFlowFlag(orgData?.workflow_engine_enabled)
      } catch (e) {
        console.log(e)
      } finally {
        setIsLoading(false)
      }
    }
    getOrgDetails()
  }, [access_token])

  const sendMessage = async () => {
    if (message.trim() !== "") {
      let msg = message
      setMessage("") // Clear the textarea after sending the message
      await sendMessagetoBackend(msg) // Send the message to the backend
      if (textareaRef.current) {
        textareaRef.current.focus() // Focus back on the textarea
      }
    }
  }

  const sendMessagetoBackend = async (query: string) => {
    try {
      console.log("send message 1", sessionId)
      let res: any
      updateMessageLoading(true)
      appendMessage({ sender: "user", message, time: getClockTime(), id: "" }) // Add the message to the chat
      let start_time = Date.now()
      // const res = await http.sendMessage(user_data?.organization || publicChatHeaders?.org_id, query, chatSession || publicChatHeaders?.chat_session); //getting answer from api
      let end_time = Date.now()
      let totalTimeTookInSeconds = (end_time - start_time) / 1000
      if (publicChat) {
        res = await http.post(
          `/conversation/public/add?org_id=${publicChatHeaders?.org_id}&chat_session=${publicChatHeaders?.chat_session}`,
          {
            //adding to our backend question and answer
            question: query,
            // answer
          },
          { headers: publicChatHeaders }
        )
      } else {
        console.log("send message 2")

        res = await http.post(
          "/conversation/add",
          {
            //adding to our backend question and answer
            question: query,
            // answer,
            chatSession,
            workflowFlag,
            sessionId,
          },
          { headers: { Authorization: `Bearer ${access_token}` } }
        )
        console.log("conversation response", res)
        if (res?.data?.session_id) {
          setSessionId(res?.data?.session_id)
        }
      }

      // let answer = res_.results.answer
      const data = res?.data
      appendMessage({
        sender: botName,
        message: res?.data?.answer,
        time: getClockTime(),
        id: "ANS_" + data._id,
      }) // add to frontend
      updateMessageLoading(false)
    } catch (error) {
      console.log("error", error)
      updateMessageLoading(false)
      appendMessage({
        sender: botName,
        message: "!!Error Occured!!",
        time: getClockTime(),
        id: "error",
      }) // add to frontend
      console.log("error", error)
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    console.log("onchange")
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault() // Prevent default behavior of adding new line
      sendMessage()
    }
  }

  return (
    <div className="w-8/10 flex items-center rounded-md border border-[#D7D7D7] bg-background p-2 ">
      <textarea
        rows={1}
        ref={textareaRef}
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        onKeyDown={handleKeyPress}
        // disabled={isMessageLoading}
        placeholder={
          isMessageLoading ? "Analyzing......" : "Type your message here..."
        }
        className="flex min-h-9 w-full resize-none overflow-hidden border-none px-2 py-2 text-sm outline-none placeholder:text-muted-foreground active:border-none disabled:cursor-not-allowed"
      />
      <div className="m-2 flex w-20 items-center justify-center">
        <span className="text-sm text-[#838383]">{message?.length}/4000</span>
        <button
          type="button"
          onClick={sendMessage}
          className={cn(
            buttonVariants({ variant: "ghost", size: "icon" }),
            "h-9 w-9",
            "shrink-0 dark:bg-muted dark:text-muted-foreground dark:hover:bg-muted dark:hover:text-white"
          )}
        >
          <IoMdSend size={20} className=" text-[#174894]" />
        </button>
      </div>
    </div>
  )
}

export default ChatInput

//get clock time like 2:30 in js
function getClockTime() {
  return new Date().toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "numeric",
    hour12: true,
  })
}
