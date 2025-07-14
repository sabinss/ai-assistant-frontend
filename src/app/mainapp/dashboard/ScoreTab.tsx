import { useState } from "react"
import { ArrowUpRight, ArrowDownRight, Minus } from "lucide-react"

const tabs = [
  { title: "Health Score", value: 82 },
  { title: "Churn Risk", value: 75 },
  { title: "Expansion Opp Score", value: 68 },
]

const keyDrivers = [
  {
    name: "Service Quality",
    impact: 35,
    score: 88,
    trend: "up",
  },
  {
    name: "Room Cleanliness",
    impact: 25,
    score: 85,
    trend: "stable",
  },
  {
    name: "Check-in Speed",
    impact: 20,
    score: 72,
    trend: "down",
  },
  {
    name: "Staff Friendliness",
    impact: 20,
    score: 90,
    trend: "up",
  },
]

export default function ScoreTab() {
  const [activeTab, setActiveTab] = useState("Health Score")

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case "up":
        return <ArrowUpRight className="h-4 w-4 text-green-500" />
      case "down":
        return <ArrowDownRight className="h-4 w-4 text-red-500" />
      default:
        return <Minus className="h-4 w-4 text-gray-400" />
    }
  }

  return (
    <div className="min-h-screen bg-white p-6">
      {/* Tabs */}
      <div className="flex items-center space-x-6 border-b">
        {tabs.map((tab) => (
          <button
            key={tab.title}
            onClick={() => setActiveTab(tab.title)}
            className={`flex items-center gap-2 px-1 pb-2 text-sm font-medium ${
              activeTab === tab.title
                ? "border-b-2 border-blue-600 text-blue-600"
                : "text-gray-500"
            }`}
          >
            <span>{tab.title}</span>
            <div
              className={`rounded bg-gray-100 px-2 py-1 text-xs font-semibold ${
                activeTab === tab.title ? "text-blue-600" : "text-gray-500"
              }`}
            >
              {tab.value}
            </div>
          </button>
        ))}
      </div>

      {/* Key Drivers */}
      <div className="mt-6 rounded-xl border bg-white p-4 shadow-sm">
        <h2 className="mb-4 text-lg font-semibold">Key Drivers</h2>

        <div className="divide-y">
          {keyDrivers.map((driver) => (
            <div
              key={driver.name}
              className="mb-4 flex items-center justify-between rounded-lg bg-gray-50 px-4 py-4"
            >
              <div className="flex items-center gap-2">
                {getTrendIcon(driver.trend)}
                <div>
                  <div className="font-semibold">{driver.name}</div>
                  <div className="text-xs text-gray-400">
                    {driver.impact}% impact
                  </div>
                </div>
              </div>

              <div className="flex flex-col items-end">
                <div className="text-lg font-bold">{driver.score}</div>
                <div className="text-xs capitalize text-gray-400">
                  {driver.trend}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
