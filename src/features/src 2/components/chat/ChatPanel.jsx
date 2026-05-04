import { useState, useRef, useEffect } from "react"
import ChatMessage from "./ChatMessage"
import { AGENTS } from "../../data/mockData"
import { sendChatMessage, requestDraft } from "../../api/chatApi"

function getTime() {
  const n = new Date()
  return n.getHours() + ":" + String(n.getMinutes()).padStart(2, "0")
}

export default function ChatPanel({ pendingDraft, onDraftHandled, onToast }) {
  const [messages, setMessages] = useState([
    {
      id: 1,
      role: "agent",
      type: "text",
      time: "9:02 AM",
      content:
        "Good morning. You have <strong>2 TODAY</strong> actions. Northgate's champion departure is the most time-sensitive — the successor window is open now. Want me to draft the outreach?",
    },
  ])
  const [input, setInput] = useState("")
  const [activeAgent, setActiveAgent] = useState("analyst")
  const [isTyping, setIsTyping] = useState(false)
  const messagesEndRef = useRef(null)
  const idRef = useRef(10)

  const nextId = () => ++idRef.current

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages, isTyping])

  // Handle draft request triggered from an action card
  useEffect(() => {
    if (!pendingDraft) return
    const { account, draftType, label } = pendingDraft
    addUserMessage(`Get draft — ${label}`)
    handleDraftRequest(account, draftType)
    onDraftHandled()
  }, [pendingDraft])

  function addUserMessage(content) {
    setMessages((prev) => [
      ...prev,
      { id: nextId(), role: "user", type: "text", content, time: getTime() },
    ])
  }

  function addAgentMessage(content) {
    setMessages((prev) => [
      ...prev,
      { id: nextId(), role: "agent", type: "text", content, time: getTime() },
    ])
  }

  function addDraftMessage(subject, body) {
    setMessages((prev) => [
      ...prev,
      { id: nextId(), role: "agent", type: "draft", subject, body, time: getTime() },
    ])
  }

  async function handleDraftRequest(account, draftType) {
    setIsTyping(true)
    const result = await requestDraft(account, draftType)
    setIsTyping(false)
    if (result.type === "draft") {
      addDraftMessage(result.subject, result.body)
    } else {
      addAgentMessage(result.content)
    }
  }

  async function handleSend() {
    const text = input.trim()
    if (!text) return
    setInput("")
    addUserMessage(text)
    setIsTyping(true)
    const result = await sendChatMessage(text, activeAgent)
    setIsTyping(false)
    addAgentMessage(result.content)
  }

  return (
    <div
      style={{
        width: "40%",
        minWidth: 340,
        maxWidth: 520,
        flexShrink: 0,
        borderLeft: "1px solid #E2E6EF",
        display: "flex",
        flexDirection: "column",
        background: "#fff",
      }}
    >
      {/* Header */}
      <div
        style={{
          padding: "12px 16px",
          borderBottom: "1px solid #E2E6EF",
          flexShrink: 0,
          display: "flex",
          alignItems: "center",
          gap: 10,
        }}
      >
        <div
          style={{
            width: 30,
            height: 30,
            borderRadius: "50%",
            background: "#1B3A8C",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: 14,
            flexShrink: 0,
          }}
        >
          🤖
        </div>
        <div>
          <div style={{ fontSize: 13.5, fontWeight: 600 }}>Chat with {botName}</div>
          <div style={{ fontSize: 11, color: "#8B91A3" }}>Action Centre context active</div>
        </div>
        <div style={{ marginLeft: "auto" }}>
          <button
            onClick={() => onToast("New session started")}
            style={{
              fontSize: 12,
              color: "#1B3A8C",
              fontWeight: 500,
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              gap: 4,
              background: "none",
              border: "none",
              fontFamily: "inherit",
            }}
          >
            <svg
              width="13"
              height="13"
              viewBox="0 0 24 24"
              fill="none"
              stroke="#1B3A8C"
              strokeWidth="2"
            >
              <line x1="12" y1="5" x2="12" y2="19" />
              <line x1="5" y1="12" x2="19" y2="12" />
            </svg>
            New Session
          </button>
        </div>
      </div>

      {/* Messages */}
      <div
        style={{
          flex: 1,
          overflowY: "auto",
          padding: "14px",
          display: "flex",
          flexDirection: "column",
          gap: 10,
          background: "#F4F6FA",
        }}
      >
        {messages.map((msg) => (
          <ChatMessage key={msg.id} msg={msg} onToast={onToast} />
        ))}
        {isTyping && (
          <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-start" }}>
            <div
              style={{
                display: "flex",
                gap: 3,
                padding: "9px 12px",
                background: "#fff",
                borderRadius: 10,
                border: "1px solid #E2E6EF",
                borderBottomLeftRadius: 3,
              }}
            >
              {[0, 150, 300].map((d) => (
                <span
                  key={d}
                  style={{
                    width: 5,
                    height: 5,
                    background: "#8B91A3",
                    borderRadius: "50%",
                    display: "inline-block",
                    animation: `typingBounce 1.2s ${d}ms infinite`,
                  }}
                />
              ))}
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Agent chips */}
      <div
        style={{
          padding: "10px 12px",
          borderTop: "1px solid #E2E6EF",
          display: "flex",
          gap: 6,
          flexWrap: "wrap",
        }}
      >
        {AGENTS.map((agent) => (
          <button
            key={agent.id}
            onClick={() => {
              setActiveAgent(agent.id)
              onToast(`Switched to ${agent.label}`)
            }}
            style={{
              fontSize: 11,
              padding: "5px 10px",
              borderRadius: 99,
              border: `1px solid ${activeAgent === agent.id ? "#1B3A8C" : "#CDD3E0"}`,
              background: activeAgent === agent.id ? "#E8EDF8" : "#fff",
              color: activeAgent === agent.id ? "#1B3A8C" : "#4A5168",
              fontWeight: activeAgent === agent.id ? 500 : 400,
              cursor: "pointer",
              fontFamily: "inherit",
              whiteSpace: "nowrap",
              transition: "all 0.12s",
            }}
          >
            {agent.label}
          </button>
        ))}
      </div>

      {/* Input */}
      <div style={{ padding: "10px 12px 12px", borderTop: "1px solid #E2E6EF" }}>
        <div
          style={{
            display: "flex",
            gap: 8,
            alignItems: "flex-end",
            border: "1px solid #CDD3E0",
            borderRadius: 8,
            padding: "8px 10px",
            background: "#fff",
          }}
        >
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault()
                handleSend()
              }
            }}
            placeholder="Type your message here..."
            style={{
              flex: 1,
              border: "none",
              outline: "none",
              fontFamily: "inherit",
              fontSize: 13,
              color: "#1A1F2E",
              background: "transparent",
              resize: "none",
              maxHeight: 80,
              minHeight: 20,
            }}
            rows={1}
          />
          <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
            <span style={{ fontSize: 10.5, color: "#8B91A3" }}>{input.length}/4000</span>
            <button
              onClick={handleSend}
              style={{
                width: 28,
                height: 28,
                borderRadius: "50%",
                background: "#1B3A8C",
                border: "none",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                flexShrink: 0,
              }}
            >
              <svg width="13" height="13" viewBox="0 0 24 24" fill="#fff">
                <path d="M22 2L11 13M22 2L15 22l-4-9-9-4 20-7z" />
              </svg>
            </button>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes typingBounce {
          0%, 80%, 100% { transform: translateY(0); }
          40% { transform: translateY(-4px); }
        }
      `}</style>
    </div>
  )
}
