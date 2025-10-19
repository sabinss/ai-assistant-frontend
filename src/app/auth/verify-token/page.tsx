"use client"
import React, { useState, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Mail, ArrowLeft, CheckCircle } from "lucide-react"
import { toast } from "react-toastify"
import "react-toastify/dist/ReactToastify.css"
import http from "@/config/http"
import Link from "next/link"

export default function VerifyTokenPage() {
  const [email, setEmail] = useState("")
  const [isResending, setIsResending] = useState(false)
  const [isVerifying, setIsVerifying] = useState(false)
  const [token, setToken] = useState("")
  const [showTokenInput, setShowTokenInput] = useState(false)
  const router = useRouter()
  const searchParams = useSearchParams()

  useEffect(() => {
    // Get email from URL params if available
    const emailParam = searchParams.get("email")
    if (emailParam) {
      setEmail(emailParam)
    }
  }, [searchParams])

  const handleResendToken = async () => {
    if (!email) {
      toast.error("Please enter your email address")
      return
    }

    setIsResending(true)
    try {
      const response = await http.post("/auth/resend-verification", { email })
      if (response.status === 200) {
        toast.success("Verification token sent to your email")
        setShowTokenInput(true)
      }
    } catch (error: any) {
      console.error("Error resending token:", error)
      toast.error(
        error.response?.data?.message || "Failed to send verification token"
      )
    } finally {
      setIsResending(false)
    }
  }

  const handleVerifyToken = async () => {
    if (!token) {
      toast.error("Please enter the verification token")
      return
    }

    setIsVerifying(true)
    try {
      const response = await http.post("/auth/verify-token", {
        email,
        token,
      })
      if (response.status === 200) {
        toast.success("Email verified successfully!")
        router.push("/auth/signin")
      }
    } catch (error: any) {
      console.error("Error verifying token:", error)
      toast.error(error.response?.data?.message || "Invalid verification token")
    } finally {
      setIsVerifying(false)
    }
  }

  return (
    <div className="px-8">
      <div className="mb-6">
        <Link
          href="/auth/signin"
          className="mb-4 flex items-center text-blue-500 hover:underline"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Sign In
        </Link>
        <h1 className="text-center text-2xl font-semibold">
          Email Verification Required
        </h1>
        <p className="mt-2 text-center text-gray-600">
          Please verify your email address to continue
        </p>
      </div>

      <div className="flex flex-col gap-4">
        {/* Email Input */}
        <div className="flex rounded-lg border-2 border-[#CCC] bg-[#E7E7E7] px-3 py-2">
          <input
            className="w-full bg-transparent text-sm text-slate-600 outline-none"
            type="email"
            placeholder="Enter your email address"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <div className="border-l-2 border-[#CCC] pl-2">
            <Mail className="text-[#9e9c9c]" />
          </div>
        </div>

        {/* Resend Token Button */}
        <Button
          onClick={handleResendToken}
          disabled={isResending || !email}
          className="bg-[#174894] hover:bg-[#173094] disabled:opacity-50"
        >
          {isResending ? (
            <div className="flex items-center">
              <svg
                aria-hidden="true"
                role="status"
                className="me-3 inline h-4 w-4 animate-spin text-white"
                viewBox="0 0 100 101"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M100 50.5908C100 78.2051 77.6142 100.591 50 100.591C22.3858 100.591 0 78.2051 0 50.5908C0 22.9766 22.3858 0.59082 50 0.59082C77.6142 0.59082 100 22.9766 100 50.5908ZM9.08144 50.5908C9.08144 73.1895 27.4013 91.5094 50 91.5094C72.5987 91.5094 90.9186 73.1895 90.9186 50.5908C90.9186 27.9921 72.5987 9.67226 50 9.67226C27.4013 9.67226 9.08144 27.9921 9.08144 50.5908Z"
                  fill="#E5E7EB"
                />
                <path
                  d="M93.9676 39.0409C96.393 38.4038 97.8624 35.9116 97.0079 33.5539C95.2932 28.8227 92.871 24.3692 89.8167 20.348C85.8452 15.1192 80.8826 10.7238 75.2124 7.41289C69.5422 4.10194 63.2754 1.94025 56.7698 1.05124C51.7666 0.367541 46.6976 0.446843 41.7345 1.27873C39.2613 1.69328 37.813 4.19778 38.4501 6.62326C39.0873 9.04874 41.5694 10.4717 44.0505 10.1071C47.8511 9.54855 51.7191 9.52689 55.5402 10.0491C60.8642 10.7766 65.9928 12.5457 70.6331 15.2552C75.2735 17.9648 79.3347 21.5619 82.5849 25.841C84.9175 28.9121 86.7997 32.2913 88.1811 35.8758C89.083 38.2158 91.5421 39.6781 93.9676 39.0409Z"
                  fill="currentColor"
                />
              </svg>
              Sending...
            </div>
          ) : (
            "Send Verification Token"
          )}
        </Button>

        {/* Token Input Section */}
        {showTokenInput && (
          <div className="mt-6 rounded-lg border border-blue-200 bg-blue-50 p-4">
            <div className="mb-3 flex items-center">
              <CheckCircle className="mr-2 h-5 w-5 text-blue-600" />
              <span className="text-sm font-medium text-blue-800">
                Check your email for the verification token
              </span>
            </div>

            <div className="mb-3 flex rounded-lg border-2 border-[#CCC] bg-[#E7E7E7] px-3 py-2">
              <input
                className="w-full bg-transparent text-sm text-slate-600 outline-none"
                type="text"
                placeholder="Enter verification token"
                value={token}
                onChange={(e) => setToken(e.target.value)}
              />
            </div>

            <Button
              onClick={handleVerifyToken}
              disabled={isVerifying || !token}
              className="w-full bg-green-600 hover:bg-green-700 disabled:opacity-50"
            >
              {isVerifying ? (
                <div className="flex items-center justify-center">
                  <svg
                    aria-hidden="true"
                    role="status"
                    className="me-3 inline h-4 w-4 animate-spin text-white"
                    viewBox="0 0 100 101"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      d="M100 50.5908C100 78.2051 77.6142 100.591 50 100.591C22.3858 100.591 0 78.2051 0 50.5908C0 22.9766 22.3858 0.59082 50 0.59082C77.6142 0.59082 100 22.9766 100 50.5908ZM9.08144 50.5908C9.08144 73.1895 27.4013 91.5094 50 91.5094C72.5987 91.5094 90.9186 73.1895 90.9186 50.5908C90.9186 27.9921 72.5987 9.67226 50 9.67226C27.4013 9.67226 9.08144 27.9921 9.08144 50.5908Z"
                      fill="#E5E7EB"
                    />
                    <path
                      d="M93.9676 39.0409C96.393 38.4038 97.8624 35.9116 97.0079 33.5539C95.2932 28.8227 92.871 24.3692 89.8167 20.348C85.8452 15.1192 80.8826 10.7238 75.2124 7.41289C69.5422 4.10194 63.2754 1.94025 56.7698 1.05124C51.7666 0.367541 46.6976 0.446843 41.7345 1.27873C39.2613 1.69328 37.813 4.19778 38.4501 6.62326C39.0873 9.04874 41.5694 10.4717 44.0505 10.1071C47.8511 9.54855 51.7191 9.52689 55.5402 10.0491C60.8642 10.7766 65.9928 12.5457 70.6331 15.2552C75.2735 17.9648 79.3347 21.5619 82.5849 25.841C84.9175 28.9121 86.7997 32.2913 88.1811 35.8758C89.083 38.2158 91.5421 39.6781 93.9676 39.0409Z"
                      fill="currentColor"
                    />
                  </svg>
                  Verifying...
                </div>
              ) : (
                "Verify Token"
              )}
            </Button>
          </div>
        )}

        <div className="mt-6 text-center text-sm text-gray-600">
          <p>
            Didn't receive the email? Check your spam folder or{" "}
            <button
              onClick={handleResendToken}
              className="text-blue-500 hover:underline"
              disabled={isResending}
            >
              resend token
            </button>
          </p>
        </div>
      </div>
    </div>
  )
}
