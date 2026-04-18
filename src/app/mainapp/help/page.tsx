"use client"

import { useEffect } from "react"
import { destroy, init } from "cowrkr-embed"
import useAuth from "@/store/user"

/**
 * Help mounts the CoWrkr chat widget via `cowrkr-embed`.
 * Org id and chat host are fixed inside the package — only pass `user` here.
 */
const HelpPage = () => {
  const { user_data } = useAuth()

  useEffect(() => {
    const displayName =
      [user_data?.first_name, user_data?.last_name].filter(Boolean).join(" ").trim() ||
      user_data?.email ||
      ""

    init({
      user: {
        name: displayName,
        ...(user_data?.email ? { email: user_data.email } : {}),
        ...(user_data?.user_id != null ? { userId: String(user_data.user_id) } : {}),
        ...(user_data?.organization
          ? { company_id: user_data.organization }
          : {}),
      },
    })

    return () => {
      destroy()
    }
  }, [
    user_data?.first_name,
    user_data?.last_name,
    user_data?.email,
    user_data?.user_id,
    user_data?.organization,
  ])

  return (
    <div className="flex min-h-[min(100%,calc(100vh-120px))] w-full flex-col gap-4">
      <h1 className="text-lg font-semibold text-foreground">Help</h1>
      <p className="text-muted-foreground">Use the chat bubble to reach support.</p>
      {/* Widget target; `init()` also creates this id if missing */}
      <div
        id="embed-container"
        className="pointer-events-none absolute h-px w-px overflow-hidden whitespace-nowrap border-0 p-0 [clip:rect(0,0,0,0)]"
        aria-hidden
      />
    </div>
  )
}

export default HelpPage
