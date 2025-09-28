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
import { Button } from "@/components/ui/button"
import { useDebounce } from "@/hooks/useDebounce"

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
  const [scoreDashboardData, setScoreDashboardData] = useState<any>([])
  const { botName } = useNavBarStore()
  const router = useRouter()
  const fetchHighRiskChurnStats = useChurnDashboardStore(
    (s) => s.fetchHighRiskChurnStats
  )

  const fetchUsageFunnelData = useChurnDashboardStore(
    (s) => s.fetchUsageFunnelData
  )

  const usageFunnelDataLoading = useChurnDashboardStore(
    (s) => s.usageFunnelDataLoading
  )
  const usageFunnelData = useChurnDashboardStore((s) => s.usageFunnelData?.data)
  const usageFunnelPagination = useChurnDashboardStore(
    (s) => s.usageFunnelData?.pagination
  )
  console.log("usageFunnelData---", usageFunnelData)
  console.log("usageFunnelDataLoading", usageFunnelDataLoading)
  console.log("usageFunnelPagination---", usageFunnelPagination)

  // pagination
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const limit = 10 // records per page
  const [pagination, setPagination] = useState<any>({
    currentPage: 1,
    totalPages: 1,
    totalRecords: 0,
    hasNextPage: false,
    hasPrevPage: false,
  })

  // Usage funnel pagination
  const [usageFunnelPage, setUsageFunnelPage] = useState(1)

  // Stage filter for usage funnel
  const [selectedStage, setSelectedStage] = useState("all")

  const churnLoading = useChurnDashboardStore((s) => s.isLoading)

  const debouncedSearchTerm = useDebounce(searchTerm, 500)

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

  // Get unique stages for filter dropdown - fix TypeScript Set iteration
  const uniqueStages = useMemo(() => {
    if (!usageFunnelData) return []
    const stages = Array.from(
      new Set(usageFunnelData.map((item: any) => item.stage))
    )
    return stages.filter(Boolean) as string[]
  }, [usageFunnelData])

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
        if (res?.data?.data?.length > 0) {
          setAlertData(res?.data?.data)
        }
      } catch (err) {
        console.log("Fetch alert data error", err)
      }
    }
    fetchCustomerAlertData()
  }, [user_data?.organization])

  // Fetch usage funnel data with API pagination
  useEffect(() => {
    if (activeTab === "usage_funnel" && access_token) {
      console.log("Fetching usage funnel data with params:", {
        page: usageFunnelPage,
        limit,
        search: debouncedSearchTerm,
        stage: selectedStage,
      })
      fetchUsageFunnelData(
        access_token,
        usageFunnelPage,
        limit,
        debouncedSearchTerm,
        selectedStage
      )
    }
  }, [
    user_data?.organization,
    activeTab,
    usageFunnelPage,
    debouncedSearchTerm,
    selectedStage,
  ])

  useEffect(() => {
    async function getOrgCustomers() {
      if (!user_data?.organization || !access_token) return

      try {
        setLoading(true)

        // Now only fetch from redshift as it contains all customer data
        const redshiftRes = await http.get(
          `/customer/redshift?page=${page}&limit=${limit}&search=${debouncedSearchTerm}`,
          {
            headers: { Authorization: `Bearer ${access_token}` },
          }
        )

        const redshiftCustomerDetails = redshiftRes?.data?.data || []
        const scoreDashboardData = redshiftRes?.data?.scoreDashboardData || []
        setScoreDashboardData(scoreDashboardData)

        const {
          totalPages,
          totalRecords,
          hasNextPage,
          hasPrevPage,
          nextPage,
          prevPage,
        } = redshiftRes?.data?.pagination

        setPagination({
          totalPages,
          totalRecords,
          hasNextPage,
          hasPrevPage,
          nextPage,
          prevPage,
        })

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

        setOrgCustomerData(orgCustomerData)
      } catch (err) {
        console.error("Error fetching customers:", err)
      } finally {
        setLoading(false)
      }
    }

    getOrgCustomers()
  }, [user_data?.organization, access_token, page, debouncedSearchTerm])

  useEffect(() => {
    if (!orgCustomerData?.customers?.length) return

    const customers = orgCustomerData.customers
    const totalCustomers = scoreDashboardData?.customer_count

    let expansionCount = 0
    let atRiskCustomersARR = 0
    let atRiskCustomersWithARR = 0

    const healthScoreAverage = scoreDashboardData?.avg_health_score

    const atRiskAverageARR = scoreDashboardData?.churned_customer_arr
    setStats([
      {
        id: "total",
        title: "Total Customers",
        value: scoreDashboardData?.customer_count.toString(),
        subtitle: "Active accounts",
      },
      {
        id: "healthAvg",
        title: "Health Score Average",
        value: scoreDashboardData?.avg_health_score,
        subtitle: "",
        // 5 points vs last month
      },
      {
        id: "atRisk",
        title: "At-Risk Customers",
        // value: atRiskCustomers.toString(),
        value: scoreDashboardData?.churned_customer_count,
        subtitle: `${((scoreDashboardData?.churned_customer_count / totalCustomers) * 100).toFixed(1)}% of ${totalCustomers} customers`,
        arrValue: `${scoreDashboardData?.churned_customer_arr}`,
      },
      {
        id: "expansion",
        title: "Expansion Opportunities",
        value: scoreDashboardData?.expansion_account_count.toString(),
        subtitle: `${((scoreDashboardData?.expansion_account_count / totalCustomers) * 100).toFixed(1)}% of ${totalCustomers} customers`,
      },
    ])
  }, [orgCustomerData, scoreDashboardData])

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
                  const customerScoreData =
                    useChurnDashboardStore.getState().customerScoreData
                  if (!customerScoreData) {
                    await useChurnDashboardStore
                      .getState()
                      .fetchCustomerScoreData(access_token || "")
                  }
                  // await useChurnDashboardStore
                  //   .getState()
                  //   .fetchHighRiskChurnStats(access_token || "")
                  router.push("/mainapp/dashboard/customer-score-overview-2")
                } catch (e) {
                  router.push("/mainapp/dashboard/customer-score-overview-2")
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
                    {stat.value}
                    {/* {stat.id === "atRisk" && churnLoading
                      ? "Loading..."
                      : stat.value} */}
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
          <button
            onClick={() => setActiveTab("usage_funnel")}
            className={`rounded-t-lg px-4 py-2 font-medium transition ${
              activeTab === "usage_funnel"
                ? "border-b-2 border-blue-500 bg-blue-100 text-blue-700"
                : "text-gray-500 hover:text-gray-700"
            }`}
          >
            Usage Funnel
          </button>
        </div>

        {/* Tab Content */}
        <div className="mt-4">
          {activeTab === "alert" && (
            <div className="rounded-xl border bg-white p-4 shadow-sm">
              <input
                type="text"
                placeholder="Search..."
                className="mb-4 w-full rounded border px-3 py-2 md:w-1/3"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              <div className="overflow-x-auto">
                <table className="min-w-full text-left text-sm">
                  <thead className="border-b text-gray-600">
                    <tr>
                      <th className="p-2">Company Name</th>
                      <th className="w-1/2 p-2">Alert</th>
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
              <div className="mb-20 mt-4 flex items-center justify-between">
                <Button
                  className="disabled bg-[#174894] hover:bg-[#173094]"
                  disabled={!pagination.hasNextPage}
                  onClick={() => setPage((prev) => Math.max(prev - 1, 1))}
                >
                  Previous
                </Button>
                <span className="text-sm font-bold text-gray-500">
                  Page {page} of {totalPages}
                </span>

                {/* <button
                  disabled={!pagination.hasNextPage}
                  onClick={() => setPage((prev) => prev + 1)}
                  className="disabled bg-[#174894] hover:bg-[#173094]"
                >
                  Next
                </button> */}
                <Button
                  className="disabled bg-[#174894] hover:bg-[#173094]"
                  disabled={!pagination.hasNextPage}
                  onClick={() => setPage((prev) => prev + 1)}
                >
                  Next
                </Button>
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

          {activeTab === "usage_funnel" && (
            <div className="rounded-xl border bg-white p-4 shadow-sm">
              <div className="mb-4 text-lg font-semibold">Usage Funnel</div>

              {/* Filters */}
              <div className="mb-4 flex flex-col gap-4 sm:flex-row sm:items-center">
                <input
                  type="text"
                  placeholder="Search .."
                  className="w-full rounded border px-3 py-2 sm:w-1/3"
                  value={searchTerm}
                  onChange={(e) => {
                    setSearchTerm(e.target.value)
                    setUsageFunnelPage(1) // Reset to first page when search changes
                  }}
                />

                <select
                  value={selectedStage}
                  onChange={(e) => {
                    setSelectedStage(e.target.value)
                    setUsageFunnelPage(1) // Reset to first page when filter changes
                  }}
                  className="w-full rounded border px-3 py-2 sm:w-1/4"
                >
                  <option value="all">All Stages</option>
                  {uniqueStages.map((stage: string) => (
                    <option key={stage} value={stage}>
                      {stage}
                    </option>
                  ))}
                </select>
              </div>

              <div className="overflow-x-auto">
                <table className="min-w-full text-left text-sm">
                  <thead className="border-b text-gray-600">
                    <tr>
                      <th className="p-2">Company Name</th>
                      <th className="p-2">Company ID</th>
                      <th className="p-2">Bid Closed</th>
                      <th className="p-2">Bid Scheduled</th>
                      <th className="p-2">Bid Sent</th>
                      <th className="p-2">Login</th>
                      <th className="p-2">Month/Week</th>
                    </tr>
                  </thead>
                  <tbody className="text-gray-700">
                    {usageFunnelDataLoading ? (
                      <>
                        {[...Array(5)].map((_, index) => (
                          <tr key={index} className="animate-pulse border-b">
                            <td className="px-6 py-4">
                              <div className="h-4 w-32 rounded bg-gray-200"></div>
                            </td>
                            <td className="px-6 py-4">
                              <div className="h-4 w-24 rounded bg-gray-200"></div>
                            </td>
                            <td className="px-6 py-4">
                              <div className="h-4 w-16 rounded bg-gray-200"></div>
                            </td>
                            <td className="px-6 py-4">
                              <div className="h-4 w-16 rounded bg-gray-200"></div>
                            </td>
                            <td className="px-6 py-4">
                              <div className="h-4 w-16 rounded bg-gray-200"></div>
                            </td>
                            <td className="px-6 py-4">
                              <div className="h-4 w-16 rounded bg-gray-200"></div>
                            </td>
                            <td className="px-6 py-4">
                              <div className="h-4 w-20 rounded bg-gray-200"></div>
                            </td>
                          </tr>
                        ))}
                      </>
                    ) : !usageFunnelData || usageFunnelData.length === 0 ? (
                      <tr>
                        <td className="py-6 text-center" colSpan={7}>
                          No usage funnel data to display
                        </td>
                      </tr>
                    ) : (
                      usageFunnelData.map((item: any, index: number) => (
                        <tr
                          key={item?.company_id || index}
                          className="border-b odd:bg-white even:bg-gray-100 hover:bg-gray-50"
                        >
                          <td className="px-6 py-4">
                            {item?.company_name || "N/A"}
                          </td>
                          <td className="px-6 py-4">
                            {item?.company_id || "N/A"}
                          </td>
                          <td className="px-6 py-4">{item?.bid_closed || 0}</td>
                          <td className="px-6 py-4">
                            {item?.bid_scheduled || 0}
                          </td>
                          <td className="px-6 py-4">{item?.bid_sent || 0}</td>
                          <td className="px-6 py-4">{item?.login || 0}</td>
                          <td className="px-6 py-4">
                            {item?.month_week || "N/A"}
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>

              {/* Usage Funnel Pagination */}
              <div className="mb-20 mt-4 flex items-center justify-between">
                <Button
                  className="disabled bg-[#174894] hover:bg-[#173094]"
                  disabled={!usageFunnelPagination?.hasPrevPage}
                  onClick={() =>
                    setUsageFunnelPage((prev) => Math.max(prev - 1, 1))
                  }
                >
                  Previous
                </Button>
                <span className="text-sm font-bold text-gray-500">
                  Page {usageFunnelPage} of{" "}
                  {usageFunnelPagination?.totalPages || 1}(
                  {usageFunnelPagination?.totalRecords || 0} total records)
                </span>
                <Button
                  className="disabled bg-[#174894] hover:bg-[#173094]"
                  disabled={!usageFunnelPagination?.hasNextPage}
                  onClick={() => setUsageFunnelPage((prev) => prev + 1)}
                >
                  Next
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
