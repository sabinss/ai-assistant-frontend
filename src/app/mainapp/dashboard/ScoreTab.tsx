import { useState } from "react"
import { ArrowUpRight, ArrowDownRight, Minus } from "lucide-react"
import { ChevronDown, ChevronUp, Zap, TrendingUp } from "lucide-react"

export default function ScoreTab({
  tabsData,
  analysisData,
  recommendedActions,
}: {
  tabsData: any[]
  analysisData: any[]
  recommendedActions: any[]
}) {
  const [tabs, setTabs] = useState(tabsData)
  const [analysis, setAnalysis] = useState<any>(analysisData)
  const [activeTab, setActiveTab] = useState("Health Score")
  const currentTab = tabs.find((tab) => tab.title === activeTab)
  const [openTab, setOpenTab] = useState<string | null>(null)

  const toggleTab = (title: string) => {
    setOpenTab((prev) => (prev === title ? null : title))
  }

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
    <div className="mb-10 min-h-screen bg-white p-6">
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
          {currentTab?.keyDrivers.map((driver) => (
            <div
              key={driver.name}
              className="mb-4 flex items-center justify-between rounded-lg bg-gray-50 px-4 py-4"
            >
              <div className="flex items-center gap-2">
                {/* {getTrendIcon(driver.trend)} */}
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

      {/* Analysis */}
      {/* Analysis */}
      <div className="mt-6 rounded-xl border bg-white p-4 shadow-sm">
        {analysis.map((item) => (
          <div
            key={item.title}
            className="mb-4 rounded-md border border-gray-200 shadow-sm"
          >
            <button
              onClick={() => toggleTab(item.title)}
              className="flex w-full items-center justify-between px-4 py-3 text-left font-medium text-gray-800 hover:bg-gray-50"
            >
              <span>{item.title}</span>
              {openTab === item.title ? (
                <ChevronUp className="h-5 w-5 text-gray-500" />
              ) : (
                <ChevronDown className="h-5 w-5 text-gray-500" />
              )}
            </button>

            {openTab === item.title && (
              <div className="space-y-6 border-t p-4">
                {item.growthIndicators?.length > 0 && (
                  <div>
                    <div className="mb-2 flex items-center gap-2 text-sm font-semibold text-green-600">
                      {/* <TrendingUp className="h-4 w-4" />
                      Growth Indicators */}
                    </div>
                    <ul className="ml-5 list-disc text-sm text-gray-700">
                      {item.growthIndicators.map((g, idx) => (
                        <li key={idx}>{g}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            )}
          </div>
        ))}
        <div className="rounded-md bg-blue-50 p-4">
          <div className="mb-2 flex items-center gap-2 text-sm font-semibold text-blue-600">
            <Zap className="h-4 w-4" />
            Recommended Actions
          </div>
          <ul className="ml-5 list-disc text-sm text-blue-800">
            {recommendedActions?.map((r, idx) => <li key={idx}>{r}</li>)}
          </ul>
        </div>
      </div>
    </div>
  )
}
