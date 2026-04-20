"use client"

import { useEffect } from "react"
import { destroy, init } from "cowrkr-embed"
import useAuth from "@/store/user"

/**
 * Mounts the floating `cowrkr-embed` chat once for the whole main app shell.
 * Org/chat host are fixed in the package; only `user` is passed from the app.
 */
export function CowrkrEmbedHost() {
  const { user_data, is_logged_in } = useAuth()

  useEffect(() => {
    if (!is_logged_in || !user_data) {
      destroy()
      return
    }

    const displayName =
      [user_data.first_name, user_data.last_name].filter(Boolean).join(" ").trim() ||
      user_data.email ||
      ""

    init({
      ...(process.env.ENVIRONMENT === "staging" ? { chatOrigin: "https://staging.cowrkr.com" } : {}),
      user: {
        name: displayName,
        ...(user_data.email ? { email: user_data.email } : {}),
        ...(user_data.user_id != null ? { userId: String(user_data.user_id) } : {}),
        ...(user_data.organization ? { company_id: user_data.organization } : {}),
      },
    })

    return () => {
      destroy()
    }
  }, [
    is_logged_in,
    user_data?.first_name,
    user_data?.last_name,
    user_data?.email,
    user_data?.user_id,
    user_data?.organization,
  ])

  // `init()` creates `#embed-container` on `document.body` if needed; the widget is `position:fixed`.
  return null
}
