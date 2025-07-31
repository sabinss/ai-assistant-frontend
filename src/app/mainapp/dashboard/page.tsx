"use client"

import Chip from "@/components/ui/customerlist-ui/chip"
import http from "@/config/http"
import useAuth from "@/store/user"
import { useEffect, useState, useMemo } from "react"
import { MdKeyboardArrowRight } from "react-icons/md"
import CustomerSlideIn from "./CustomerSlideIn"
import useOrgCustomer from "@/store/organization_customer"
import { formatDate } from "date-fns"
import useNavBarStore from "@/store/store"

export default function Dashboard() {
  const [loading, setLoading] = useState(false)
  const { user_data, access_token } = useAuth()
  const [orgCustomerData, setOrgCustomerData] = useState<any>(null)
  const [searchTerm, setSearchTerm] = useState("")
  const {
    setCustomerConversationMessage,
    setCustomerMessageStatus,
    appendCustomerConversationMessage,
  } = useOrgCustomer()
  const { botName } = useNavBarStore()

  const [selectedCustomer, setSelectedCustomer] = useState<any>(null)
  const [stats, setStats] = useState([
    { title: "Total Customers", value: "0", subtitle: "Active accounts" },
    { title: "Health Score Average", value: "0", subtitle: "" },
    { title: "At-Risk Customers", value: "0", subtitle: "" },
    { title: "Expansion Opportunities", value: "0", subtitle: "" },
  ])

  const filteredCustomers = useMemo(() => {
    if (!orgCustomerData?.customers) return []

    return orgCustomerData?.customers.filter((customer: any) =>
      customer?.name.toLowerCase().includes(searchTerm.toLowerCase())
    )
  }, [orgCustomerData?.customers, searchTerm])

  const getScoreColorClass = (
    score: number,
    type: "health" | "risk"
  ): string => {
    const riskLevels = [
      { min: 0, max: 20, className: "bg-red-600" },
      { min: 21, max: 40, className: "bg-orange-500" },
      { min: 41, max: 60, className: "bg-yellow-400" },
      { min: 61, max: 80, className: "bg-blue-500" },
      { min: 81, max: 100, className: "bg-green-600" },
    ]

    const levels = type === "health" ? [...riskLevels].reverse() : riskLevels
    const match = levels.find(({ min, max }) => score >= min && score <= max)
    return match?.className ?? "bg-gray-400"
  }

  function formatDate(dateStr: string) {
    const date = new Date(dateStr)
    const options = {
      month: "short",
      day: "numeric",
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    }
    return new Intl.DateTimeFormat("en-US", options).format(date)
  }
  useEffect(() => {
    console.log("selectedCustomer", selectedCustomer?._id)

    async function getCustomerConversationMessage() {
      try {
        const res = await http.get(
          `/conversations?user_id=${user_data?.user_id}&customer_id=${selectedCustomer?._id}`,
          {
            headers: { Authorization: `Bearer ${access_token}` },
          }
        )
        let messages: any = []
        const messageArray = res?.data || []
        messageArray?.forEach((message: any) => {
          messages.push({
            id: message._id,
            sender: "user",
            message: message.question,
            time: formatDate(message.createdAt.toString()),
            liked: false,
            disliked: false,
          })
          messages.push({
            id: `ANS_${message._id}`,
            sender: botName,
            message: message.answer,
            time: formatDate(message.createdAt.toString()),
            liked: message.liked_disliked === "liked",
            disliked: message.liked_disliked === "disliked",
          })
        })
        console.log("messageArray", messages)
        setCustomerConversationMessage(messages)
      } catch (error) {
        console.error("Error fetching user messages:", error)
        // setError("Error fetching user messages")
      }
    }
    getCustomerConversationMessage()
  }, [selectedCustomer?._id])

  useEffect(() => {
    async function getOrgCustomers() {
      try {
        setLoading(true)
        let res = await http.get(
          `/organization/${user_data?.organization}/customers`,
          {
            headers: { Authorization: `Bearer ${access_token}` },
          }
        )
        let response: any = await http.get(`/customer/redshift`, {
          headers: { Authorization: `Bearer ${access_token}` },
        })
        let redshiftCustomerDetails = response?.data?.data
        let customerDetails

        if (redshiftCustomerDetails?.length > 0) {
          customerDetails = res.data?.customers.map((x: any) => {
            const detail = redshiftCustomerDetails.find(
              (y: any) => x._id == y.company_id
            )
            x.redShiftCustomer = detail
            return x
          })
        }
        const orgCustomerData = { ...res.data, customers: customerDetails }
        console.log("Customer list Dashboard", orgCustomerData)
        setOrgCustomerData(orgCustomerData)
      } catch (err) {
      } finally {
        setLoading(false)
      }
    }
    getOrgCustomers()
  }, [])

  useEffect(() => {
    if (orgCustomerData?.customers?.length > 0) {
      console.log(
        "cacluataiont",
        orgCustomerData?.customers.map((x) => x?.redShiftCustomer?.health_score)
      )
      const totalCustomers = orgCustomerData?.customers?.length
      const healthScoreAverage =
        orgCustomerData?.customers
          ?.filter((x) => x?.redShiftCustomer?.health_score)
          .reduce(
            (acc: number, customer: any) =>
              acc + customer?.redShiftCustomer?.health_score,
            0
          ) / totalCustomers
      const atRiskCustomers = orgCustomerData?.customers?.filter(
        (customer: any) => customer?.redShiftCustomer?.churn_risk_score >= 70
      ).length
      const expansionCount = orgCustomerData?.customers?.filter(
        (customer: any) => customer?.redShiftCustomer?.expansion_opp_score >= 70
      ).length
      setStats([
        {
          title: "Total Customers",
          value: totalCustomers.toString(),
          subtitle: "Active accounts",
        },
        {
          title: "Health Score Average",
          value: healthScoreAverage.toString(),
          subtitle: "↑ 5 points vs last month",
        },
        {
          title: "At-Risk Customers",
          value: atRiskCustomers.toString(),
          subtitle: `${(atRiskCustomers / totalCustomers) * 100} of ${totalCustomers} customers`,
        },
        {
          title: "Expansion Opportunities",
          value: expansionCount.toString(),
          subtitle: `${(expansionCount / totalCustomers) * 100}% of ${totalCustomers} customers`,
        },
      ])
    }
  }, [orgCustomerData])
  function getClockTime() {
    return new Date().toLocaleTimeString("en-US", {
      hour: "numeric",
      minute: "numeric",
      hour12: true,
    })
  }

  const sendCustomerMessageToBackend = async (message: string) => {
    setCustomerMessageStatus(true)
    const messageId = `stream_${Date.now()}`
    const newSession = Math.floor(Math.random() * 1000).toString()
    const messagePayload = {
      sender: "user",
      message: message,
      question: message + `(from customer ${selectedCustomer.name})`,
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
        console.log({ buffer })

        for (const line of lines) {
          console.log({ line })

          if (line.trim() && line.startsWith("data: ")) {
            try {
              const data = JSON.parse(line.substring(6))
              console.log({ data })
              if (data.done) {
                console.log("✅ Final response:", data)
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
    // setCustomerConversation((prev) => [...prev, , messagePayload])
    // console.log("Sened message custoemr", customerConversation)
  }

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center justify-between rounded bg-white p-6 shadow">
        <div className="text-2xl font-bold ">Customer Success Dashboard</div>
        {/* Filters */}
        {/* <div className="flex justify-end space-x-2">
          <select className="rounded border px-3 py-1">
            <option>All Phases</option>
          </select>
          <select className="rounded border px-3 py-1">
            <option>All Risk Levels</option>
          </select>
        </div> */}
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <div
            key={stat.title}
            className="rounded-xl border bg-white p-4 shadow-sm"
          >
            <div className="text-sm text-gray-500">{stat.title}</div>
            <div className="m-2 text-2xl font-bold">{stat.value}</div>
            <div className="mt-1 text-xs text-gray-400">{stat.subtitle}</div>
          </div>
        ))}
      </div>

      {/* Customer Overview Table */}
      <div className="rounded-xl border bg-white p-4 shadow-sm">
        <div className="mb-4 text-lg font-semibold">Customer Overview</div>

        <input
          type="text"
          placeholder="Search customers..."
          className="mb-4 w-full rounded border px-3 py-2 md:w-1/3"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />

        <div className="overflow-x-auto">
          <table className="min-w-full text-left text-sm">
            <thead className="border-b text-gray-600">
              <tr>
                <th className="p-2">Customer</th>
                <th className="p-2">Health Score</th>
                <th className="p-2">Churn Risk</th>
                <th className="p-2">Expansion Opportunity</th>
                <th className="p-2">Phase</th>
                <th className="p-2">ARR</th>
                <th className="p-2">Renewal Date</th>
                <th className="p-2"></th>
              </tr>
            </thead>
            <tbody className="text-gray-700">
              {loading ? (
                <tr>
                  <td className="py-6 text-center" colSpan={8}>
                    Loading...
                  </td>
                </tr>
              ) : filteredCustomers.length === 0 ? (
                <tr>
                  <td className="py-6 text-center" colSpan={8}>
                    No customers to display
                  </td>
                </tr>
              ) : (
                filteredCustomers.map((customer: any, index: number) => {
                  const healthScore = customer?.redShiftCustomer?.health_score
                  const riskScore = customer?.redShiftCustomer?.churn_risk_score
                  const oppScore =
                    customer?.redShiftCustomer?.expansion_opp_score

                  const healthColorClass = getScoreColorClass(
                    healthScore ?? 0,
                    "health"
                  )
                  const oppColor = getScoreColorClass(oppScore ?? 0, "health")

                  return (
                    <tr
                      key={customer.id || index}
                      className="border-b odd:bg-white even:bg-gray-100 hover:bg-gray-50"
                    >
                      <td className="px-6 py-4">{customer.name}</td>
                      <td className="px-6 py-4">
                        {healthScore ? (
                          <Chip
                            value={healthScore}
                            otherClasses={`text-white font-bold w-9 h-9  text-white flex items-center justify-center ${healthColorClass}`}
                          />
                        ) : (
                          "N/A"
                        )}
                      </td>
                      <td className="px-6 py-4">
                        {" "}
                        {riskScore ? (
                          <Chip
                            value={riskScore}
                            otherClasses={`text-white w-9 h-9  font-bold  text-white flex items-center justify-center ${healthColorClass}`}
                          />
                        ) : (
                          "N/A"
                        )}
                      </td>
                      <td className="px-6 py-4">
                        {oppScore ? (
                          <Chip
                            value={oppScore}
                            otherClasses={`text-white font-bold w-9 h-9  text-white flex items-center justify-center ${oppColor}`}
                          />
                        ) : (
                          "N/A"
                        )}
                      </td>
                      <td className="px-6 py-4">{customer.phase ?? "N/A"}</td>
                      <td className="px-6 py-4">{customer.arr ?? "N/A"}</td>
                      <td className="px-6 py-4">
                        {customer.renewal_date ?? "N/A"}
                      </td>
                      <td className="px-6 py-4">
                        <MdKeyboardArrowRight
                          size={25}
                          className="cursor-pointer"
                          onClick={() => {
                            setSelectedCustomer(customer)
                          }}
                        />
                      </td>
                    </tr>
                  )
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
      <CustomerSlideIn
        customer={selectedCustomer}
        onClose={() => setSelectedCustomer(null)}
        sendCustomerChat={sendCustomerMessageToBackend}
      />
    </div>
  )
}
