"use client"

import { useEffect, useMemo, useRef } from "react"
import {
  Chart,
  LineController,
  LineElement,
  PointElement,
  LinearScale,
  Title,
  CategoryScale,
  Filler,
  Legend,
  Tooltip,
} from "chart.js"

Chart.register(
  LineController,
  LineElement,
  PointElement,
  LinearScale,
  Title,
  CategoryScale,
  Filler,
  Legend,
  Tooltip
)

type TrendItem = {
  monthName: string
  avgChurnScore?: number
  highRiskCustomers?: number
  highRiskARR?: number
}

type ChurnRiskTrendChartProps = {
  trendData: any
  isLoading?: boolean
}

export default function ChurnRiskTrendChart({
  trendData,
  isLoading = false,
}: ChurnRiskTrendChartProps) {
  const lineRef = useRef<HTMLCanvasElement>(null)
  const lineInstanceRef = useRef<Chart | null>(null)
  console.log("Trend data----findal", trendData)
  // Transform monthly trend data
  const transformedTrendData = useMemo(() => {
    if (!trendData) {
      return { labels: [], datasets: [] }
    }

    const labels = trendData?.trendData.map((item: any) => item.monthName)
    const avgChurnScores = trendData?.trendData.map(
      (item: any) => item.avgChurnScore || 0
    )
    const highRiskCustomers = trendData?.trendData.map(
      (item: any) => item.highRiskCustomers || 0
    )
    const highRiskARR = trendData?.trendData.map(
      (item: any) => item.highRiskARR || 0
    )

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
  console.log("transformedTrendData", transformedTrendData)
  // Draw Line Chart
  useEffect(() => {
    if (!lineRef.current || isLoading) return
    const ctx = lineRef.current.getContext("2d")
    if (!ctx) return

    if (lineInstanceRef.current) {
      lineInstanceRef.current.destroy()
    }

    const churnScoreData =
      transformedTrendData.datasets.find(
        (d) => d.label === "Average Churn Score"
      )?.data || []
    const customerCountData =
      transformedTrendData.datasets.find(
        (d) => d.label === "High Risk Customers (>60)"
      )?.data || []
    const arrData =
      transformedTrendData.datasets.find((d) => d.label === "High Risk ARR")
        ?.data || []

    const maxChurnScore = Math.max(...churnScoreData, 0)
    const maxCustomerCount = Math.max(...customerCountData, 0)
    const maxARR = Math.max(...arrData, 0)

    lineInstanceRef.current = new Chart(ctx, {
      type: "line",
      data: {
        labels: transformedTrendData.labels,
        datasets: transformedTrendData.datasets.map((dataset) => ({
          ...dataset,
          borderWidth: 2,
          fill: false,
          pointBackgroundColor: dataset.borderColor,
          pointBorderColor: "#ffffff",
          pointBorderWidth: 2,
          pointRadius: 4,
          pointHoverRadius: 6,
        })),
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
            mode: "index",
            intersect: false,
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
            beginAtZero: true,
            suggestedMax: Math.ceil(
              Math.max(maxChurnScore, maxCustomerCount) * 1.1
            ),
            grid: { color: "rgba(17, 24, 39, 0.08)" },
            ticks: { color: "#6B7280", padding: 8, font: { size: 12 } },
          },
          y1: {
            beginAtZero: true,
            suggestedMax: Math.ceil(maxARR * 1.1),
            position: "right",
            grid: { drawOnChartArea: false },
            ticks: {
              color: "#10B981",
              callback: (value) =>
                typeof value === "number" ? `$${value / 1000}K` : value,
            },
          },
          x: {
            grid: { color: "rgba(17, 24, 39, 0.06)" },
            ticks: { color: "#6B7280", padding: 8, font: { size: 12 } },
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
  }, [transformedTrendData, isLoading])

  return (
    <div className="rounded-xl bg-white p-6 shadow">
      <h2 className="mb-4 text-lg font-semibold">Churn Risk Trend</h2>
      <div className="h-64">
        {isLoading ? (
          <div className="flex h-64 w-full items-center justify-center">
            <div className="h-10 w-10 animate-spin rounded-full border-b-2 border-t-2 border-gray-900" />
          </div>
        ) : (
          <canvas ref={lineRef}></canvas>
        )}
      </div>
    </div>
  )
}
