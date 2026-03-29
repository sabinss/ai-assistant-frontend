"use client"

import { useEffect } from "react"
import useAuth from "@/store/user"

type CowrkrWindow = Window & {
  __cowrkrEmbedConfig?: {
    orgId?: string
    user?: { name?: string; email?: string; userId?: string }
  }
  __cowrkrEmbedChatInit?: () => void
}

/** Same-origin embed; mirrors host app pattern (public/embedchat.js). */
const EMBED_SCRIPT_PATH = "/embedchat.js"

const HelpPage = () => {
  const { user_data } = useAuth()

  useEffect(() => {
    const w = window as CowrkrWindow

    if (!user_data?.organization) {
      document.querySelectorAll(".cowrkr-chat-root").forEach((el) => el.remove())
      delete w.__cowrkrEmbedConfig
      return
    }

    const displayName =
      [user_data?.first_name, user_data?.last_name].filter(Boolean).join(" ").trim() ||
      user_data?.email ||
      ""

    // Plain object read by public/embedchat.js (see getEmbedContext).
    w.__cowrkrEmbedConfig = {
      orgId: user_data.organization,
      user: {
        name: displayName,
        email: user_data.email,
        userId: user_data.user_id,
      },
    }

    const runInit = () => w.__cowrkrEmbedChatInit?.()

    let script = document.querySelector(
      `script[src="${EMBED_SCRIPT_PATH}"]`
    ) as HTMLScriptElement | null
    if (!script) {
      script = document.createElement("script")
      script.src = EMBED_SCRIPT_PATH
      script.async = true
      script.onload = runInit
      document.body.appendChild(script)
    } else if (w.__cowrkrEmbedChatInit) {
      runInit()
    } else {
      script.addEventListener("load", runInit, { once: true })
    }

    return () => {
      document.querySelectorAll(".cowrkr-chat-root").forEach((el) => el.remove())
      delete w.__cowrkrEmbedConfig
    }
  }, [
    user_data?.organization,
    user_data?.first_name,
    user_data?.last_name,
    user_data?.email,
    user_data?.user_id,
  ])

  return (
    <div className="flex min-h-[min(100%,calc(100vh-120px))] w-full flex-col gap-4">
      {/* data-org is a fallback if __cowrkrEmbedConfig is missing */}
      <div
        id="embed-container"
        data-org={user_data?.organization ?? ""}
        className="pointer-events-none absolute h-px w-px overflow-hidden whitespace-nowrap border-0 p-0 [clip:rect(0,0,0,0)]"
        aria-hidden
      />
    </div>
  )
}

export default HelpPage
