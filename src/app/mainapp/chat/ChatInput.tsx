import React, { useState, useEffect, useRef } from "react"
import { generateSessionIdLength5 } from "@/lib/utils"
import { MdStop } from "react-icons/md"
import http from "@/config/http"
import useFormStore from "@/store/formdata"
import useAuth from "@/store/user"
import useNavBarStore from "@/store/store"
import usePublicChat from "@/store/public_chat"
import useChatConfig from "@/store/useChatSetting"
import useApiType from "@/store/apiType"
import { FaRegLightbulb } from "react-icons/fa"
import CHAT_PROMPTS from "./chat-prompt"
import { runPublicConversationAdd, type PublicChatPayload } from "./publicConversationAdd"

interface ChildProps {
  appendMessage: (newMessage: any) => void
  agentList: any[]
  initialQuery?: string | null
  /** Public / Help only: wait for history load so replies are not cleared by a late fetch */
  historyLoading?: boolean
}

const ChatInput: React.FC<ChildProps> = ({
  appendMessage,
  agentList,
  initialQuery,
  historyLoading = false,
}) => {
  const { botName } = useNavBarStore()
  const [agents, setAgents] = useState(agentList) // internal reorderable list

  const dropdownRef = useRef<any>(null)
  const [openUpwards, setOpenUpwards] = useState(false)

  const { workflowFlag, setWorkFlowFlag, setSessionId, sessionId, setSelectedAgentInfo, triggerNewSession } =
    useChatConfig()
  const [message, setMessage] = useState("")
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const { access_token, user_data, chatSession, setChatSession, role } = useAuth()
  const { isMessageLoading, updateMessageLoading } = useFormStore()
  const { publicChat, publicChatHeaders, setPublicChatHeaders } = usePublicChat()
  const { apiType } = useApiType()
  const [isLoading, setIsLoading] = useState(false)
  const [chatPrompts, setChatPrompts] = useState([])
  const [publicChatReponsePayload, setPublicChatResponse] = useState<PublicChatPayload>({
    user_email: null,
    customer_id: null,
  })
  const [showDropdown, setShowDropdown] = useState(false)
  const visibleAgents = agentList.slice(0, 5)
  const remainingAgents = agentList.slice(5)
  const [selectedAgents, setSelectedAgents] = useState<any>([])
  const [showPopup, setShowPopup] = useState(false) // State to manage popup visibility
  const [hasAutoSent, setHasAutoSent] = useState(false) // Flag to prevent multiple auto-sends
  const abortControllerRef = useRef<AbortController | null>(null) // For cancelling fetch requests

  // Helper function to check if opened from email link
  const isFromEmailLink = () => {
    if (typeof window !== "undefined") {
      const urlParams = new URLSearchParams(window.location.search)
      return !!urlParams.get("emailId")
    }
    return false
  }

  // Sample list of text options

  useEffect(() => {
    if (showDropdown && dropdownRef.current) {
      const rect = dropdownRef.current.getBoundingClientRect()
      const spaceBelow = window.innerHeight - rect.top
      const dropdownHeight = 200 // Approx. max height

      if (spaceBelow < dropdownHeight) {
        setOpenUpwards(true) // Not enough space below, open upwards
      } else {
        setOpenUpwards(false) // Enough space, open normally
      }
    }
  }, [showDropdown])

  const handleDropdownSelect = (agent: any) => {
    // Switch to this agent only: replace selection and new session will be created by the effect
    setSelectedAgents([agent])
    setAgents((prev: any) => [agent, ...prev.filter((a: any) => a.name !== agent.name)])
    setShowDropdown(false)
  }

  /** Switch to a single agent (used when clicking a chip). Starts new session via effect. */
  const switchToAgent = (agent: any) => {
    setSelectedAgents([agent])
  }

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
  useEffect(() => {
    async function fetchOrganizationQuery() {
      const res = await http.get("/organization/prompts", {
        headers: { Authorization: `Bearer ${access_token}` },
      })
      setChatPrompts(res.data.organizationPrompts)
    }
    fetchOrganizationQuery()
  }, [user_data])

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

  const handleStopStreaming = () => {
    console.log("Stopping streaming...")

    // Abort the fetch request
    if (abortControllerRef.current) {
      abortControllerRef.current.abort()
      abortControllerRef.current = null
    }

    // Reset loading state
    updateMessageLoading(false)
  }

  const sendMessage = async () => {
    if (message.trim() !== "") {
      let msg = message

      setMessage("") // Clear the textarea after sending the message
      await sendMessageToBackend(msg) // Send the message to the backend

      if (textareaRef.current) {
        textareaRef.current.focus() // Focus back on the textarea
      }
    }
  }

  const sendMessageToBackend = async (query: string) => {
    // Add user message to Chat list
    updateMessageLoading(true)
    appendMessage({
      sender: "user",
      message: query,
      time: getClockTime(),
      id: "",
    })
    try {
      if (publicChat) {
        const headers = publicChatHeaders as Record<string, string>
        await runPublicConversationAdd({
          query,
          orgId: String((publicChatHeaders as any)?.org_id ?? ""),
          chatSession: String((publicChatHeaders as any)?.chat_session ?? ""),
          accessToken: access_token ?? "",
          publicChatHeaders: headers,
          botName,
          getClockTime,
          appendMessage,
          payloadState: publicChatReponsePayload,
          setPublicChatResponse,
        })
      } else {
        // Prioritize agent selection
        // For individual users, if no agent is selected, use "search agent"
        if (selectedAgents.length > 0) {
          // Always use non-streaming for agent for now
          await handleCustomAgentStreaming(query)
        } else if (role === "individual") {
          // For individual users with no agent selected, use "search agent"
          await handleCustomAgentStreaming(query, "Search")
        } else {
          await handleStreamingResponse(query)
        }
        //  if (apiType === "Customer Information") {
        //   await handleStreamingResponse(query)
        // } else {
        //   await handleNonStreamingResponse(query)
        // }
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

  // For insights chat
  const handleStreamingResponse = async (query: string) => {
    const messageId = `stream_${Date.now()}`
    let conversationId: any = ""
    let fullMessage = "" // Moved outside try block for access in catch

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
      // Create AbortController for this request
      const abortController = new AbortController()
      abortControllerRef.current = abortController

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
          }),
          signal: abortController.signal,
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

      let sessionIdFromResponse = null

      // Read the stream
      const decoder = new TextDecoder()
      console.log("decoder", decoder)
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
                conversationId = "ANS_" + data.id
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
              if (data.status && !conversationId) {
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
        conversationId: conversationId,
        isStreaming: false,
      })
    } catch (error: any) {
      console.error("Stream error:", error)

      // Check if error is from abort (user stopped the stream)
      if (error.name === "AbortError") {
        console.log("Stream stopped by user")
        appendMessage({
          sender: botName,
          message: fullMessage || "Response stopped by user.",
          time: getClockTime(),
          id: messageId,
          isStreaming: false,
        })
      } else {
        appendMessage({
          sender: botName,
          message: "Error occurred while streaming the response.",
          time: getClockTime(),
          id: messageId,
          isStreaming: false,
        })
      }
    } finally {
      // Clean up abort controller
      abortControllerRef.current = null
    }
  }

  // For RAG chat
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

  // Handle custom agent query with streaming
  const handleCustomAgentStreaming = async (query: string, agentName?: string) => {
    const messageId = `stream_agent_${Date.now()}`
    let conversationId: any = ""
    let fullMessage = "" // Moved outside try block for access in catch

    // Use provided agentName or fall back to selectedAgents[0]
    const agentToUse = agentName || selectedAgents[0]?.name

    // Add initial message with loading status
    appendMessage({
      sender: botName,
      message: "",
      time: getClockTime(),
      id: messageId,
      isStreaming: true,
      status: `Querying  ${agentToUse}...`, // Show agent name
    })

    try {
      // Create AbortController for this request
      const abortController = new AbortController()
      abortControllerRef.current = abortController

      // Build request body - only include sessionId if it exists
      const requestBody: any = {
        question: query,
        chatSession,
        agentName: agentToUse, // Use the agent name (either provided or from selectedAgents)
      }

      // Only add sessionId if it's not null/undefined
      if (sessionId) {
        requestBody.sessionId = sessionId
      }

      // Configure fetch for streaming SSE response
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_APP_URL}/${process.env.NEXT_PUBLIC_APP_VERSION}/conversation/agent/add`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${access_token}`,
          },
          body: JSON.stringify(requestBody),
          signal: abortController.signal,
        }
      )

      if (!response.ok) {
        // Attempt to read error message from response body
        let errorBody = "Unknown error"
        try {
          const errorData = await response.json()
          errorBody = errorData.error || JSON.stringify(errorData)
        } catch (e) {
          // Ignore if response body is not JSON
        }
        throw new Error(`HTTP error! status: ${response.status}, message: ${errorBody}`)
      }

      // Get the response as a ReadableStream
      const reader = response.body?.getReader()
      if (!reader) {
        throw new Error("Response body is not readable")
      }

      let sessionIdFromResponse = sessionId // Start with current session ID

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
              console.log("Customer agent", data)
              // Handle completion
              if (data.done) {
                conversationId = "ANS_" + data.id
                // Update session ID if provided and different
                if (data.session_id && data.session_id !== sessionId) {
                  sessionIdFromResponse = data.session_id
                  setSessionId(data.session_id)
                  console.log("Agent stream updated session ID:", data.session_id)
                }
                continue // Stop processing this message
              }

              // Handle status updates
              if (data.status && !conversationId) {
                appendMessage({
                  sender: botName,
                  message: fullMessage, // Keep showing accumulated message
                  time: getClockTime(),
                  id: messageId,
                  isStreaming: true,
                  status: data.status, // Update status from agent stream
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
                  isStreaming: true, // Still streaming until 'done'
                })
              }

              // Handle potential errors from the stream
              if (data.error) {
                console.error("Error from agent stream:", data.error)
                // Optionally update the message to show the error
                appendMessage({
                  sender: botName,
                  message: `${fullMessage}\n\nError: ${data.error}`,
                  time: getClockTime(),
                  id: messageId,
                  isStreaming: false, // Stop streaming on error
                })
                // Potentially break or return here depending on desired behavior
                return
              }

              // Handle raw chunks if backend sends them
              if (data.chunk) {
                console.warn("Received raw chunk from agent stream:", data.chunk)
                // Decide how to handle raw chunks, e.g., append to message or ignore
                // fullMessage += data.chunk; // Example: append if it's text
              }
            } catch (e) {
              console.error("Error parsing agent stream data:", e, "Raw line:", line)
            }
          }
        }
      }

      // Final message update after stream completes successfully
      appendMessage({
        sender: botName,
        message: fullMessage,
        conversationId: conversationId,
        time: getClockTime(),
        id: messageId,
        isStreaming: false, // Mark as complete
      })
    } catch (error: any) {
      console.error("Agent stream fetch error:", error)

      // Check if error is from abort (user stopped the stream)
      if (error.name === "AbortError") {
        console.log("Agent stream stopped by user")
        appendMessage({
          sender: botName,
          message: fullMessage || "Response stopped by user.",
          time: getClockTime(),
          id: messageId,
          isStreaming: false,
        })
      } else {
        appendMessage({
          sender: botName,
          message: `Error occurred while querying agent ${agentToUse}. ${error.message || ""}`,
          time: getClockTime(),
          id: messageId,
          isStreaming: false, // Mark as complete even on error
        })
      }
    } finally {
      // Clean up abort controller
      abortControllerRef.current = null
      updateMessageLoading(false) // Ensure loading state is reset
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
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
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 150)}px`
    }
  }
  // Handle initial query from URL parameters
  useEffect(() => {
    if (initialQuery && initialQuery.trim() !== "" && !hasAutoSent) {
      // Check if this is from an email link by looking for emailId parameter
      const isFromEmail = isFromEmailLink()

      if (isFromEmail) {
        const urlParams = new URLSearchParams(window.location.search)
        const emailId = urlParams.get("emailId")
        console.log("Email link detected with ID:", emailId)
        console.log("Query from email:", initialQuery)
      }

      setMessage(initialQuery)
      setHasAutoSent(true) // Mark as auto-sent to prevent multiple sends

      // Auto-send the message after a short delay to ensure everything is loaded
      const timer = setTimeout(async () => {
        // Call sendMessageToBackend directly to avoid dependency issues
        if (initialQuery.trim() !== "") {
          setMessage("") // Clear the textarea after sending the message
          await sendMessageToBackend(initialQuery) // Send the message to the backend

          if (textareaRef.current) {
            textareaRef.current.focus() // Focus back on the textarea
          }
        }

        // Remove query and emailId parameters from URL after sending
        if (typeof window !== "undefined") {
          const url = new URL(window.location.href)
          url.searchParams.delete("query")
          url.searchParams.delete("emailId")
          window.history.replaceState({}, "", url.toString())
        }
      }, 1000) // 1 second delay to ensure everything is ready

      return () => clearTimeout(timer)
    }
  }, [initialQuery])

  useEffect(() => {
    if (selectedAgents.length > 0) {
      const first = selectedAgents[0]
      const agent =
        typeof first === "object" && first?.name
          ? first
          : agentList.find((a: any) => a.name === first)
      const greeting = agent?.greeting && agent.greeting !== "NA" ? agent.greeting : null
      setSelectedAgentInfo(greeting, agent?.name ?? null)

      // Create new session every time an agent is selected
      const createNewSession = async () => {
        triggerNewSession()
        setSessionId(null)
        if (publicChat) {
          const newSessionId = generateSessionIdLength5()
          localStorage.setItem("chat_session_agile_move", String(newSessionId))
          setPublicChatHeaders({ ...publicChatHeaders, chat_session: String(newSessionId) })
          setSessionId(newSessionId)
        } else {
          const newSession = generateSessionIdLength5()
          try {
            const res = await http.get(
              `user/profile/changeSession?session=${newSession}`,
              { headers: { Authorization: `Bearer ${access_token}` } }
            )
            setChatSession(res?.data?.newSession ?? String(newSession))
          } catch (_) {
            setChatSession(String(newSession))
          }
          setSessionId(newSession)
        }
      }
      createNewSession()

      if (textareaRef.current) {
        textareaRef.current.focus()
      }
    } else {
      setSelectedAgentInfo(null, null)
    }
  }, [selectedAgents, agentList])
  const inputLocked = isMessageLoading || historyLoading
  const handleAgentRemove = (agentName: string) => {
    // Clicking selected agent: clear. Clicking different agent: switch to that agent (new session).
    setSelectedAgents((prevAgents: any) =>
      prevAgents.some((a: any) => (typeof a === "object" ? a.name : a) === agentName)
        ? []
        : [agentName]
    )
  }
  return (
    <div className="sticky bottom-0 shrink-0 border-t border-[#E2E6EF] bg-white font-sans">
      {!publicChat && (
        <div className="flex flex-wrap gap-1.5 border-b border-[#E2E6EF] px-3 py-2.5">
          {visibleAgents.map((agent: any, index: number) => {
            const isSelected = selectedAgents.some(
              (a: any) => (typeof a === "object" ? a?.name : a) === agent.name
            )
            return (
              <button
                type="button"
                onClick={() => {
                  if (isSelected) {
                    handleAgentRemove(agent.name)
                  } else {
                    switchToAgent(agent)
                  }
                }}
                key={index}
                className={`rounded-full border px-2.5 py-1 text-[11px] transition-all duration-150 ${isSelected
                  ? "border-[#1B3A8C] bg-[#E8EDF8] font-medium text-[#1B3A8C]"
                  : "border-[#CDD3E0] bg-white font-normal text-[#4A5168] hover:border-[#B8C0D4]"
                  }`}
              >
                {agent.name}
              </button>
            )
          })}
          {remainingAgents.length > 0 && (
            <div className="relative">
              <button
                type="button"
                onClick={() => setShowDropdown((prev) => !prev)}
                className="rounded-full border border-[#CDD3E0] bg-white px-2.5 py-1 text-[11px] font-normal text-[#4A5168] hover:border-[#B8C0D4]"
              >
                +{remainingAgents.length}
              </button>
              {showDropdown && (
                <div
                  ref={dropdownRef}
                  className="absolute bottom-full z-10 mb-2 max-h-60 w-40 overflow-y-auto rounded-md border border-[#E2E6EF] bg-white p-2 shadow-lg"
                >
                  {remainingAgents.map((agent, index) => (
                    <div
                      key={index}
                      onClick={() => handleDropdownSelect(agent)}
                      className={`cursor-pointer rounded px-3 py-1 text-sm hover:bg-[#E8EDF8] ${selectedAgents.some((a: any) => (typeof a === "object" ? a?.name : a) === agent?.name)
                        ? "font-semibold text-[#1B3A8C]"
                        : "text-[#4A5168]"
                        }`}
                    >
                      {agent.name}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      )}

      <div className="px-3 pb-3 pt-2.5">
        <div className="flex w-full items-end gap-2 rounded-lg border border-[#CDD3E0] bg-white px-2.5 py-2">
          <div className="min-w-0 flex-1">
            <textarea
              rows={1}
              ref={textareaRef}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              onKeyDown={handleKeyPress}
              onInput={handleInput}
              disabled={inputLocked}
              placeholder={
                historyLoading ? "Loading chat…" : isMessageLoading ? "....." : "Type your message here..."
              }
              className="max-h-20 min-h-5 w-full resize-none overflow-y-auto border-none bg-transparent py-0.5 text-[13px] text-[#1A1F2E] outline-none placeholder:text-[#8B91A3] active:border-none disabled:cursor-not-allowed"
            />
          </div>
          <div className="flex shrink-0 items-center gap-1.5 pb-0.5">
            {!publicChat && (
              <button
                type="button"
                onClick={togglePopup}
                className="rounded-md bg-[#F4F6FA] p-1.5 text-[#4A5168] hover:bg-[#E8EDF8]"
              >
                <FaRegLightbulb size={16} />
              </button>
            )}
            <span className="text-[10.5px] text-[#8B91A3]">{message?.length}/4000</span>
            {isMessageLoading ? (
              <button
                type="button"
                onClick={handleStopStreaming}
                className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-transparent hover:bg-[#F4F6FA]"
                title="Stop streaming"
              >
                <MdStop size={20} className="text-red-600" />
              </button>
            ) : (
              <button
                type="button"
                onClick={sendMessage}
                disabled={historyLoading}
                className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-[#1B3A8C] text-white hover:opacity-90 disabled:opacity-40"
                title="Send"
              >
                <svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
                  <path d="M22 2L11 13M22 2L15 22l-4-9-9-4 20-7z" />
                </svg>
              </button>
            )}
          </div>
        </div>
      </div>

        {/* Prompts Modal */}
        {showPopup && (
          <div
            className="fixed inset-0 flex items-center justify-end bg-black bg-opacity-50"
            onClick={handleBackgroundClick} // Close when clicking outside
          >
            <div className="mr-20 max-h-[90vh] w-[75%] max-w-[1200px] overflow-y-auto rounded-lg bg-white p-8 shadow-lg">
              <h2 className="mb-4 text-center text-2xl font-semibold">Select Prompt</h2>

              {/* Columns for Categories */}
              <div className="grid grid-cols-3 gap-6">
                {chatPrompts?.map((categoryData: any, index) => (
                  <div key={index} className="rounded-lg bg-gray-50 p-4 shadow">
                    <h3 className="text-xl font-semibold">{categoryData.category}</h3>
                    <ul className="mt-2 space-y-2">
                      {categoryData.prompts.map((prompt: any, promptIndex: number) => (
                        <React.Fragment key={promptIndex}>
                          <li
                            className="cursor-pointer text-gray-700 hover:text-blue-500"
                            onClick={() => handlePromptClick(prompt.text)} // Handle prompt click
                          >
                            {prompt.text}
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
