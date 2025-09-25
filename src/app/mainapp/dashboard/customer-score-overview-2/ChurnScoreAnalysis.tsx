"use client"

import { useEffect, useRef } from "react"
import { Chart } from "chart.js"

interface ChurnScoreAnalysisProps {
  riskMatrixData: any[]
  isLoading: boolean
}

export default function ChurnScoreAnalysis({
  riskMatrixData,
  isLoading,
}: ChurnScoreAnalysisProps) {
  const scatterRef = useRef<HTMLCanvasElement | null>(null)
  const scatterInstanceRef = useRef<Chart | null>(null)

  console.log("riskMatrixData componenet---", riskMatrixData)

  const getBubbleSize = (arr: number) => {
    // Base size: 6px, max size: 18px
    // Higher ARR values = bigger bubbles
    if (!arr || arr <= 0) return 6
    // Normalize ARR to a reasonable range (assuming max ARR is around 1M)
    const normalizedArr = Math.min(arr / 1000000, 1) // Cap at 1M
    return Math.max(6, Math.min(18, 6 + normalizedArr * 12))
  }

  const getHoverSize = (arr: number) => {
    // Hover size is 1.5x the base size
    return getBubbleSize(arr) * 1.5
  }

  useEffect(() => {
    if (!scatterRef.current || isLoading) return
    const ctx = scatterRef.current.getContext("2d")
    if (!ctx) return

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
            pointRadius: critical.map((p) => getBubbleSize(p.arr || 0)),
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
            pointRadius: high.map((p) => getBubbleSize(p.arr || 0)),
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
            pointRadius: healthy.map((p) => getBubbleSize(p.arr || 0)),
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
  }, [riskMatrixData, isLoading, getBubbleSize, getHoverSize])

  return <p>comming soon</p>
  return (
    <div className="rounded-xl bg-white p-6 shadow">
      <h3 className="mb-4 text-lg font-semibold text-gray-800">
        Customer Churn Score Analysis
      </h3>
      <div className="h-96">
        <canvas ref={scatterRef}></canvas>
      </div>
    </div>
  )
}
