"use client"

import { useEffect, useMemo, useRef } from "react"
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
  const donutRef: any = useRef(null)
  const donutInstanceRef = useRef<Chart | null>(null)

  const lineRef: any = useRef(null)
  const lineInstanceRef = useRef<Chart | null>(null)

  const scatterRef: any = useRef(null)
  const scatterInstanceRef = useRef<Chart | null>(null)

  const metrics = useChurnDashboardStore((s) => s.metricsData) || []
  const distribution = useChurnDashboardStore((s) => s.distributionData) || []
  const trendData = useChurnDashboardStore((s) => s.trendData) || {
    labels: [],
    datasets: [],
  }
  const riskMatrixData = useChurnDashboardStore((s) => s.riskMatrixData) || []
  const isLoading = useChurnDashboardStore((s) => s.isLoading) || false
  const error = useChurnDashboardStore((s) => s.error) || null
  const apiData = useChurnDashboardStore((s) => s.apiData) || null
  const fetchHighRiskChurnStats = useChurnDashboardStore(
    (s) => s.fetchHighRiskChurnStats
  )
  const populateWithDemoData = useChurnDashboardStore(
    (s) => s.populateWithDemoData
  )

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

  // Fetch data on component mount
  useEffect(() => {
    // For demo purposes, populate with sample data
    // In a real app, you'd call fetchHighRiskChurnStats with an access token
    if (populateWithDemoData) {
      populateWithDemoData()
    }
  }, [populateWithDemoData])

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
    if (!lineRef.current || isLoading) return
    const ctx = lineRef.current.getContext("2d")

    if (lineInstanceRef.current) {
      lineInstanceRef.current.destroy()
    }

    // Calculate max values for y-axis scaling
    const churnScoreData =
      trendData.datasets.find((d) => d.label === "Average Churn Score")?.data ||
      []
    const customerCountData =
      trendData.datasets.find((d) => d.label === "High Risk Customers (>70)")
        ?.data || []
    const arrData =
      trendData.datasets.find((d) => d.label === "High Risk ARR")?.data || []

    const maxChurnScore = Math.max(...churnScoreData)
    const maxCustomerCount = Math.max(...customerCountData)
    const maxARR = Math.max(...arrData)

    lineInstanceRef.current = new Chart(ctx, {
      type: "line",
      data: {
        labels: trendData.labels,
        datasets: trendData.datasets.map((dataset) => ({
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

    return () => {
      if (lineInstanceRef.current) {
        lineInstanceRef.current.destroy()
        lineInstanceRef.current = null
      }
    }
  }, [trendData, isLoading])

  // Scatter Chart (Risk Matrix)
  useEffect(() => {
    if (!scatterRef.current || isLoading) return
    const ctx = scatterRef.current.getContext("2d") as CanvasRenderingContext2D

    if (scatterInstanceRef.current) {
      scatterInstanceRef.current.destroy()
    }

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
            pointRadius: 5,
          },
          {
            label: "High",
            data: high.map((p) => ({
              x: p.daysToRenewal,
              y: p.churnRisk,
              meta: p,
            })),
            pointBackgroundColor: "#F97316",
            pointBorderColor: "#F97316",
            pointRadius: 5,
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
            pointRadius: 5,
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
                return ` ${m.company} | Risk ${m.churnRisk} | ${m.daysToRenewal} days`
              },
              afterLabel: (ctx) => {
                const m: any = (ctx.raw as any).meta
                return `Revenue: $${m.revenue.toLocaleString()}\nSegment: ${m.segment}\nCSM: ${m.csm}\nPriority: ${m.priority}`
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
            suggestedMin: 70,
            suggestedMax: 95,
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
  console.log("Main dhasboard", metrics)
  return (
    <div className="relative space-y-6 p-6">
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

      {/* Show loading state if no data is available yet */}
      {/* {!apiData && !isLoading && !error && (
        <div className="rounded-xl bg-gray-50 p-6 text-center">
          <div className="text-lg font-medium text-gray-600">
            Loading churn dashboard data...
          </div>
          <p className="mt-2 text-sm text-gray-500">
            Please wait while we fetch the latest churn risk insights.
          </p>
        </div>
      )} */}

      {/* API Data Summary */}
      {/* {apiData && apiData.previousMonth && (
        <div className="rounded-xl bg-gradient-to-r from-blue-50 to-indigo-50 p-6 shadow">
          {renderSectionTitle("Churn Risk Overview")}
          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">
                {apiData.threshold}
              </div>
              <div className="text-sm text-gray-600">Risk Threshold</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-gray-800">
                {apiData.previousMonth.totalCustomers}
              </div>
              <div className="text-sm text-gray-600">Total Customers</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-red-600">
                {apiData.previousMonth.highRiskCount}
              </div>
              <div className="text-sm text-gray-600">High Risk Customers</div>
            </div>
          </div>
        </div>
      )} */}

      {/* Demo Controls */}
      {/* <div className="rounded-xl bg-gray-50 p-4 shadow">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold text-gray-800">
              Demo Controls
            </h3>
            <p className="text-sm text-gray-600">
              {apiData ? "Data loaded successfully" : "No data loaded yet"}
            </p>
          </div>
          <div className="flex gap-2">
            <button
              onClick={populateWithDemoData}
              className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
            >
              Load Demo Data
            </button>
            <button
              onClick={() => {
                // Clear the data
                useChurnDashboardStore.setState({
                  apiData: null,
                  metricsData: [],
                  distributionData: [],
                  trendData: { labels: [], datasets: [] },
                  riskMatrixData: [],
                })
              }}
              className="rounded-lg bg-gray-600 px-4 py-2 text-sm font-medium text-white hover:bg-gray-700"
            >
              Clear Data
            </button>
          </div>
        </div>
      </div> */}

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

      {/* Line Chart */}
      {trendData && trendData.datasets && trendData.datasets.length > 0 && (
        <div className="rounded-xl bg-white p-6 shadow">
          {renderSectionTitle("Churn Risk Trend")}
          <div className="h-64">
            <canvas ref={lineRef}></canvas>
          </div>
        </div>
      )}

      {/* Scatter Chart */}
      {riskMatrixData && riskMatrixData.length > 0 && (
        <div className="rounded-xl bg-white p-6 shadow">
          {renderSectionTitle("Risk Matrix: Churn Score vs Time to Renewal")}
          <div className="h-96">
            <canvas ref={scatterRef}></canvas>
          </div>
        </div>
      )}

      {/* Immediate Action Required */}
      {immediateActionItems && immediateActionItems.length > 0 && (
        <div className="rounded-xl bg-white p-6 shadow">
          {renderSectionTitle("Immediate Action Required")}
          <div className="space-y-4">
            {immediateActionItems.map((item, idx) => {
              const isCritical = item.priority === "CRITICAL"
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
                      {item.company}
                    </div>
                    <div className="text-sm text-gray-500">
                      Score: {item.churnRisk} | Renewal: {item.daysToRenewal}{" "}
                      days
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="text-right font-semibold text-green-600">
                      {formatCurrency(item.churnRisk)}
                    </div>
                    <span
                      className={`rounded-full px-3 py-1 text-xs ${pillClasses}`}
                    >
                      {isCritical ? "Critical" : "High"}
                    </span>
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
    </div>
  )
}
