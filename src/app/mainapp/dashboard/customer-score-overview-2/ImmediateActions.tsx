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

export default function ImmediateActions({ highRiskCustomers }: any) {
  const [selectedCustomer, setSelectedCustomer] = useState<any>(null)
  // Pagination and search states
  const [searchTerm, setSearchTerm] = useState("")
  const [currentPage, setCurrentPage] = useState(1)
  const [pageSize, setPageSize] = useState(5)

  const { setCustomerMessageStatus, appendCustomerConversationMessage } =
    useOrgCustomer()
  const { access_token } = useAuth()

  // Filter and paginate customers
  const filteredAndPaginatedCustomers = useMemo(() => {
    if (!highRiskCustomers || highRiskCustomers.length === 0) {
      return { customers: [], totalPages: 0, totalCount: 0 }
    }

    // Filter customers based on search term
    const filtered = highRiskCustomers.filter(
      (customer: any) =>
        customer.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        customer.customer_name?.toLowerCase().includes(searchTerm.toLowerCase())
    )

    // Calculate pagination
    const totalCount = filtered.length
    const totalPages = Math.ceil(totalCount / pageSize)
    const startIndex = (currentPage - 1) * pageSize
    const endIndex = startIndex + pageSize
    const customers = filtered.slice(startIndex, endIndex)

    return { customers, totalPages, totalCount }
  }, [highRiskCustomers, searchTerm, currentPage, pageSize])

  // Reset to first page when search term changes
  const handleSearchChange = (value: string) => {
    setSearchTerm(value)
    setCurrentPage(1)
  }

  // Reset to first page when page size changes
  const handlePageSizeChange = (newSize: string) => {
    setPageSize(parseInt(newSize, 10))
    setCurrentPage(1)
  }

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
            onChange={(e) => handleSearchChange(e.target.value)}
            className="pl-10"
          />
        </div>
        <div className="flex items-center gap-2">
          <span className="text-sm text-gray-600">Show:</span>
          <div className="w-20">
            <DropDown
              options={["5", "10", "20"]}
              value={pageSize.toString()}
              onChange={handlePageSizeChange}
            />
          </div>
          <span className="text-sm text-gray-600">
            Total: {filteredAndPaginatedCustomers.totalCount} items
          </span>
        </div>
      </div>

      {/* Customer List */}
      <div className="space-y-4">
        {filteredAndPaginatedCustomers.customers.length > 0 ? (
          filteredAndPaginatedCustomers.customers.map(
            (item: any, idx: number) => {
              const isCritical = item.scoreLabel?.toLowerCase() === "high risk"
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
                      {isCritical ? "Critical" : "High"}
                    </span>
                    <ChevronRight
                      size={20}
                      className="cursor-pointer text-gray-400 transition-colors hover:text-gray-600"
                      onClick={() => {
                        // Transform the item data to match the expected customer format
                        const customerData = {
                          _id: item.customer_id,
                          name: item.customer_name,
                          arr: item.arr ? parseFloat(item.arr) : 0,
                          health_score: 0, // Default value since not available
                          churn_risk_score: item.churn_risk_score,
                          expansion_opp_score: 0, // Default value since not available
                          // Add any other fields that CustomerSlideIn might need
                        }
                        setSelectedCustomer(customerData)
                      }}
                    />
                  </div>
                </div>
              )
            }
          )
        ) : (
          <div className="py-8 text-center text-gray-500">
            {searchTerm
              ? "No customers found matching your search."
              : "No high-risk customers found."}
          </div>
        )}
      </div>

      {/* Pagination */}
      {filteredAndPaginatedCustomers.totalPages > 1 && (
        <div className="mt-6 flex justify-center">
          <Pagination
            current={currentPage}
            total={filteredAndPaginatedCustomers.totalPages}
            onChange={setCurrentPage}
          />
        </div>
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
