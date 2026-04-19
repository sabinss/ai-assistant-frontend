"use client"
import http from "@/config/http"
import { useEffect, useRef, useState } from "react"
import useAuth from "@/store/user"
import { OUTLOOK_PKCE_VERIFIER_KEY } from "@/utility/getOutlookUrl"

export default function OutlookOAuthCallback() {
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
      const msg = oauthErrorDescription || oauthError || "OAuth error"
      console.error("[Outlook OAuth] Provider returned error:", {
        error: oauthError,
        error_description: oauthErrorDescription,
      })
      setError(msg)
      return
    }

    if (!code || typeof code !== "string") {
      console.error("[Outlook OAuth] Missing ?code= in callback URL")
      setError("No code provided in callback")
      return
    }
    const parsedState = state ? JSON.parse(decodeURIComponent(state as string)) : {}
    const orgId =
      user_data?.organization ??
      parsedState?.orgId ??
      (typeof window !== "undefined" && sessionStorage.getItem("outlook_oauth_org_id")) ??
      null

    const codeVerifier =
      typeof window !== "undefined" ? sessionStorage.getItem(OUTLOOK_PKCE_VERIFIER_KEY) : null
    if (!codeVerifier) {
      console.error(
        "[Outlook OAuth] Missing PKCE code_verifier in sessionStorage. Key:",
        OUTLOOK_PKCE_VERIFIER_KEY,
        "Start Connect from profile again."
      )
      setError("Missing PKCE session (try connecting again from profile in this browser tab)")
      return
    }

    hasExchanged.current = true

    const exchangeCode = async () => {
      try {
        console.log("[Outlook OAuth] Exchanging code with backend (PKCE verifier present).", {
          orgId: orgId ?? "(none)",
          codeLength: code.length,
        })
        const res: any = await http.post("/auth/outlook-oauth/exchange", {
          code,
          orgId,
          code_verifier: codeVerifier,
        })

        sessionStorage.removeItem(OUTLOOK_PKCE_VERIFIER_KEY)

        if (res?.data?.success) {
          console.log("[Outlook OAuth] Exchange success, redirecting to profile.")
          window.location.href = `${window.location.origin}/mainapp/profile`
        } else {
          console.error("[Outlook OAuth] Exchange returned success=false:", res?.data)
          setError(res?.data?.message || "Token exchange failed")
        }
      } catch (err: unknown) {
        const ax = err as {
          response?: { status?: number; data?: Record<string, unknown> }
          message?: string
        }
        const status = ax?.response?.status
        const data = ax?.response?.data
        console.error("[Outlook OAuth] Token exchange failed:", {
          httpStatus: status,
          responseBody: data,
          message: ax?.message,
        })
        const msg =
          (typeof data?.message === "string" && data.message) ||
          (typeof data?.error_description === "string" && data.error_description) ||
          (typeof data?.error === "string" && data.error) ||
          ax?.message ||
          "Something went wrong"
        setError(msg)
      }
    }

    exchangeCode()
  }, [hasHydrated, user_data?.organization])

  if (error) {
    return (
      <div>
        <p>Error: {error}</p>
        <button
          onClick={() => (window.location.href = `${window.location.origin}/mainapp/chat`)}
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
