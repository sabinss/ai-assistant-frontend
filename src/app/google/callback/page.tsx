// pages/auth/google/callback.tsx
"use client"
import http from "@/config/http"
import { useEffect, useState } from "react"

export default function GoogleCallback() {
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
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
    console.log("parsedState", parsedState)
    console.log("code", code)
    // Call backend to exchange code for tokens
    const exchangeCode = async () => {
      try {
        const res: any = await http.post("/auth/google-oauth/exchange", {
          code,
          orgId: parsedState.orgId,
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
  }, [])

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
