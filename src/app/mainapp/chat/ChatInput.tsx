import React, { useState, useEffect, useRef } from "react"
import axios from "axios"
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
import useOrgCustomer from "@/store/organization_customer"
import { X } from "lucide-react"

interface ChildProps {
  appendMessage: (newMessage: any) => void
  agentList: [any]
}

const ChatInput: React.FC<ChildProps> = ({ appendMessage, agentList }) => {
  const { botName } = useNavBarStore()
  const { workflowFlag, setWorkFlowFlag, setSessionId, sessionId } =
    useChatConfig()
  const [message, setMessage] = useState("")
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const { access_token, user_data, chatSession, setChatSession } = useAuth() // Call useAuth here
  const { isMessageLoading, updateMessageLoading } = useFormStore()
  const { publicChat, publicChatHeaders } = usePublicChat()
  const { apiType } = useApiType()
  const [isLoading, setIsLoading] = useState(false)
  const [showDropdown, setShowDropdown] = useState(false)

  const [publicChatReponsePayload, setPublicChatResponse] = useState({
    user_email: null,
    customer_id: null,
  })
  const [selectedAgents, setSelectedAgents] = useState<any>([])

  const [selectedPrompt, setSelectedPrompt] = useState<any>("")

  const [showPopup, setShowPopup] = useState(false) // State to manage popup visibility
  // Sample list of text options
  console.log("showDropdown", showDropdown)
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

  const handleAgentSelect = (agentName: string, fromDropDown = false) => {
    setSelectedAgents([agentName])
    // if (fromDropDown) {
    //   setShowDropdown(false)
    //   // Remove the last agent from selectedAgents and add the new one
    //   setSelectedAgents((prevSelectedAgents: any) => {
    //     const updatedAgents = prevSelectedAgents.slice(0, -1) // Remove the last agent
    //     updatedAgents.push(agentName) // Add the new agent
    //     console.log("updatedAgents", updatedAgents)
    //     return updatedAgents // Update the state with the modified agents array
    //   })
    // } else {
    //   // If not from dropdown, just set the selected agent (overwrite the state)
    //   setSelectedAgents([agentName])
    // }
  }

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
    updateMessageLoading(true)
    appendMessage({
      sender: "user",
      message: query,
      time: getClockTime(),
      id: "",
    })

    try {
      if (publicChat) {
        // ...existing code...
      } else {
        if (apiType === "Customer Information") {
          await handleStreamingResponse(query)
        } else {
          await handleNonStreamingResponse(query)
        }
      }
    } catch (error) {
      console.error("Error sending message:", error)
      appendMessage({
        sender: botName,
        message: "!!Error Occurred!!",
        time: getClockTime(),
        id: "error",
      })
    } finally {
      updateMessageLoading(false)
    }
  }

  const handleStreamingResponse = async (query: string) => {
    const messageId = `stream_${Date.now()}`

    // Add initial message with loading status
    appendMessage({
      sender: botName,
      message: "",
      time: getClockTime(),
      id: messageId,
      isStreaming: true,
      status: "Analyzing your request...",
    })

    try {
      // Configure fetch for streaming SSE response instead of axios
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_APP_URL}/${process.env.NEXT_PUBLIC_APP_VERSION}/conversation/add`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${access_token}`,
          },
          body: JSON.stringify({
            question: query,
            chatSession,
            workflowFlag,
            sessionId,
            apiType,
            agentName: selectedAgents,
          }),
        }
      )

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      // Get the response as a ReadableStream
      const reader = response.body?.getReader()
      if (!reader) {
        throw new Error("Response body is not readable")
      }

      let fullMessage = ""
      let sessionIdFromResponse = null

      // Read the stream
      const decoder = new TextDecoder()
      let buffer = ""

      while (true) {
        const { done, value } = await reader.read()
        if (done) break

        // Decode the chunk and add it to our buffer
        buffer += decoder.decode(value, { stream: true })

        // Process complete SSE messages
        const lines = buffer.split("\n\n")
        buffer = lines.pop() || "" // Keep the last incomplete chunk

        for (const line of lines) {
          if (line.trim() && line.startsWith("data: ")) {
            try {
              const data = JSON.parse(line.substring(6))

              // Handle completion
              if (data.done) {
                // Update session ID if provided
                if (data.session_id) {
                  sessionIdFromResponse = data.session_id
                  setSessionId(data.session_id)
                } else {
                  console.warn("Session ID not found in response.")
                }
                continue
              }

              // Handle status updates (like "Analyzing query...")
              if (data.status) {
                appendMessage({
                  sender: botName,
                  message: fullMessage,
                  time: getClockTime(),
                  id: messageId,
                  isStreaming: true,
                  status: data.status,
                })
              }

              // Handle actual message content
              if (data.message) {
                fullMessage += data.message
                appendMessage({
                  sender: botName,
                  message: fullMessage,
                  time: getClockTime(),
                  id: messageId,
                  isStreaming: true,
                })
              }
            } catch (e) {
              console.error("Error parsing stream data:", e)
            }
          }
        }
      }

      // Final message update after stream completes
      appendMessage({
        sender: botName,
        message: fullMessage,
        time: getClockTime(),
        id: messageId,
        isStreaming: false,
      })
    } catch (error) {
      console.error("Stream error:", error)
      appendMessage({
        sender: botName,
        message: "Error occurred while streaming the response.",
        time: getClockTime(),
        id: messageId,
        isStreaming: false,
      })
    }
  }

  const handleNonStreamingResponse = async (query: string) => {
    const res = await http.post(
      "/conversation/add",
      {
        question: query,
        chatSession,
        workflowFlag,
        sessionId,
        apiType,
        agentName: selectedAgents,
      },
      { headers: { Authorization: `Bearer ${access_token}` } }
    )

    if (res?.data?.session_id) {
      setSessionId(res?.data?.session_id)
    }

    appendMessage({
      sender: botName,
      message: res?.data?.answer,
      time: getClockTime(),
      id: "ANS_" + res?.data?._id,
    })
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
  const handleAgentRemove = (agentName: string) => {
    const newSession = Math.floor(Math.random() * 1000).toString()
    setSessionId(newSession)
    setSelectedAgents((prevAgents: any) =>
      prevAgents.includes(agentName) ? [] : [agentName]
    )
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
          placeholder={isMessageLoading ? "....." : "Type your message here..."}
          className="flex max-h-36 min-h-9 w-full resize-none overflow-y-auto border-none px-2 py-2 text-sm outline-none placeholder:text-muted-foreground active:border-none disabled:cursor-not-allowed"
        />
        {/* Lightbulb Icon Button to Open Popup */}
        {/* publicChat */}
        <div className="absolute bottom-2 left-5 right-2 mb-2 flex items-center gap-3">
          {agentList.slice(0, 4).map((agent: any, index: number) => (
            <div
              onClick={() => handleAgentRemove(agent.name)}
              key={index}
              className={`flex items-center gap-2 rounded-full border px-3 py-1 text-sm font-medium transition-all duration-200 ${
                selectedAgents.includes(agent.name)
                  ? "bg-blue-500 text-white shadow-md hover:bg-blue-600"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200 hover:shadow-sm"
              }`}
            >
              {agent.name}
            </div>
          ))}
          {/* {agentList.length > 3 && (
            <button
              onClick={() => setShowDropdown(!showDropdown)}
              className="rounded-full border bg-gray-200 px-3 py-1 text-sm font-medium hover:bg-gray-300"
            >
              ...
            </button>
          )} */}
          {/* Dropdown for Remaining Agents */}
          {/* {showDropdown && (
            <div className="absolute bottom-[calc(100%+8px)] left-0 z-50 w-40 overflow-visible rounded-md border bg-white shadow-md">
              {agentList.slice(3).map((agent: any, index: number) => (
                <div
                  key={index}
                  onClick={() => handleAgentSelect(agent.name, true)}
                  className="cursor-pointer px-3 py-2 text-sm hover:bg-gray-100"
                >
                  {agent.name}
                </div>
              ))}
            </div>
          )} */}
        </div>
        {!publicChat && (
          <button
            type="button"
            onClick={togglePopup}
            className="mx-2 rounded-md bg-gray-200 p-2 hover:bg-gray-300"
          >
            <FaRegLightbulb size={18} />
          </button>
        )}

        <div className="m-2 flex w-20 items-center justify-center">
          <span className="text-sm text-[#838383]">{message?.length}/4000</span>
          <button
            type="button"
            onClick={sendMessage}
            disabled={isMessageLoading || message.length === 0}
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
            className="fixed inset-0 flex items-center justify-end bg-black bg-opacity-50"
            onClick={handleBackgroundClick} // Close when clicking outside
          >
            <div className="mr-20 w-[75%] max-w-[1200px] rounded-lg bg-white p-8 shadow-lg">
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
                        <React.Fragment key={promptIndex}>
                          <li
                            className="cursor-pointer text-gray-700 hover:text-blue-500"
                            onClick={() => handlePromptClick(prompt)} // Handle prompt click
                          >
                            {prompt}
                          </li>
                          {promptIndex !== categoryData.prompts.length - 1 && (
                            <hr className="border-gray-300" />
                          )}
                        </React.Fragment>
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
// comment for backup
// {showPopup && (
//   <div
//     className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50"
//     onClick={handleBackgroundClick} // Close when clicking outside
//   >
//     <div className="w-[70%] max-w-[1100px]  rounded-lg bg-white p-6 shadow-lg">
//       <h2 className="mb-4 text-center text-2xl font-semibold">
//         Select Prompt
//       </h2>

//       {/* Columns for Categories */}
//       <div className="grid grid-cols-3 gap-6">
//         {CHAT_PROMPTS.map((categoryData, index) => (
//           <div key={index} className="rounded-lg bg-gray-50 p-4 shadow">
//             <h3 className="text-xl font-semibold">
//               {categoryData.category}
//             </h3>
//             <ul className="mt-2 space-y-2">
//               {categoryData.prompts.map((prompt, promptIndex) => (
//                 <>
//                   <li
//                     key={promptIndex}
//                     className="cursor-pointer text-gray-700 hover:text-blue-500"
//                     onClick={() => handlePromptClick(prompt)} // Handle prompt click
//                   >
//                     {prompt}
//                   </li>
//                   {promptIndex !== categoryData.prompts.length - 1 && (
//                     <hr className="border-gray-300" />
//                   )}
//                 </>
//               ))}
//             </ul>
//           </div>
//         ))}
//       </div>

//       <div className="mt-4 flex justify-end">
//         <button
//           onClick={() => setShowPopup(false)}
//           className="rounded bg-red-500 px-4 py-2 text-white hover:bg-red-600"
//         >
//           Close
//         </button>
//       </div>
//     </div>
//   </div>
// )}
