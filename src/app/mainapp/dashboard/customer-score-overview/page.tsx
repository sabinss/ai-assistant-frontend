"use client"

import { useEffect, useMemo, useRef, useState } from "react"
import { useRouter } from "next/navigation"
import { ChevronLeft, ChevronRight } from "lucide-react"
import {
  Chart,
  ArcElement,
  Tooltip,
  Legend,
  DoughnutController,
  LineController,
  LineElement,
  PointElement,
  LinearScale,
  Title,
  CategoryScale,
  Filler,
  ScatterController,
} from "chart.js"
import { useChurnDashboardStore } from "@/store/churn_dashboard"
import { renderSectionTitle } from "@/lib/sectionTitle"
import CustomerSlideIn from "../CustomerSlideIn"
import useOrgCustomer from "@/store/organization_customer"
import useAuth from "@/store/user"

Chart.register(
  DoughnutController,
  LineController,
  ScatterController,
  ArcElement,
  Tooltip,
  Legend,
  LineElement,
  PointElement,
  LinearScale,
  Title,
  CategoryScale,
  Filler
)

export default function Page() {
  const router = useRouter()
  const donutRef: any = useRef(null)
  const donutInstanceRef = useRef<Chart | null>(null)

  const lineRef: any = useRef(null)
  const lineInstanceRef = useRef<Chart | null>(null)

  const scatterRef: any = useRef(null)
  const scatterInstanceRef = useRef<Chart | null>(null)

  // Add state for selected customer and customer slide-in
  const [selectedCustomer, setSelectedCustomer] = useState<any>(null)
  const { user_data, access_token } = useAuth()
  const {
    setCustomerConversationMessage,
    setCustomerMessageStatus,
    appendCustomerConversationMessage,
    clearCustomerConversationMessages,
  } = useOrgCustomer()

  const metrics = useChurnDashboardStore((s) => s.metricsData) || []
  const distribution = useChurnDashboardStore((s) => s.distributionData) || []
  const trendData = useChurnDashboardStore((s) => s.trendData) || []
  const riskMatrixData = useChurnDashboardStore((s) => s.riskMatrixData) || []
  const highRiskCustomers =
    useChurnDashboardStore((s) => s.highRiskCustomers) || []
  console.log("highRiskCustomers----", highRiskCustomers)
  const isLoading = useChurnDashboardStore((s) => s.isLoading) || false
  const error = useChurnDashboardStore((s) => s.error) || null
  const apiData = useChurnDashboardStore((s) => s.apiData) || null
  const fetchHighRiskChurnStats = useChurnDashboardStore(
    (s) => s.fetchHighRiskChurnStats
  )
  const churnLoading = useChurnDashboardStore((s) => s.isLoading)

  // Helper function to get current time
  const getClockTime = () => {
    return new Date().toLocaleTimeString("en-US", {
      hour: "numeric",
      minute: "numeric",
      hour12: true,
    })
  }

  // Function to send customer message to backend (same as Dashboard)
  const sendCustomerMessageToBackend = async (message: string) => {
    setCustomerMessageStatus(true)
    const messageId = `stream_${Date.now()}`
    const newSession = Math.floor(Math.random() * 1000).toString()
    const messagePayload = {
      sender: "user",
      message: message,
      question: message + `for customer ${selectedCustomer.customer_name}`,
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

  const immediateActionItems = useMemo(() => {
    if (!riskMatrixData || riskMatrixData.length === 0) {
      return []
    }

    const priorityRank: Record<string, number> = {
      CRITICAL: 0,
      HIGH: 1,
      HEALTHY: 2,
    }
    return [...riskMatrixData]
      .filter((p) => p.priority === "CRITICAL" || p.priority === "HIGH")
      .sort((a, b) => {
        const pr = priorityRank[a.priority] - priorityRank[b.priority]
        if (pr !== 0) return pr
        return b.churnRisk - a.churnRisk
      })
      .slice(0, 8)
  }, [riskMatrixData])

  const formatCurrency = (value: number | undefined) => {
    if (value === undefined || value === null || isNaN(value)) {
      return "$0"
    }
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      maximumFractionDigits: 0,
    }).format(value)
  }

  // Calculate bubble size based on ARR value
  const getBubbleSize = (arr: number) => {
    // Base size: 6px, max size: 18px
    // Higher ARR values = bigger bubbles
    if (!arr || arr <= 0) return 6
    // Normalize ARR to a reasonable range (assuming max ARR is around 1M)
    const normalizedArr = Math.min(arr / 1000000, 1) // Cap at 1M
    return Math.max(6, Math.min(18, 6 + normalizedArr * 12))
  }

  // Calculate hover size based on ARR value
  const getHoverSize = (arr: number) => {
    // Hover size is 1.5x the base size
    return getBubbleSize(arr) * 1.5
  }

  // Transform monthly trend data to Chart.js format
  const transformedTrendData = useMemo(() => {
    if (!trendData || !Array.isArray(trendData) || trendData.length === 0) {
      return {
        labels: [],
        datasets: [],
      }
    }

    // Use the trendData directly from API - it already has the correct structure
    const labels = trendData.map((item) => item.monthName)
    const avgChurnScores = trendData.map((item) => item.avgChurnScore || 0)
    const highRiskCustomers = trendData.map(
      (item) => item.highRiskCustomers || 0
    )
    const highRiskARR = trendData.map((item) => item.highRiskARR || 0)

    return {
      labels,
      datasets: [
        {
          label: "Average Churn Score",
          data: avgChurnScores,
          borderColor: "#EF4444",
          backgroundColor: "rgba(239, 68, 68, 0.1)",
          tension: 0.4,
          yAxisID: "y",
        },
        {
          label: "High Risk Customers (>60)",
          data: highRiskCustomers,
          borderColor: "#F59E0B",
          backgroundColor: "rgba(245, 158, 11, 0.1)",
          tension: 0.4,
          yAxisID: "y",
        },
        {
          label: "High Risk ARR",
          data: highRiskARR,
          borderColor: "#10B981",
          backgroundColor: "rgba(16, 185, 129, 0.1)",
          tension: 0.4,
          yAxisID: "y1",
        },
      ],
    }
  }, [trendData])

  // Donut Chart
  useEffect(() => {
    if (!donutRef.current || isLoading) return
    const ctx = donutRef.current.getContext("2d")

    if (donutInstanceRef.current) {
      donutInstanceRef.current.destroy()
    }

    donutInstanceRef.current = new Chart(ctx, {
      type: "doughnut",
      data: {
        labels: [
          "Very Low (1-20)",
          "Low (21-40)",
          "Medium (41-60)",
          "High (61-80)",
          "Critical (81-100)",
        ],
        datasets: [
          {
            label: "Customers",
            data: distribution,
            backgroundColor: [
              "#10B981",
              "#84CC16",
              "#F59E0B",
              "#F97316",
              "#EF4444",
            ],
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            position: "bottom",
            align: "start",
            labels: {
              boxWidth: 12,
              padding: 12,
              font: { size: 12 },
            },
          },
        },
      },
    })

    return () => {
      if (donutInstanceRef.current) {
        donutInstanceRef.current.destroy()
        donutInstanceRef.current = null
      }
    }
  }, [distribution, isLoading])

  // Line Chart
  useEffect(() => {
    if (!lineRef.current || isLoading) {
      return
    }
    const ctx = lineRef.current.getContext("2d")

    if (lineInstanceRef.current) {
      lineInstanceRef.current.destroy()
    }

    // Calculate max values for y-axis scaling
    const churnScoreData =
      transformedTrendData.datasets.find(
        (d) => d.label === "Average Churn Score"
      )?.data || []
    const customerCountData =
      transformedTrendData.datasets.find(
        (d) => d.label === "High Risk Customers"
      )?.data || []
    const arrData =
      transformedTrendData.datasets.find((d) => d.label === "High Risk ARR")
        ?.data || []

    const maxChurnScore = Math.max(...churnScoreData)
    const maxCustomerCount = Math.max(...customerCountData)
    const maxARR = Math.max(...arrData)

    try {
      lineInstanceRef.current = new Chart(ctx, {
        type: "line",
        data: {
          labels: transformedTrendData.labels,
          datasets: transformedTrendData.datasets.map((dataset) => ({
            label: dataset.label,
            data: dataset.data,
            borderColor: dataset.borderColor,
            backgroundColor: dataset.backgroundColor,
            borderWidth: 2,
            fill: false, // Remove fill for cleaner look with multiple lines
            tension: dataset.tension,
            pointBackgroundColor: dataset.borderColor,
            pointBorderColor: "#ffffff",
            pointBorderWidth: 2,
            pointRadius: 4,
            pointHoverRadius: 6,
            yAxisID: dataset.label === "High Risk ARR" ? "y1" : "y",
          })),
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          interaction: {
            mode: "index",
            intersect: false,
          },
          plugins: {
            legend: {
              position: "top",
              align: "end",
              labels: {
                usePointStyle: true,
                boxWidth: 8,
                padding: 16,
                font: { size: 12 },
              },
            },
            tooltip: {
              enabled: true,
              mode: "index",
              intersect: false,
              backgroundColor: "rgba(17, 24, 39, 0.95)",
              titleColor: "#ffffff",
              bodyColor: "#ffffff",
              borderColor: "rgba(17, 24, 39, 0.1)",
              borderWidth: 1,
              cornerRadius: 8,
              displayColors: true,
              caretPadding: 6,
              callbacks: {
                label: function (context) {
                  const label = context.dataset.label || ""
                  const value = context.parsed.y
                  if (label === "High Risk ARR") {
                    return `${label}: $${value.toLocaleString()}`
                  }
                  return `${label}: ${value}`
                },
              },
            },
          },
          scales: {
            y: {
              type: "linear",
              display: true,
              position: "left",
              beginAtZero: true,
              suggestedMax: Math.ceil(maxChurnScore * 1.1),
              border: { display: false },
              grid: {
                color: "rgba(17, 24, 39, 0.08)",
              },
              ticks: {
                color: "#6B7280",
                padding: 8,
                font: { size: 12 },
              },
              title: {
                display: true,
                text: "Churn Score / Customer Count",
                color: "#6B7280",
                font: { size: 12 },
              },
            },
            y1: {
              type: "linear",
              display: true,
              position: "right",
              beginAtZero: true,
              suggestedMax: Math.ceil(maxARR * 1.1),
              border: { display: false },
              grid: {
                drawOnChartArea: false,
              },
              ticks: {
                color: "#F59E0B",
                padding: 8,
                font: { size: 12 },
                callback: function (value) {
                  if (typeof value === "number") {
                    return "$" + value / 1000 + "K"
                  }
                  return "$0K"
                },
              },
              title: {
                display: true,
                text: "ARR ($)",
                color: "#F59E0B",
                font: { size: 12 },
              },
            },
            x: {
              border: { display: false },
              grid: {
                color: "rgba(17, 24, 39, 0.06)",
              },
              ticks: {
                color: "#6B7280",
                padding: 8,
                font: { size: 12 },
              },
            },
          },
        },
      })
    } catch (e) {
      console.error("Error creating line chart:", e)
    }

    return () => {
      if (lineInstanceRef.current) {
        lineInstanceRef.current.destroy()
        lineInstanceRef.current = null
      }
    }
  }, [transformedTrendData, isLoading])

  // Scatter Chart (Risk Matrix)
  useEffect(() => {
    if (!scatterRef.current || isLoading) return
    const ctx = scatterRef.current.getContext("2d") as CanvasRenderingContext2D

    if (scatterInstanceRef.current) {
      scatterInstanceRef.current.destroy()
    }

    // Group customers by priority
    const critical = riskMatrixData.filter((p) => p.priority === "CRITICAL")
    const high = riskMatrixData.filter((p) => p.priority === "HIGH")
    const healthy = riskMatrixData.filter((p) => p.priority === "HEALTHY")

    scatterInstanceRef.current = new Chart(ctx, {
      type: "scatter",
      data: {
        datasets: [
          {
            label: "Critical",
            data: critical.map((p) => ({
              x: p.daysToRenewal,
              y: p.churnRisk,
              meta: p,
            })),
            pointBackgroundColor: "#EF4444",
            pointBorderColor: "#EF4444",
            pointRadius: critical.map((p) => getBubbleSize(p.arr || 0)), // Dynamic size based on ARR
            pointHoverRadius: critical.map((p) => getHoverSize(p.arr || 0)),
            pointBorderWidth: 2,
          },
          {
            label: "High",
            data: high.map((p) => ({
              x: p.daysToRenewal,
              y: p.churnRisk,
              meta: p,
            })),
            pointBackgroundColor: "#F59E0B",
            pointBorderColor: "#F59E0B",
            pointRadius: high.map((p) => getBubbleSize(p.arr || 0)), // Dynamic size based on ARR
            pointHoverRadius: high.map((p) => getHoverSize(p.arr || 0)),
            pointBorderWidth: 2,
          },
          {
            label: "Healthy",
            data: healthy.map((p) => ({
              x: p.daysToRenewal,
              y: p.churnRisk,
              meta: p,
            })),
            pointBackgroundColor: "#10B981",
            pointBorderColor: "#10B981",
            pointRadius: healthy.map((p) => getBubbleSize(p.arr || 0)), // Dynamic size based on ARR
            pointHoverRadius: healthy.map((p) => getHoverSize(p.arr || 0)),
            pointBorderWidth: 2,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            position: "top",
            align: "end",
            labels: {
              usePointStyle: true,
              boxWidth: 8,
              padding: 16,
              font: { size: 12 },
            },
          },
          tooltip: {
            enabled: true,
            external: undefined,
            callbacks: {
              label: (ctx) => {
                const p: any = ctx.raw
                const m = p.meta
                return `${m.company} | Risk: ${m.churnRisk} | Renewal: ${m.daysToRenewal} days`
              },
              afterLabel: (ctx) => {
                const m: any = (ctx.raw as any).meta
                return `ARR: $${m.arr?.toLocaleString() || "0"}\nPriority: ${m.priority}`
              },
              title: () => "",
            },
          },
        },
        scales: {
          x: {
            title: { display: true, text: "Days to Renewal" },
            border: { display: false },
            grid: { color: "rgba(17, 24, 39, 0.06)" },
            ticks: { color: "#6B7280", font: { size: 12 } },
          },
          y: {
            title: { display: true, text: "Churn Risk Score" },
            border: { display: false },
            suggestedMin: 0,
            suggestedMax: 100,
            grid: { color: "rgba(17, 24, 39, 0.08)" },
            ticks: { color: "#6B7280", font: { size: 12 } },
          },
        },
      },
    })

    return () => {
      if (scatterInstanceRef.current) {
        scatterInstanceRef.current.destroy()
        scatterInstanceRef.current = null
      }
    }
  }, [riskMatrixData, isLoading])
  console.log("Main dhasboard", highRiskCustomers)
  return (
    <div className="relative space-y-6 p-6">
      {/* Back Button */}
      <div className="relative mb-10">
        {/* Back Button */}
        <button
          onClick={() => router.push("/mainapp/dashboard")}
          className="absolute left-6 top-1/2 z-10 flex -translate-y-1/2 items-center gap-2 rounded-lg border border-gray-200 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-md transition-all hover:bg-gray-100 hover:shadow-lg"
        >
          <ChevronLeft className="h-4 w-4" />
          Back to Dashboard
        </button>

        {/* Title Centered */}
        <div className="flex justify-center">
          <h1 className="text-2xl font-bold tracking-tight text-gray-800">
            Churn Risk Dashboard
          </h1>
        </div>
      </div>
      {isLoading && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-white/70 backdrop-blur-sm">
          <div className="flex flex-col items-center gap-3">
            <div className="h-10 w-10 animate-spin rounded-full border-4 border-blue-500 border-t-transparent"></div>
            <p className="text-sm text-gray-700">
              Fetching high-risk churn insights…
            </p>
          </div>
        </div>
      )}
      {error && (
        <div className="rounded-md border border-red-200 bg-red-50 p-3 text-sm text-red-700">
          {error}
        </div>
      )}
      {/* Metrics */}
      {metrics && metrics.length > 0 && (
        <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
          {metrics.map((item, idx) => (
            <div
              key={idx}
              className="flex flex-col items-center rounded-xl bg-white p-6 shadow"
            >
              <h3 className="text-sm text-gray-600">{item.label}</h3>
              <p className="text-3xl font-bold">{item.value}</p>
              <p
                className={`text-sm ${item.change.includes("↑") ? "text-green-500" : item.change.includes("↓") ? "text-red-500" : "text-gray-500"}`}
              >
                {item.change}
              </p>
            </div>
          ))}
        </div>
      )}
      {/* Donut Chart */}
      {distribution && distribution.length > 0 && (
        <div className="rounded-xl bg-white p-6 shadow">
          {renderSectionTitle("Churn Risk Distribution")}
          <div className="flex justify-center">
            <div className="h-68 w-68">
              <canvas ref={donutRef}></canvas>
            </div>
          </div>
        </div>
      )}
      {/* Debug: Show distribution data */}
      {/* <div className="rounded-xl bg-gray-50 p-4 text-sm">
        <h3 className="mb-2 font-semibold">Distribution Data Debug:</h3>
        <p>distribution length: {distribution?.length || 0}</p>
        <p>distribution data: {JSON.stringify(distribution)}</p>
      </div> */}
      {/* Line Chart */}
      {transformedTrendData &&
        transformedTrendData.datasets &&
        transformedTrendData.datasets.length > 0 && (
          <div className="rounded-xl bg-white p-6 shadow">
            {renderSectionTitle("Churn Risk Trend")}
            <div className="h-64">
              <canvas ref={lineRef}></canvas>
            </div>
          </div>
        )}
      {/* Debug: Show line chart data */}
      {/* <div className="rounded-xl bg-gray-50 p-4 text-sm">
        <h3 className="mb-2 font-semibold">Line Chart Debug:</h3>
        <p>transformedTrendData exists: {!!transformedTrendData}</p>
        <p>
          transformedTrendData datasets:{" "}
          {transformedTrendData?.datasets?.length || 0}
        </p>
        <p>
          transformedTrendData labels:{" "}
          {transformedTrendData?.labels?.length || 0}
        </p>
      </div> */}
      {/* Scatter Chart */}
      {riskMatrixData && riskMatrixData.length > 0 && (
        <div className="rounded-xl bg-white p-6 shadow">
          {renderSectionTitle("Customer Churn Score Analysis")}
          <div className="h-96">
            <canvas ref={scatterRef}></canvas>
          </div>
        </div>
      )}
      {/* Debug: Show scatter chart data */}
      {/* <div className="rounded-xl bg-gray-50 p-4 text-sm">
        <h3 className="mb-2 font-semibold">Scatter Chart Debug:</h3>
        <p>riskMatrixData length: {riskMatrixData?.length || 0}</p>
        <p>
          riskMatrixData sample:{" "}
          {riskMatrixData.length > 0
            ? JSON.stringify(riskMatrixData[0])
            : "No data"}
        </p>
      </div> */}
      {/* Immediate Action Required */}
      {highRiskCustomers && highRiskCustomers.length > 0 && (
        <div className="rounded-xl bg-white p-6 shadow">
          {renderSectionTitle("Immediate Action Required")}
          <div className="space-y-4">
            {highRiskCustomers.map((item: any, idx) => {
              // Map risk_level to determine if critical or high
              const isCritical = item.risk_level?.toLowerCase() === "critical"
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
                      {item.customer_name}
                    </div>
                    <div className="text-sm text-gray-500">
                      Score: {item.churn_risk_score} | Renewal:{" "}
                      {item.renewal_days} days
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
            })}
          </div>
        </div>
      )}
      {/* Additional Insights */}
      {/* {apiData &&
        apiData.previousMonth &&
        apiData.previousPreviousMonth &&
        apiData.deltas && (
          <div className="rounded-xl bg-white p-6 shadow">
            {renderSectionTitle("Additional Insights")}
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
              <div>
                <h4 className="mb-3 text-lg font-semibold text-gray-800">
                  Month-over-Month Comparison
                </h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span>Previous Month (Jul 2025):</span>
                    <span className="font-medium">
                      {apiData.previousMonth.avgChurnScore.toFixed(1)} avg score
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>Previous-Previous Month (Jun 2025):</span>
                    <span className="font-medium">
                      {apiData.previousPreviousMonth.avgChurnScore.toFixed(1)}{" "}
                      avg score
                    </span>
                  </div>
                  <div className="flex justify-between border-t pt-2">
                    <span>Change:</span>
                    <span
                      className={`font-medium ${apiData.deltas.avgChurnScorePctChange > 0 ? "text-red-600" : "text-green-600"}`}
                    >
                      {apiData.deltas.avgChurnScorePctChange > 0 ? "↑" : "↓"}{" "}
                      {Math.abs(apiData.deltas.avgChurnScorePctChange).toFixed(
                        1
                      )}
                      %
                    </span>
                  </div>
                </div>
              </div>
              <div>
                <h4 className="mb-3 text-lg font-semibold text-gray-800">
                  Risk Distribution Details
                </h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span>Very Low Risk:</span>
                    <span className="font-medium">
                      {apiData.previousMonth.churnRiskDistribution.veryLow}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>Low Risk:</span>
                    <span className="font-medium">
                      {apiData.previousMonth.churnRiskDistribution.low}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>Medium Risk:</span>
                    <span className="font-medium">
                      {apiData.previousMonth.churnRiskDistribution.medium}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>High Risk:</span>
                    <span className="font-medium">
                      {apiData.previousMonth.churnRiskDistribution.high}
                    </span>
                  </div>
                  <div className="flex justify-between font-semibold text-red-600">
                    <span>Critical Risk:</span>
                    <span>
                      {apiData.previousMonth.churnRiskDistribution.critical}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )} */}
      {/* Debug: Raw API Data */}
      {/* {apiData && (
        <div className="rounded-xl bg-gray-50 p-6 shadow">
          {renderSectionTitle("Debug: Raw API Data")}
          <details className="mt-4">
            <summary className="cursor-pointer text-sm font-medium text-gray-700 hover:text-gray-900">
              Click to expand raw API response
            </summary>
            <pre className="mt-2 max-h-96 overflow-auto rounded bg-gray-100 p-4 text-xs">
              {JSON.stringify(apiData, null, 2)}
            </pre>
          </details>
        </div>
      )} */}
      {/* Customer Slide-In Component */}
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
