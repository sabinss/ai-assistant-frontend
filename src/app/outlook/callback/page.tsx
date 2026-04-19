"use client"
import http from "@/config/http"
import { useEffect, useRef, useState } from "react"
import useAuth from "@/store/user"

export default function OutlookCallback() {
  const [error, setError] = useState<string | null>(null)
  const user_data = useAuth((s) => s.user_data)
  const hasHydrated = useAuth((s) => s._hasHydrated)
  const hasExchanged = useRef(false)

  useEffect(() => {
    if (!hasHydrated || hasExchanged.current) return

    const urlParams = new URLSearchParams(window.location.search)
    const code = urlParams.get("code")
    const state = urlParams.get("state")
    const oauthError = urlParams.get("error")
    const oauthErrorDescription = urlParams.get("error_description")

    if (oauthError) {
      setError(oauthErrorDescription || oauthError || "OAuth error")
      return
    }

    if (!code || typeof code !== "string") {
      setError("No code provided in callback")
      return
    }
    const parsedState = state
      ? JSON.parse(decodeURIComponent(state as string))
      : {}
    const orgId =
      user_data?.organization ??
      parsedState?.orgId ??
      (typeof window !== "undefined" &&
        sessionStorage.getItem("outlook_oauth_org_id")) ??
      null

    hasExchanged.current = true

    const exchangeCode = async () => {
      try {
        const res: any = await http.post("/auth/outlook-oauth/exchange", {
          code,
          orgId,
        })

        if (res?.data?.success) {
          window.location.href = `${window.location.origin}/mainapp/profile`
        } else {
          setError("Token exchange failed")
        }
      } catch (err) {
        console.error(err)
        setError("Something went wrong")
      }
    }

    exchangeCode()
  }, [hasHydrated, user_data?.organization])

  if (error) {
    return (
      <div>
        <p>Error: {error}</p>
        <button
          onClick={() =>
            (window.location.href = `${window.location.origin}/mainapp/chat`)
          }
          style={{
            padding: "10px 20px",
            backgroundColor: "#0070f3",
            color: "white",
            border: "none",
            borderRadius: "4px",
            cursor: "pointer",
            marginTop: "10px",
          }}
        >
          Go back to dashboard
        </button>
      </div>
    )
  }

  return <div>Connecting to Outlook...</div>
}
