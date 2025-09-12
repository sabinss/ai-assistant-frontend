"use client"

import Chip from "@/components/ui/customerlist-ui/chip"
import http from "@/config/http"
import useAuth from "@/store/user"
import { useEffect, useState, useMemo } from "react"
import { MdKeyboardArrowRight } from "react-icons/md"
import CustomerSlideIn from "./CustomerSlideIn"
import useOrgCustomer from "@/store/organization_customer"
import useNavBarStore from "@/store/store"
import { trackEvent } from "@/utility/tracking"
import { useRouter } from "next/navigation"
import { useChurnDashboardStore } from "@/store/churn_dashboard"
import { formatCurrency } from "@/utility"
import { AlertCircle } from "lucide-react"

export default function Dashboard() {
  const [activeTab, setActiveTab] = useState("alert")

  const [loading, setLoading] = useState(false)
  const { user_data, access_token } = useAuth()
  const [orgCustomerData, setOrgCustomerData] = useState<any>(null)
  const [searchTerm, setSearchTerm] = useState("")
  const {
    setCustomerConversationMessage,
    setCustomerMessageStatus,
    appendCustomerConversationMessage,
    clearCustomerConversationMessages,
  } = useOrgCustomer()
  const { botName } = useNavBarStore()
  const router = useRouter()
  const fetchHighRiskChurnStats = useChurnDashboardStore(
    (s) => s.fetchHighRiskChurnStats
  )
  const churnLoading = useChurnDashboardStore((s) => s.isLoading)

  const [selectedCustomer, setSelectedCustomer] = useState<any>(null)
  const [alertData, setAlertData] = useState<any>([])
  const [stats, setStats] = useState<
    Array<{
      id: string
      title: string
      value: string
      subtitle: string
      arrValue?: string
    }>
  >([
    {
      id: "total",
      title: "Total Customers",
      value: "0",
      subtitle: "Active accounts",
    },
    {
      id: "healthAvg",
      title: "Health Score Average",
      value: "0",
      subtitle: "",
    },
    { id: "atRisk", title: "At-Risk Customers", value: "0", subtitle: "" },
    {
      id: "expansion",
      title: "Expansion Opportunities",
      value: "0",
      subtitle: "",
    },
  ])

  const filteredCustomers = useMemo(() => {
    if (!orgCustomerData?.customers) return []

    return orgCustomerData?.customers.filter((customer: any) =>
      customer?.name?.toLowerCase().includes(searchTerm.toLowerCase())
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
    const options: Intl.DateTimeFormatOptions = {
      month: "short",
      day: "numeric",
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    }
    return new Intl.DateTimeFormat("en-US", options).format(date)
  }
  useEffect(() => {
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
        setCustomerConversationMessage(messages)
      } catch (error) {
        console.error("Error fetching user messages:", error)
        // setError("Error fetching user messages")
      }
    }
    if (selectedCustomer?._id && user_data?.user_id) {
      getCustomerConversationMessage()
    }
  }, [selectedCustomer?._id])

  useEffect(() => {
    async function fetchCustomerAlertData() {
      try {
        const res = await http.get(`/customer/alerts`, {
          headers: { Authorization: `Bearer ${access_token}` },
        })
        console.log("Alert response", res.data)
        if (res?.data?.data?.length > 0) {
          setAlertData(res?.data?.data)
        }
      } catch (err) {
        console.log("Fetch alert data error", err)
      }
    }
    fetchCustomerAlertData()
  }, [user_data?.organization])

  useEffect(() => {
    async function getOrgCustomers() {
      if (!user_data?.organization || !access_token) return

      try {
        setLoading(true)

        // Now only fetch from redshift as it contains all customer data
        const redshiftRes = await http.get(`/customer/redshift`, {
          headers: { Authorization: `Bearer ${access_token}` },
        })

        console.log("redshiftRes > customers", redshiftRes)

        const redshiftCustomerDetails = redshiftRes?.data?.data || []
        console.log("Redshift customer details:", redshiftCustomerDetails)

        // Add _id field to each customer object for compatibility
        const customersWithId = redshiftCustomerDetails.map(
          (customer: any) => ({
            ...customer,
            _id: customer.company_id,
          })
        )

        // Use redshift data directly as the customer data source
        const orgCustomerData = {
          customers: customersWithId,
        }

        console.log("Customer list Dashboard", orgCustomerData)
        setOrgCustomerData(orgCustomerData)
      } catch (err) {
        console.error("Error fetching customers:", err)
      } finally {
        setLoading(false)
      }
    }

    getOrgCustomers()
  }, [user_data?.organization, access_token])

  useEffect(() => {
    if (!orgCustomerData?.customers?.length) return

    const customers = orgCustomerData.customers
    const totalCustomers = customers.length
    const threshold = 40
    // Calculate all metrics in a single pass for better performance
    let totalHealthScore = 0
    let customersWithHealthScore = 0
    let atRiskCustomers = 0
    let expansionCount = 0
    let atRiskCustomersARR = 0
    let atRiskCustomersWithARR = 0
    customers.forEach((customer: any) => {
      // Now customer data comes directly from redshift, so no need for redShiftCustomer property
      // Health score calculation
      if (customer.health_score) {
        totalHealthScore += customer.health_score
        customersWithHealthScore++
      }

      // Risk calculation
      if (customer.churn_risk_score > threshold) {
        atRiskCustomers++
        // Calculate ARR for at-risk customers
        if (customer.arr && !isNaN(parseFloat(customer.arr))) {
          atRiskCustomersARR += parseFloat(customer.arr)
          atRiskCustomersWithARR++
        }
      }

      // Expansion calculation
      if (customer.expansion_opp_score >= 70) {
        expansionCount++
      }
    })

    const healthScoreAverage =
      customersWithHealthScore > 0
        ? (totalHealthScore / customersWithHealthScore).toFixed(1)
        : "0"
    const threasoldCustomer = customers.filter((x: any) => {
      if (x.churn_risk_score > threshold) {
        return true
      }
    })

    const atRiskAverageARR = threasoldCustomer.reduce(
      (acc: number, customer: any) => {
        return +customer.arr + acc
      },
      0
    )
    setStats([
      {
        id: "total",
        title: "Total Customers",
        value: totalCustomers.toString(),
        subtitle: "Active accounts",
      },
      {
        id: "healthAvg",
        title: "Health Score Average",
        value: healthScoreAverage,
        subtitle: "",
        // 5 points vs last month
      },
      {
        id: "atRisk",
        title: "At-Risk Customers",
        value: atRiskCustomers.toString(),
        subtitle: `${((atRiskCustomers / totalCustomers) * 100).toFixed(1)}% of ${totalCustomers} customers`,
        arrValue: `${atRiskAverageARR}`,
      },
      {
        id: "expansion",
        title: "Expansion Opportunities",
        value: expansionCount.toString(),
        subtitle: `${((expansionCount / totalCustomers) * 100).toFixed(1)}% of ${totalCustomers} customers`,
      },
    ])
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
    // setCustomerConversation((prev) => [...prev, , messagePayload])
    // console.log("Sened message custoemr", customerConversation)
  }

  return (
    <div className="space-y-6 p-6">
      <div className="mt-5 flex items-center justify-between rounded bg-white p-6 shadow">
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
            key={stat.id}
            className={`rounded-xl border bg-white p-4 shadow-sm ${
              stat.id === "atRisk" ? "cursor-pointer hover:shadow-md" : ""
            }`}
            onClick={async () => {
              if (stat.id === "atRisk") {
                try {
                  await useChurnDashboardStore
                    .getState()
                    .fetchHighRiskChurnStats(access_token || "")
                  router.push("/mainapp/dashboard/customer-score-overview")
                } catch (e) {
                  router.push("/mainapp/dashboard/customer-score-overview")
                }
              } else if (stat.id === "total") {
                setSelectedCustomer(null)
              } else {
                setSelectedCustomer(stat)
              }
            }}
          >
            {stat.id === "atRisk" ? (
              <div>
                <div className="flex items-center justify-between">
                  <div className="text-sm text-gray-500">{stat.title}</div>
                  <div className="text-sm text-gray-500">ARRs</div>
                </div>

                <div className="flex items-center justify-between">
                  <div className="m-2 text-2xl font-bold">
                    {stat.id === "atRisk" && churnLoading
                      ? "Loading..."
                      : stat.value}
                  </div>
                  {/* <div>{stat.arrValue}</div> */}
                  <div>
                    {formatCurrency(
                      stat?.arrValue ? parseFloat(stat.arrValue) : 0
                    )}
                  </div>
                </div>
              </div>
            ) : (
              <div>
                <div className="text-sm text-gray-500">{stat.title}</div>
                <div className="m-2 text-2xl font-bold">
                  {stat.id === "atRisk" && churnLoading
                    ? "Loading..."
                    : stat.value}
                </div>

                <div className="mt-1 text-xs text-gray-400">
                  {stat.subtitle}
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
      {/* tab */}
      <div className="">
        {/* Tab Header */}
        <div className="flex space-x-4 border-b border-gray-300">
          <button
            onClick={() => setActiveTab("alert")}
            className={`flex items-center gap-2 rounded-t-lg px-4 py-2 font-medium transition ${
              activeTab === "alert"
                ? "border-b-2 border-blue-500 bg-blue-100 text-blue-700"
                : "text-gray-500 hover:text-gray-700"
            }`}
          >
            <AlertCircle size={18} />
            Alert
          </button>
          <button
            onClick={() => setActiveTab("customer")}
            className={`rounded-t-lg px-4 py-2 font-medium transition ${
              activeTab === "customer"
                ? "border-b-2 border-blue-500 bg-blue-100 text-blue-700"
                : "text-gray-500 hover:text-gray-700"
            }`}
          >
            👤 Customer Overview
          </button>
        </div>

        {/* Tab Content */}
        <div className="mt-4">
          {activeTab === "alert" && (
            <div className="rounded-xl border bg-white p-4 shadow-sm">
              <div className="overflow-x-auto">
                <table className="min-w-full text-left text-sm">
                  <thead className="border-b text-gray-600">
                    <tr>
                      <th className="p-2">Company Name</th>
                      <th className="p-2">Alert</th>
                      <th className="p-2">Date</th>
                      <th className="p-2">Owner</th>
                      <th className="p-2">Source</th>
                      <th className="p-2">Addressed</th>
                      <th className="p-2"></th>
                    </tr>
                  </thead>
                  <tbody className="text-gray-700">
                    {loading ? (
                      <>
                        {[...Array(5)].map((_, index) => (
                          <tr key={index} className="animate-pulse border-b">
                            <td className="px-6 py-4">
                              <div className="h-4 w-32 rounded bg-gray-200"></div>
                            </td>
                            <td className="px-6 py-4">
                              <div className="h-8 w-8 rounded-full bg-gray-200"></div>
                            </td>
                            <td className="px-6 py-4">
                              <div className="h-8 w-8 rounded-full bg-gray-200"></div>
                            </td>
                            <td className="px-6 py-4">
                              <div className="h-8 w-8 rounded-full bg-gray-200"></div>
                            </td>
                            <td className="px-6 py-4">
                              <div className="h-4 w-16 rounded bg-gray-200"></div>
                            </td>
                            <td className="px-6 py-4">
                              <div className="h-4 w-20 rounded bg-gray-200"></div>
                            </td>
                            <td className="px-6 py-4">
                              <div className="h-4 w-24 rounded bg-gray-200"></div>
                            </td>
                            <td className="px-6 py-4">
                              <div className="h-6 w-6 rounded bg-gray-200"></div>
                            </td>
                          </tr>
                        ))}
                      </>
                    ) : alertData.length === 0 ? (
                      <tr>
                        <td className="py-6 text-center" colSpan={8}>
                          No alert to display
                        </td>
                      </tr>
                    ) : (
                      alertData.map((item: any, index: number) => {
                        return (
                          <tr
                            key={item?.company_id || index}
                            className="border-b odd:bg-white even:bg-gray-100 hover:bg-gray-50"
                          >
                            <td className="px-6 py-4">{item?.company_name}</td>
                            <td className="px-4 py-4">
                              {item?.alert ?? "N/A"}
                            </td>
                            <td className="px-6 py-4">
                              {item?.week_date ?? "N/A"}
                            </td>
                            <td className="px-6 py-4">
                              {item?.owner_id ?? "N/A"}
                            </td>
                            <td className="px-6 py-4">
                              {item?.source ?? "N/A"}
                            </td>
                            <td className="px-6 py-4">
                              <input
                                type="checkbox"
                                checked={item?.addressed}
                                readOnly
                                className="h-4 w-4 cursor-default"
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
          )}

          {activeTab === "customer" && (
            <>
              {/* Customer Overview Table */}
              <div className="rounded-xl border bg-white p-4 shadow-sm">
                <div className="mb-4 text-lg font-semibold">
                  Customer Overview
                </div>

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
                        <>
                          {[...Array(5)].map((_, index) => (
                            <tr key={index} className="animate-pulse border-b">
                              <td className="px-6 py-4">
                                <div className="h-4 w-32 rounded bg-gray-200"></div>
                              </td>
                              <td className="px-6 py-4">
                                <div className="h-8 w-8 rounded-full bg-gray-200"></div>
                              </td>
                              <td className="px-6 py-4">
                                <div className="h-8 w-8 rounded-full bg-gray-200"></div>
                              </td>
                              <td className="px-6 py-4">
                                <div className="h-8 w-8 rounded-full bg-gray-200"></div>
                              </td>
                              <td className="px-6 py-4">
                                <div className="h-4 w-16 rounded bg-gray-200"></div>
                              </td>
                              <td className="px-6 py-4">
                                <div className="h-4 w-20 rounded bg-gray-200"></div>
                              </td>
                              <td className="px-6 py-4">
                                <div className="h-4 w-24 rounded bg-gray-200"></div>
                              </td>
                              <td className="px-6 py-4">
                                <div className="h-6 w-6 rounded bg-gray-200"></div>
                              </td>
                            </tr>
                          ))}
                        </>
                      ) : filteredCustomers.length === 0 ? (
                        <tr>
                          <td className="py-6 text-center" colSpan={8}>
                            No customers to display
                          </td>
                        </tr>
                      ) : (
                        filteredCustomers.map(
                          (customer: any, index: number) => {
                            const healthScore = customer?.health_score
                            const riskScore = customer?.churn_risk_score
                            const oppScore = customer?.expansion_opp_score

                            const healthColorClass = getScoreColorClass(
                              healthScore ?? 0,
                              "health"
                            )
                            const oppColor = getScoreColorClass(
                              oppScore ?? 0,
                              "health"
                            )
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
                                <td className="px-6 py-4">
                                  {customer.phase ?? "N/A"}
                                </td>
                                <td className="px-6 py-4">
                                  {customer.arr ?? "N/A"}
                                </td>
                                <td className="px-6 py-4">
                                  {customer.renewal_date ?? "N/A"}
                                </td>
                                <td className="px-6 py-4">
                                  <MdKeyboardArrowRight
                                    size={25}
                                    className="cursor-pointer"
                                    onClick={() => {
                                      // Track customer detail view
                                      // trackEvent("dashboard_customer_detail", {
                                      //   email: user_data?.email,
                                      //   organization: user_data?.organization,
                                      //   customer_id: customer._id,
                                      //   customer_name: customer.name,
                                      // })
                                      setSelectedCustomer(customer)
                                    }}
                                  />
                                </td>
                              </tr>
                            )
                          }
                        )
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
              <CustomerSlideIn
                customer={selectedCustomer}
                onClose={() => {
                  setSelectedCustomer(null)
                }}
                sendCustomerChat={sendCustomerMessageToBackend}
              />
            </>
          )}
        </div>
      </div>
    </div>
  )
}
