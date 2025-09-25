"use client"

import { useEffect, useRef } from "react"
import {
  Chart,
  ArcElement,
  Tooltip,
  Legend,
  DoughnutController,
  Title,
} from "chart.js"

Chart.register(ArcElement, Tooltip, Legend, DoughnutController, Title)

const COLORS = [
  "#2ecc71", // Very Low
  "#27ae60", // Low
  "#f1c40f", // Medium
  "#e67e22", // High
  "#e74c3c", // Critical
  "#95a5a6", // Other
]

type ChurnRiskChartProps = {
  churnRiskDistribution: {
    churn_risk_bucket: string
    total_arr: number
  }[]
}

export default function ChurnRiskChart({
  churnRiskDistribution,
}: ChurnRiskChartProps) {
  console.log("-----churnRiskDistribution---", churnRiskDistribution)
  const chartRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    if (!chartRef.current || !churnRiskDistribution?.length) return

    const ctx = chartRef.current.getContext("2d")
    if (!ctx) return

    // destroy old chart instance if it exists
    if (Chart.getChart(ctx)) {
      Chart.getChart(ctx)?.destroy()
    }

    new Chart(ctx, {
      type: "doughnut",
      data: {
        labels: churnRiskDistribution.map((d) => d.churn_risk_bucket),
        datasets: [
          {
            label: "ARR by Risk Bucket",
            data: churnRiskDistribution.map((d) => d.total_arr),
            backgroundColor: COLORS,
            borderWidth: 2,
            cutout: "70%",
            radius: "80%",
          },
        ],
      },
      options: {
        responsive: true,
        plugins: {
          legend: {
            position: "bottom" as const,
          },
          title: {
            display: true,
            text: "Churn Risk Distribution",
          },
        },
      },
    })
  }, [churnRiskDistribution])

  return (
    <div className="flex justify-center rounded-xl bg-white p-6 shadow">
      <canvas
        ref={chartRef}
        width={200}
        height={700}
        className="!h-[400px] !w-[500px]"
      ></canvas>
    </div>
  )
}
