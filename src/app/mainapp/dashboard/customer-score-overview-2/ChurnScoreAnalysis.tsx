"use client"

import { Bubble } from "react-chartjs-2"
import {
  Chart as ChartJS,
  Title,
  Tooltip,
  Legend,
  PointElement,
  LinearScale,
  BubbleController,
} from "chart.js"
import moment from "moment"
import { useMemo } from "react"

ChartJS.register(Title, Tooltip, Legend, PointElement, LinearScale, BubbleController)

type Company = {
  company_id: string
  name: string
  renewal_date: string | null
  churn_risk_score: number
  arr?: number // Annual Recurring Revenue
}

interface Props {
  companies: Company[]
  isLoading: boolean
}

// Helper function to calculate bubble radius based on ARR
const calculateBubbleRadius = (arr: number, minArr: number, maxArr: number): number => {
  const MIN_RADIUS = 5
  const MAX_RADIUS = 25

  // If all ARR values are the same, return a medium size
  if (maxArr === minArr) return (MIN_RADIUS + MAX_RADIUS) / 2

  // Normalize ARR to a value between 0 and 1, then scale to radius range
  const normalized = (arr - minArr) / (maxArr - minArr)
  return MIN_RADIUS + normalized * (MAX_RADIUS - MIN_RADIUS)
}

// Helper function to format currency for tooltip
const formatCurrency = (value: number): string => {
  if (value >= 1000000) return `$${(value / 1000000).toFixed(1)}M`
  if (value >= 1000) return `$${(value / 1000).toFixed(0)}K`
  return `$${value.toFixed(0)}`
}

export default function ChurnScatterChart({ companies, isLoading }: Props) {
  const today = moment()

  // Calculate min and max ARR for scaling bubble sizes
  const { minArr, maxArr } = useMemo(() => {
    if (!companies?.length) return { minArr: 0, maxArr: 0 }
    const arrValues = companies
      .filter((c) => c.renewal_date && c.arr != null)
      .map((c) => c.arr || 0)
    return {
      minArr: Math.min(...arrValues),
      maxArr: Math.max(...arrValues),
    }
  }, [companies])

  const dataPoints = useMemo(() => {
    if (!companies?.length) return []

    return companies
      .filter((c) => c.renewal_date)
      .map((c) => {
        const daysToRenewal = moment(c.renewal_date).diff(today, "days")
        const arr = c.arr || 0

        let color = "rgba(34, 197, 94, 0.7)" // green with transparency
        if (c.churn_risk_score >= 70)
          color = "rgba(239, 68, 68, 0.7)" // red
        else if (c.churn_risk_score >= 60) color = "rgba(249, 115, 22, 0.7)" // orange

        return {
          x: daysToRenewal,
          y: c.churn_risk_score,
          r: calculateBubbleRadius(arr, minArr, maxArr), // Dynamic bubble radius based on ARR
          backgroundColor: color,
          borderColor: color.replace("0.7", "1"), // Solid border
          label: c.name,
          arr: arr,
        }
      })
  }, [companies, minArr, maxArr, today])

  const data = {
    datasets: [
      {
        label: "Customers",
        data: dataPoints,
        backgroundColor: dataPoints.map((p) => p.backgroundColor),
        borderColor: dataPoints.map((p) => p.borderColor),
        borderWidth: 1,
        hoverRadius: 2, // Extra radius on hover
      },
    ],
  }

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      tooltip: {
        callbacks: {
          label: (ctx: any) => {
            const point = ctx.raw
            return [
              `${point.label}`,
              `Days to Renewal: ${point.x}`,
              `Churn Score: ${point.y}`,
              `ARR: ${formatCurrency(point.arr)}`,
            ]
          },
        },
      },
    },
    scales: {
      x: {
        title: { display: true, text: "Days to Renewal" },
      },
      y: {
        title: { display: true, text: "Churn Risk Score" },
        min: 0,
        max: 100,
      },
    },
  }

  return (
    <div className="w-full">
      <div className="rounded-xl bg-white p-6 shadow">
        <h3 className="mb-4 text-lg font-semibold text-gray-800">Customer Churn Score Analysis</h3>
        <p className="mb-4 text-sm text-gray-500">
          Bubble size represents ARR (Annual Recurring Revenue)
        </p>
        {isLoading ? (
          <div className="flex h-96 w-full items-center justify-center">
            <div className="h-10 w-10 animate-spin rounded-full border-b-2 border-t-2 border-gray-900" />
          </div>
        ) : (
          <div className="h-96 w-full">
            <Bubble data={data} options={options} />
          </div>
        )}
      </div>
    </div>
  )
}
