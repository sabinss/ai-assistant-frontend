import type { Dispatch, SetStateAction } from "react"

export type PublicChatPayload = {
  user_email: string | null
  customer_id: string | null
}

function toDisplayText(value: unknown): string {
  if (value == null) return ""
  if (typeof value === "string") return value
  if (typeof value === "number" || typeof value === "boolean") return String(value)
  if (Array.isArray(value)) {
    return value.map((item) => toDisplayText(item)).filter(Boolean).join("\n")
  }
  if (typeof value === "object") {
    const o = value as Record<string, unknown>
    const candidate = o.answer ?? o.message ?? o.response ?? o.text ?? o.content
    if (candidate != null) return toDisplayText(candidate)
    try {
      return JSON.stringify(value)
    } catch {
      return String(value)
    }
  }
  return String(value)
}

function isConversationJsonRecord(o: unknown): o is Record<string, unknown> {
  if (!o || typeof o !== "object" || Array.isArray(o)) return false
  const r = o as Record<string, unknown>
  if (
    typeof r.answer === "string" ||
    typeof r.question === "string" ||
    typeof r._id === "string"
  ) {
    return true
  }
  const inner = r.data
  if (inner && typeof inner === "object" && !Array.isArray(inner)) {
    const d = inner as Record<string, unknown>
    return (
      typeof d.answer === "string" ||
      typeof d.question === "string" ||
      typeof d._id === "string"
    )
  }
  return false
}

function appendJsonConversationReply(
  data: Record<string, unknown>,
  options: {
    botName: string
    getClockTime: () => string
    appendMessage: (msg: any) => void
    setPublicChatResponse: Dispatch<SetStateAction<PublicChatPayload>>
  }
) {
  const { botName, getClockTime, appendMessage, setPublicChatResponse } = options
  const payload = (data?.data as Record<string, unknown>) ?? data
  const user_email = payload?.user_email ?? data?.user_email
  const customer_id = payload?.customer_id ?? data?.customer_id
  if (user_email != null || customer_id != null) {
    setPublicChatResponse((prevState) => ({
      ...prevState,
      user_email: (user_email as string | null) ?? prevState.user_email,
      customer_id: (customer_id as string | null) ?? prevState.customer_id,
    }))
  }
  const answer = toDisplayText(
    payload?.answer ?? payload?.message ?? payload?.response ?? payload?.text ?? payload
  )
  const convId = payload?._id ?? payload?.id ?? data?._id ?? data?.id
  appendMessage({
    sender: botName,
    message: answer || "(No text in response)",
    time: getClockTime(),
    id: "ANS_" + String(convId ?? Date.now()),
  })
}

/**
 * Help / public chat only: POST /conversation/public/add and render JSON or SSE replies.
 * Reads body as text first so JSON displays even when Content-Type is not application/json.
 */
export async function runPublicConversationAdd(options: {
  query: string
  orgId: string
  chatSession: string
  accessToken: string
  publicChatHeaders: Record<string, string>
  botName: string
  getClockTime: () => string
  appendMessage: (msg: any) => void
  payloadState: PublicChatPayload
  setPublicChatResponse: Dispatch<SetStateAction<PublicChatPayload>>
}): Promise<void> {
  const {
    query,
    orgId,
    chatSession,
    accessToken,
    publicChatHeaders,
    botName,
    getClockTime,
    appendMessage,
    payloadState,
    setPublicChatResponse,
  } = options

  const base = process.env.NEXT_PUBLIC_APP_URL
  const version = process.env.NEXT_PUBLIC_APP_VERSION
  if (!base || !version) {
    throw new Error("Missing NEXT_PUBLIC_APP_URL or NEXT_PUBLIC_APP_VERSION")
  }

  const response = await fetch(
    `${base}/${version}/conversation/public/add?org_id=${encodeURIComponent(orgId)}&chat_session=${encodeURIComponent(chatSession)}`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...publicChatHeaders,
        Authorization: `Bearer ${accessToken}`,
      },
      body: JSON.stringify({
        question: query,
        user_email: payloadState.user_email,
        customer_id: payloadState.customer_id,
      }),
    }
  )

  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`)
  }

  const raw = await response.text()
  const trimmed = raw.trim()

  if (trimmed.startsWith("{")) {
    try {
      const data = JSON.parse(trimmed) as Record<string, unknown>
      if (isConversationJsonRecord(data)) {
        appendJsonConversationReply(data, {
          botName,
          getClockTime,
          appendMessage,
          setPublicChatResponse,
        })
        return
      }
    } catch {
      // fall through to SSE-style parsing
    }
  }

  const messageId = `stream_${Date.now()}`

  appendMessage({
    sender: botName,
    message: "",
    time: getClockTime(),
    id: messageId,
    isStreaming: true,
    status: "Analyzing your request...",
  })

  try {
    let fullMessage = ""
    let userEmail = payloadState.user_email
    let customerId = payloadState.customer_id

    for (const block of trimmed.split(/\n\n/)) {
      for (const line of block.split("\n")) {
        const t = line.trim()
        if (!t.startsWith("data: ")) continue
        try {
          const data = JSON.parse(t.slice(6))

          if (data.done) {
            continue
          }

          if (data.user_email && !userEmail) {
            userEmail = data.user_email
          }
          if (data.customer_id && !customerId) {
            customerId = data.customer_id
          }

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

          if (data.message) {
            fullMessage += toDisplayText(data.message)
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

    if (!fullMessage.trim() && trimmed) {
      try {
        const parsed = JSON.parse(trimmed) as Record<string, unknown>
        if (isConversationJsonRecord(parsed)) {
          const payload = ((parsed as any)?.data as Record<string, unknown>) ?? parsed
          const user_email = payload?.user_email ?? parsed?.user_email
          const customer_id = payload?.customer_id ?? parsed?.customer_id
          if (user_email != null || customer_id != null) {
            setPublicChatResponse((prev) => ({
              ...prev,
              user_email: (user_email as string | null) ?? prev.user_email,
              customer_id: (customer_id as string | null) ?? prev.customer_id,
            }))
          }
          const answer = toDisplayText(
            payload?.answer ?? payload?.message ?? payload?.response ?? payload?.text ?? payload
          )
          appendMessage({
            sender: botName,
            message: answer || "(No text in response)",
            time: getClockTime(),
            id: messageId,
            isStreaming: false,
          })
          return
        }
        fullMessage = toDisplayText(
          (parsed as any)?.data?.answer ??
            (parsed as any)?.data?.message ??
            (parsed as any)?.data ??
            (parsed as any)?.answer ??
            (parsed as any)?.message ??
            parsed
        )
      } catch {
        fullMessage = trimmed
      }
    }

    setPublicChatResponse({
      user_email: userEmail,
      customer_id: customerId,
    })

    appendMessage({
      sender: botName,
      message: fullMessage.trim() ? fullMessage : "(No text in response)",
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
