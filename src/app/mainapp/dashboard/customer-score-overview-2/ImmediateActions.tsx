import { renderSectionTitle } from "@/lib/sectionTitle"
import { formatCurrency } from "@/utility"
import { ChevronRight, Search } from "lucide-react"
import CustomerSlideIn from "../CustomerSlideIn"
import { useState, useMemo } from "react"
import useOrgCustomer from "@/store/organization_customer"
import useAuth from "@/store/user"
import { Input } from "@/components/ui/input"
import Pagination from "../../commoncompnents/pagination"
import DropDown from "../../commoncompnents/DropDown"

export default function ImmediateActions({
  highRiskCustomers = [],
  isLoading,
  pagination,
  onPageChange,
  onPageSizeChange,
}: any) {
  const [selectedCustomer, setSelectedCustomer] = useState<any>(null)
  // Search state (local to component)
  const [searchTerm, setSearchTerm] = useState("")

  const { setCustomerMessageStatus, appendCustomerConversationMessage } =
    useOrgCustomer()
  const { access_token } = useAuth()

  // Filter customers based on search term
  const filteredCustomers = useMemo(() => {
    if (!highRiskCustomers || highRiskCustomers.length === 0) {
      return []
    }

    // Filter customers based on search term
    return highRiskCustomers.filter(
      (customer: any) =>
        customer.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        customer.customer_name?.toLowerCase().includes(searchTerm.toLowerCase())
    )
  }, [highRiskCustomers, searchTerm])

  const getClockTime = () => {
    return new Date().toLocaleTimeString("en-US", {
      hour: "numeric",
      minute: "numeric",
      hour12: true,
    })
  }

  // ... existing sendCustomerMessageToBackend function ...
  const sendCustomerMessageToBackend = async (message: string) => {
    setCustomerMessageStatus(true)
    const messageId = `stream_${Date.now()}`
    const newSession = Math.floor(Math.random() * 1000).toString()
    const messagePayload = {
      sender: "user",
      message: message,
      question: message + `(from customer ${selectedCustomer.customer_name})`,
      time: getClockTime(),
      id: messageId,
      isStreaming: false,
      fromCustomer: true,
      customer: selectedCustomer._id,
      chatSession: 1,
    }
    // ✅ Append user's message immediately to store
    appendCustomerConversationMessage(messagePayload)
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_APP_URL}/${process.env.NEXT_PUBLIC_APP_VERSION}/conversation/add`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${access_token}`,
          },
          body: JSON.stringify(messagePayload),
        }
      )
      console.log("response", response)
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const reader = response.body?.getReader()
      if (!reader) {
        throw new Error("Response body is not readable")
      }

      const decoder = new TextDecoder()
      let buffer = ""
      let finalResponse: any = null // <- ✅ store the final response here

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
                finalResponse = data // <- ✅ capture final response
              } else {
                console.log("🔄 Partial chunk:", data)
              }
            } catch (err) {
              console.error("Failed to parse JSON:", err)
            }
          }
        }
      }

      // ✅ Use finalResponse after stream ends
      if (finalResponse) {
        console.log("📦 Final Message:", finalResponse.answer) // or whatever your key is
        const responseMessage = {
          sender: "ai",
          message: finalResponse.answer,
          time: getClockTime(),
          id: `resp_${Date.now()}`,
          fromCustomer: false,
          customer: selectedCustomer._id,
          chatSession: 1,
        }
        console.log("responseMessage", responseMessage)
        // ✅ Append response message to store
        appendCustomerConversationMessage(responseMessage)
        setCustomerMessageStatus(false)
      } else {
        console.warn("⚠️ No final response received.")
      }
    } catch (err) {
      console.log(err)
      setCustomerMessageStatus(false)
    }
  }

  // Early return for empty state
  if (!isLoading && highRiskCustomers.length === 0) {
    return (
      <div className="rounded-xl bg-white p-6 shadow">
        <div className="text-center text-gray-500">
          No high-risk customers found.
        </div>
      </div>
    )
  }

  return (
    <div className="rounded-xl bg-white p-6 shadow">
      {renderSectionTitle("Immediate Actions Required")}

      {/* Search and Controls */}
      <div className="mb-4 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative max-w-md flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
          <Input
            placeholder="Search customers..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <div className="flex items-center gap-2">
          <span className="text-sm text-gray-600">Show:</span>
          <div className="w-20">
            <DropDown
              options={["5", "10", "20"]}
              value={pagination?.limit?.toString() || "5"}
              onChange={(value) => {
                console.log("Page size changed to:", value)
                if (onPageSizeChange) {
                  onPageSizeChange(parseInt(value, 10))
                } else {
                  console.error("onPageSizeChange callback not provided!")
                }
              }}
            />
          </div>
          <span className="text-sm text-gray-600">
            Total: {pagination?.total || filteredCustomers.length} items
          </span>
        </div>
      </div>

      {/* Loading State */}
      {isLoading ? (
        <div className="space-y-4">
          {Array.from({ length: pagination?.limit || 5 }).map((_, idx) => (
            <div
              key={idx}
              className="flex animate-pulse items-center justify-between rounded-xl bg-gray-50 px-4 py-5"
            >
              <div>
                <div className="mb-2 h-4 w-32 rounded bg-gray-200"></div>
                <div className="h-3 w-48 rounded bg-gray-200"></div>
              </div>
              <div className="flex items-center gap-3">
                <div className="h-4 w-20 rounded bg-gray-200"></div>
                <div className="h-6 w-16 rounded-full bg-gray-200"></div>
                <div className="h-5 w-5 rounded bg-gray-200"></div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <>
          {/* Customer List */}
          <div className="space-y-4">
            {filteredCustomers.length > 0 ? (
              filteredCustomers.map((item: any, idx: number) => {
                const isCritical =
                  item.scoreLabel?.toLowerCase() === "high risk"
                const pillClasses = isCritical
                  ? "bg-red-100 text-red-700"
                  : "bg-amber-100 text-amber-700"
                return (
                  <div
                    key={idx}
                    className="flex items-center justify-between rounded-xl bg-gray-50 px-4 py-5"
                  >
                    <div>
                      <div className="font-semibold text-gray-800">
                        {item.name}
                      </div>
                      <div className="text-sm text-gray-500">
                        Score: {item.churn_risk_score} | Renewal:{" "}
                        {item.renewal_duration} days
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="text-right font-semibold text-green-600">
                        {formatCurrency(item?.arr ? parseFloat(item.arr) : 0)}
                      </div>
                      <span
                        className={`rounded-full px-3 py-1 text-xs ${pillClasses}`}
                      >
                        {/* {isCritical ? "Critical" : "High"} */}
                        {item.scoreLabel}
                      </span>
                      <ChevronRight
                        size={20}
                        className="cursor-pointer text-gray-400 transition-colors hover:text-gray-600"
                        onClick={() => {
                          console.log("item---", item)
                          const customerData = {
                            _id: item.company_id,
                            name: item.name,
                            arr: item.arr ? parseFloat(item.arr) : 0,
                            health_score: item.health_score,
                            churn_risk_score: item.churn_risk_score,
                            expansion_opp_score: item.expansion_opp_score,
                          }
                          setSelectedCustomer(customerData)
                        }}
                      />
                    </div>
                  </div>
                )
              })
            ) : (
              <div className="py-8 text-center text-gray-500">
                {searchTerm
                  ? "No customers found matching your search."
                  : "No high-risk customers found."}
              </div>
            )}
          </div>

          {/* Pagination Controls - Like Customer Overview */}
          {pagination && pagination.totalPages > 1 && (
            <div className="mt-6 flex justify-center">
              <Pagination
                current={pagination.currentPage}
                total={pagination.totalPages}
                onChange={(page) => {
                  console.log("Pagination clicked - page:", page)
                  if (onPageChange) {
                    onPageChange(page)
                  } else {
                    console.error("onPageChange callback not provided!")
                  }
                }}
              />
            </div>
          )}
        </>
      )}

      <CustomerSlideIn
        customer={selectedCustomer}
        onClose={() => {
          setSelectedCustomer(null)
        }}
        sendCustomerChat={sendCustomerMessageToBackend}
      />
    </div>
  )
}
