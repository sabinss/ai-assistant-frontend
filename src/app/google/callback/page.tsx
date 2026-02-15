// pages/auth/google/callback.tsx
"use client"
import http from "@/config/http"
import { useEffect, useRef, useState } from "react"
import useAuth from "@/store/user"

export default function GoogleCallback() {
  const [error, setError] = useState<string | null>(null)
  const user_data = useAuth((s) => s.user_data)
  const hasHydrated = useAuth((s) => s._hasHydrated)
  const hasExchanged = useRef(false)

  useEffect(() => {
    if (!hasHydrated || hasExchanged.current) return

    const urlParams = new URLSearchParams(window.location.search)
    const code = urlParams.get("code")
    const state = urlParams.get("state")

    if (!code || typeof code !== "string") {
      setError("No code provided in callback")
      return
    }
    const parsedState = state
      ? JSON.parse(decodeURIComponent(state as string))
      : {}
    // Get orgId from Zustand first, then state, then sessionStorage
    const orgId =
      user_data?.organization ??
      parsedState?.orgId ??
      (typeof window !== "undefined" && sessionStorage.getItem("google_oauth_org_id")) ??
      null

    hasExchanged.current = true

    // Call backend to exchange code for tokens
    const exchangeCode = async () => {
      try {
        const res: any = await http.post("/auth/google-oauth/exchange", {
          code,
          orgId,
        })

        const data = res
        console.log("data----", data)
        if (data?.data?.success) {
          console.log("code exchanged successfully")
          window.location.href = `${process.env.NEXT_PUBLIC_APP_FE_URL}/mainapp/profile`
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
            (window.location.href = `${process.env.NEXT_PUBLIC_APP_FE_URL}/mainapp/chat`)
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

  return <div>Connecting to Google...</div>
}
