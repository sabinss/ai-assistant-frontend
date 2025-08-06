import useOrgCustomer from "@/store/organization_customer"
import useNavBarStore from "@/store/store"
import { useState } from "react"
import { useEffect, useRef } from "react"

export default function InsightsPanel({
  customer,
  conversations = [],
  sendCustomerChat,
}: any) {
  const [inputMessage, setInputMessage] = useState("")
  const [localMessages, setLocalMessages] = useState<any[]>([])
  const { customerMessageSending } = useOrgCustomer()
  const { botName } = useNavBarStore()

  // Local function to handle chat messages
  const handleLocalChat = async (message: string) => {
    // Add user message to local state
    const userMessage = {
      sender: "user",
      message: message,
      time: new Date().toLocaleTimeString(),
      id: `local_${Date.now()}`,
    }
    setLocalMessages((prev) => [...prev, userMessage])

    // Call the original sendCustomerChat function
    await sendCustomerChat(message)

    // The AI response will be handled by the parent component
    // and we'll add it to local messages when it comes back
  }

  const messagesEndRef = useRef<HTMLDivElement>(null)

  // Listen for new AI responses from the global store
  const { customerConversationMessages } = useOrgCustomer()

  // Clear local messages when customer changes
  useEffect(() => {
    setLocalMessages([])
  }, [customer?._id])

  useEffect(() => {
    // Only add AI responses (not user messages) to local messages
    if (customerConversationMessages.length > 0) {
      const lastMessage =
        customerConversationMessages[customerConversationMessages.length - 1]
      if (lastMessage.sender === "ai" || lastMessage.sender === botName) {
        // Check if this message is not already in local messages
        const messageExists = localMessages.some(
          (msg) => msg.id === lastMessage.id
        )
        if (!messageExists) {
          setLocalMessages((prev) => [...prev, lastMessage])
        }
      }
    }
  }, [customerConversationMessages])

  // Auto-scroll when messages update
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [localMessages, customerMessageSending])

  return (
    <div className="flex h-full w-full flex-col bg-[#f2f4fb] p-2">
      {/* Chat Header */}
      <div className="rounded-t-xl bg-blue-600 px-4 py-3 font-semibold text-white">
        {/* Customer Insights AI  */}
        Chats with Gabby
        {/* <p className="text-sm font-normal text-white/90">
          Ask me anything about your metrics
        </p>
        <p className="mb-4 text-sm text-white">
          👋 Hi! I'm here to help you understand your customer insights. Click
          on any metric card or ask me questions about your scores, trends, and
          recommendations.
        </p> */}
      </div>

      {/* Chat Body */}
      <div className="flex flex-grow flex-col overflow-y-auto px-4 py-3">
        {localMessages.length === 0 ? (
          <div className="mb-4 rounded-lg bg-blue-50 p-3 text-sm text-blue-700">
            🆕 <strong>New conversation</strong> - Start chatting with Gabby
            about {customer?.name}
          </div>
        ) : (
          <div className="mb-4 text-sm text-gray-700">
            👋 Hi! I'm here to help you understand your customer insights...
          </div>
        )}
        {/* Chat Body */}
        <div className="flex flex-grow flex-col space-y-2 overflow-y-auto px-4 py-3">
          {localMessages.map((c: any, idx: number) => {
            return (
              <div
                key={idx}
                className={`max-w-[75%] rounded px-4 py-2 text-sm ${
                  c.sender === "user"
                    ? "ml-auto bg-blue-100 text-right text-gray-800"
                    : "mr-auto bg-white text-left text-gray-700"
                }`}
              >
                {" "}
                {c.message}
              </div>
            )
          })}

          {/* Analyzing indicator */}
          {customerMessageSending && (
            <div className="mr-auto max-w-[75%] rounded bg-white px-4 py-2 text-left text-sm text-gray-700">
              <div className="flex items-center space-x-2">
                <div className="flex space-x-1">
                  <div className="h-2 w-2 animate-bounce rounded-full bg-gray-400"></div>
                  <div
                    className="h-2 w-2 animate-bounce rounded-full bg-gray-400"
                    style={{ animationDelay: "0.1s" }}
                  ></div>
                  <div
                    className="h-2 w-2 animate-bounce rounded-full bg-gray-400"
                    style={{ animationDelay: "0.2s" }}
                  ></div>
                </div>
                <span className="text-gray-600">Analyzing...</span>
              </div>
            </div>
          )}

          {/* Add the bottom ref here */}
          <div ref={messagesEndRef} />
        </div>

        {/* <div className="mt-auto space-y-2 text-sm">
          <p className="text-xs font-medium text-gray-600">Quick Questions:</p>
          <button className="w-full rounded bg-white px-3 py-2 text-left text-sm shadow">
            What's driving our satisfaction score?
          </button>
          <button className="w-full rounded bg-white px-3 py-2 text-left text-sm shadow">
            How can we improve response time?
          </button>
          <button className="w-full rounded bg-white px-3 py-2 text-left text-sm shadow">
            What actions should we prioritize?
          </button>
          <button className="w-full rounded bg-white px-3 py-2 text-left text-sm shadow">
            Show me trend analysis
          </button>
        </div> */}
      </div>

      {/* Chat Input */}
      <div className="mb-8 border-t bg-white p-5">
        <div className="flex items-center gap-2 rounded-md border px-3 py-2">
          <input
            type="text"
            placeholder="Ask about your metrics..."
            className="w-full border-none bg-transparent text-sm outline-none"
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && inputMessage.trim()) {
                handleLocalChat(inputMessage.trim())
                setInputMessage("")
              }
            }}
          />
          <button
            className="text-blue-600"
            disabled={customerMessageSending}
            onClick={() => {
              if (inputMessage.trim()) {
                handleLocalChat(inputMessage.trim())
                setInputMessage("")
              }
            }}
          >
            ➤
          </button>
        </div>
      </div>
    </div>
  )
}
