"use client"

import { Scatter } from "react-chartjs-2"
import {
  Chart as ChartJS,
  Title,
  Tooltip,
  Legend,
  PointElement,
  LinearScale,
} from "chart.js"
import moment from "moment"

ChartJS.register(Title, Tooltip, Legend, PointElement, LinearScale)

type Company = {
  company_id: string
  name: string
  renewal_date: string | null
  churn_risk_score: number
}

interface Props {
  companies: any
  isLoading: boolean
}

export default function ChurnScatterChart({ companies, isLoading }: Props) {
  const today = moment()

  const dataPoints =
    companies?.length > 0
      ? companies
          .filter((c: any) => c.renewal_date)
          .map((c: any) => {
            const daysToRenewal = moment(c.renewal_date).diff(today, "days")

            let color = "green"
            if (c.churn_risk_score >= 70) color = "red"
            else if (c.churn_risk_score >= 60) color = "orange"

            return {
              x: daysToRenewal,
              y: c.churn_risk_score,
              backgroundColor: color,
              label: c.name,
            }
          })
      : []

  const data = {
    datasets: [
      {
        label: "Customers",
        data: dataPoints,
        pointRadius: 8,
        pointHoverRadius: 10,
        pointBackgroundColor: dataPoints.map((p: any) => p.backgroundColor), // Fixed TypeScript error
      },
    ],
  }

  const options = {
    responsive: true, // Enable responsive design
    maintainAspectRatio: false, // Allow custom sizing
    plugins: {
      legend: { display: false },
      tooltip: {
        callbacks: {
          label: (ctx: any) =>
            `${ctx.raw.label}: Days ${ctx.raw.x}, Score ${ctx.raw.y}`,
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
      {" "}
      {/* Full width container */}
      <div className="rounded-xl bg-white p-6 shadow">
        <h3 className="mb-4 text-lg font-semibold text-gray-800">
          Customer Churn Score Analysis
        </h3>
        {isLoading ? (
          <div className="flex h-96 w-full items-center justify-center">
            <div className="h-10 w-10 animate-spin rounded-full border-b-2 border-t-2 border-gray-900" />
          </div>
        ) : (
          <div className="h-96 w-full">
            {" "}
            {/* Full width and height container */}
            <Scatter data={data} options={options} />
          </div>
        )}
      </div>
    </div>
  )
}
