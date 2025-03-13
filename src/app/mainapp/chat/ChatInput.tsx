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
import useApiType from "@/store/apiType"
import { FaRegLightbulb } from "react-icons/fa"
import CHAT_PROMPTS from "./chat-prompt"
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
  const { apiType } = useApiType()
  const [isLoading, setIsLoading] = useState(false)
  const [publicChatReponsePayload, setPublicChatResponse] = useState({
    user_email: null,
    customer_id: null,
  })
  const [selectedPrompt, setSelectedPrompt] = useState("")

  const [showPopup, setShowPopup] = useState(false) // State to manage popup visibility
  console.log("CHAT_PROMPTS", CHAT_PROMPTS)
  // Sample list of text options

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
      console.log("send message 1", sessionId, publicChatReponsePayload)
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
            user_email: publicChatReponsePayload.user_email,
            customer_id: publicChatReponsePayload.customer_id,
            // answer
          },
          { headers: publicChatHeaders }
        )
        console.log(
          "public chat response",
          res.data.user_email,
          res.data.customer_id
        )
        if (res.data) {
          setPublicChatResponse((prevState) => ({
            ...prevState,
            user_email: res.data.user_email || null,
            customer_id: res.data.customer_id || null,
          }))
        }
      } else {
        res = await http.post(
          "/conversation/add",
          {
            //adding to our backend question and answer
            question: query,
            // answer,
            chatSession,
            workflowFlag,
            sessionId,
            apiType,
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
  const togglePopup = () => {
    setShowPopup(!showPopup) // Toggle popup on button click
  }

  const handleTextClick = (text: string) => {
    setMessage((prev) => prev + text) // Append text to textarea
    setShowPopup(false) // Close popup
    textareaRef.current?.focus() // Refocus textarea
  }

  // Close popup when clicking outside
  const handleBackgroundClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) {
      setShowPopup(false)
    }
  }
  // Handle prompt selection
  const handlePromptClick = (prompt: string) => {
    // setSelectedPrompt(prompt)
    setMessage(prompt)
    setShowPopup(false) // Close the popup when a prompt is selected.
  }
  // Handle textarea input resizing
  const handleInput = () => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto"
      textareaRef.current.style.height = `${Math.min(
        textareaRef.current.scrollHeight,
        150
      )}px`
    }
  }

  return (
    <div className="sticky bottom-0 border-t border-gray-300 bg-white p-3">
      <div className="w-8/10 flex items-center rounded-md border border-[#D7D7D7] bg-background p-2 ">
        <textarea
          rows={3}
          ref={textareaRef}
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          onKeyDown={handleKeyPress}
          onInput={handleInput}
          // onInput={() => {
          //   textareaRef.current.style.height = "auto"
          //   textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 150)}px`
          // }}
          // disabled={isMessageLoading}
          placeholder={
            isMessageLoading ? "......" : "Type your message here..."
          }
          className="flex max-h-36 min-h-9 w-full resize-none overflow-y-auto border-none px-2 py-2 text-sm outline-none placeholder:text-muted-foreground active:border-none disabled:cursor-not-allowed"
        />
        {/* Lightbulb Icon Button to Open Popup */}

        <button
          type="button"
          onClick={togglePopup}
          className="mx-2 rounded-md bg-gray-200 p-2 hover:bg-gray-300"
        >
          <FaRegLightbulb size={18} />
        </button>
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
        {/* Popup - Show only when 'showPopup' is true */}
        {/* Popup Modal */}
        {showPopup && (
          <div
            className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50"
            onClick={handleBackgroundClick} // Close when clicking outside
          >
            <div className="w-3/4 max-w-4xl rounded-lg bg-white p-6 shadow-lg">
              <h2 className="mb-4 text-center text-2xl font-semibold">
                Select Prompt
              </h2>

              {/* Columns for Categories */}
              <div className="grid grid-cols-3 gap-6">
                {CHAT_PROMPTS.map((categoryData, index) => (
                  <div key={index} className="rounded-lg bg-gray-50 p-4 shadow">
                    <h3 className="text-xl font-semibold">
                      {categoryData.category}
                    </h3>
                    <ul className="mt-2 space-y-2">
                      {categoryData.prompts.map((prompt, promptIndex) => (
                        <li
                          key={promptIndex}
                          className="cursor-pointer text-gray-700 hover:text-blue-500"
                          onClick={() => handlePromptClick(prompt)} // Handle prompt click
                        >
                          {prompt}
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>

              <div className="mt-4 flex justify-end">
                <button
                  onClick={() => setShowPopup(false)}
                  className="rounded bg-red-500 px-4 py-2 text-white hover:bg-red-600"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        )}
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
