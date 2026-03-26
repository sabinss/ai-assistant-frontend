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

/**
 * Help / public chat only: POST /conversation/public/add and render JSON or SSE (or raw chunk) replies.
 * Kept out of ChatInput so the shared component stays small.
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

  const contentType = response.headers.get("content-type") || ""

  if (contentType.includes("application/json")) {
    const data = await response.json()
    const payload = data?.data ?? data
    const user_email = payload?.user_email ?? data?.user_email
    const customer_id = payload?.customer_id ?? data?.customer_id
    if (user_email != null || customer_id != null) {
      setPublicChatResponse((prevState) => ({
        ...prevState,
        user_email: user_email ?? prevState.user_email,
        customer_id: customer_id ?? prevState.customer_id,
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
    return
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
    const reader = response.body?.getReader()
    if (!reader) {
      throw new Error("Response body is not readable")
    }

    let fullMessage = ""
    let userEmail = payloadState.user_email
    let customerId = payloadState.customer_id

    const decoder = new TextDecoder()
    let buffer = ""

    while (true) {
      const { done, value } = await reader.read()
      if (done) break

      buffer += decoder.decode(value, { stream: true })

      const lines = buffer.split("\n\n")
      buffer = lines.pop() || ""

      for (const line of lines) {
        if (line.trim() && line.startsWith("data: ")) {
          try {
            const data = JSON.parse(line.substring(6))

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
    }

    if (!fullMessage.trim() && buffer.trim()) {
      const trimmed = buffer.trim()
      try {
        const parsed = JSON.parse(trimmed)
        fullMessage = toDisplayText(
          parsed?.data?.answer ??
            parsed?.data?.message ??
            parsed?.data ??
            parsed?.answer ??
            parsed?.message ??
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
