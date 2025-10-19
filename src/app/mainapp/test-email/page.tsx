"use client"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import {
  sendTestChatEmail,
  generateTestEmailTemplate,
} from "@/utility/emailTesting"
import { toast } from "react-toastify"
import "react-toastify/dist/ReactToastify.css"

export default function TestEmailPage() {
  const [email, setEmail] = useState("")
  const [query, setQuery] = useState("hi")
  const [isLoading, setIsLoading] = useState(false)
  const [emailTemplate, setEmailTemplate] = useState<any>(null)

  const handleSendTestEmail = async () => {
    if (!email.trim()) {
      toast.error("Please enter an email address")
      return
    }

    setIsLoading(true)
    try {
      const result = await sendTestChatEmail(email, query)

      if (result.success) {
        toast.success("Test email sent successfully!")
      } else {
        toast.error(result.message || "Failed to send test email")
      }
    } catch (error) {
      toast.error("Error sending test email")
      console.error("Error:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleGenerateTemplate = () => {
    const template = generateTestEmailTemplate(query)
    setEmailTemplate(template)
    toast.success("Email template generated! Check console for details.")
  }

  const handleOpenTestLink = () => {
    const testUrl = `${window.location.origin}/mainapp/chat?query=${encodeURIComponent(query)}`
    window.open(testUrl, "_blank")
  }

  return (
    <div className="mx-auto max-w-4xl p-6">
      <h1 className="mb-6 text-3xl font-bold">Email Testing Tool</h1>

      <div className="space-y-6">
        {/* Test Configuration */}
        <div className="rounded-lg border bg-white p-6 shadow-sm">
          <h2 className="mb-4 text-xl font-semibold">Test Configuration</h2>

          <div className="space-y-4">
            <div>
              <label className="mb-2 block text-sm font-medium">
                Email Address
              </label>
              <Input
                type="email"
                placeholder="Enter email address to send test to"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium">
                Test Query
              </label>
              <Input
                type="text"
                placeholder="Enter the query to pre-fill in chat"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                className="w-full"
              />
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="rounded-lg border bg-white p-6 shadow-sm">
          <h2 className="mb-4 text-xl font-semibold">Actions</h2>

          <div className="flex flex-wrap gap-4">
            <Button
              onClick={handleSendTestEmail}
              disabled={isLoading || !email.trim()}
              className="bg-[#174894] hover:bg-[#173094]"
            >
              {isLoading ? "Sending..." : "Send Test Email"}
            </Button>

            <Button onClick={handleGenerateTemplate} variant="outline">
              Generate Email Template
            </Button>

            <Button onClick={handleOpenTestLink} variant="outline">
              Open Test Link in New Tab
            </Button>
          </div>
        </div>

        {/* Test Link Preview */}
        <div className="rounded-lg border bg-white p-6 shadow-sm">
          <h2 className="mb-4 text-xl font-semibold">Test Link Preview</h2>

          <div className="space-y-2">
            <p className="text-sm text-gray-600">Generated URL:</p>
            <code className="block break-all rounded bg-gray-100 p-3 text-sm">
              {`${typeof window !== "undefined" ? window.location.origin : "http://localhost:3000"}/mainapp/chat?query=${encodeURIComponent(query)}`}
            </code>

            <p className="mt-4 text-sm text-gray-600">
              When clicked, this link will:
            </p>
            <ul className="list-inside list-disc space-y-1 text-sm text-gray-600">
              <li>
                Open the chat section in a new tab (if website is already open)
              </li>
              <li>
                Pre-fill the chat input with: <strong>"{query}"</strong>
              </li>
              <li>Automatically send the message after 1 second</li>
            </ul>
          </div>
        </div>

        {/* Email Template Preview */}
        {emailTemplate && (
          <div className="rounded-lg border bg-white p-6 shadow-sm">
            <h2 className="mb-4 text-xl font-semibold">
              Email Template Preview
            </h2>

            <div className="space-y-4">
              <div>
                <h3 className="mb-2 font-medium">Subject:</h3>
                <p className="text-sm text-gray-600">{emailTemplate.subject}</p>
              </div>

              <div>
                <h3 className="mb-2 font-medium">HTML Content Preview:</h3>
                <div
                  className="max-h-96 overflow-y-auto rounded border bg-gray-50 p-4"
                  dangerouslySetInnerHTML={{ __html: emailTemplate.html }}
                />
              </div>
            </div>
          </div>
        )}

        {/* Instructions */}
        <div className="rounded-lg border border-blue-200 bg-blue-50 p-6">
          <h2 className="mb-4 text-xl font-semibold text-blue-800">
            How to Test
          </h2>

          <div className="space-y-3 text-sm text-blue-700">
            <div>
              <strong>1. Send Test Email:</strong>
              <p>
                Enter an email address and click "Send Test Email" to send a
                real email with the chat link.
              </p>
            </div>

            <div>
              <strong>2. Generate Template:</strong>
              <p>
                Click "Generate Email Template" to see the HTML template that
                would be sent (check console for full details).
              </p>
            </div>

            <div>
              <strong>3. Test Link Directly:</strong>
              <p>
                Click "Open Test Link in New Tab" to test the chat functionality
                directly without sending an email.
              </p>
            </div>

            <div>
              <strong>4. Expected Behavior:</strong>
              <p>
                When the link is clicked, it should open the chat page, pre-fill
                the input with your query, and automatically send it after 1
                second.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
