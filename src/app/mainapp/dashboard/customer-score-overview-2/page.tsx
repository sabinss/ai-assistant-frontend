"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { ChevronLeft } from "lucide-react"
import { useChurnDashboardStore } from "@/store/churn_dashboard"
import useAuth from "@/store/user"
import ChurnRiskChart from "./ChurnRiskDistribution/ChurnRiskChart"
import ChurnRiskChartSkeleton from "./ChurnRiskDistribution/ChurnRiskSkeleton"
import ImmediateActions from "./ImmediateActions"
import ChurnRiskTrend from "./ChurnRiskTrend"
import ChurnRiskTrendChart from "./ChurnRiskTrend"
import ChurnScoreAnalysis from "./ChurnScoreAnalysis"
import { formatCurrency } from "@/utility"

export default function CustomerScoreOverview2() {
  const router = useRouter()
  const { access_token } = useAuth()
  const [customerScoreData, setCustomerScoreData] = useState<any>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  function MetricChange({ current, previous }: any) {
    if (previous === 0) {
      return <p className="text-gray-500">No previous data</p>
    }

    const change = current - previous
    const percentage = (change / previous) * 100

    let direction = "neutral"
    let arrow = ""
    let colorClass = "text-gray-500"

    if (percentage > 0) {
      direction = "up"
      arrow = "↑"
      colorClass = "text-green-600"
    } else if (percentage < 0) {
      direction = "down"
      arrow = "↓"
      colorClass = "text-red-600"
    }

    return (
      <p className={`${colorClass} text-sm font-medium`}>
        {arrow} {Math.abs(percentage).toFixed(1)}% vs last month
      </p>
    )
  }

  const fetchCustomerScoreData = useChurnDashboardStore(
    (s) => s.fetchCustomerScoreData
  )
  const fetchChurnRiskDistribution = useChurnDashboardStore(
    (s) => s.fetchChurnRiskDistribution
  )
  const churnRiskDistribution = useChurnDashboardStore(
    (s) => s.churnRiskDistribution?.data
  )

  const churnRiskDistributionLoading = useChurnDashboardStore(
    (s) => s.churnRiskDistributionLoading
  )

  const immediateActionsData = useChurnDashboardStore(
    (s) => s.immediateActionsData?.data
  )
  const immediateActionsDataLoading = useChurnDashboardStore(
    (s) => s.immediateActionsDataLoading
  )

  const fetchImmediateActionsData = useChurnDashboardStore(
    (s) => s.fetchImmediateActionsData
  )

  const fetchTrendData = useChurnDashboardStore((s) => s.fetchTrendData)
  const trendData = useChurnDashboardStore((s) => s.trendDataNew?.data)
  const trendDataLoading = useChurnDashboardStore((s) => s.trendDataLoading)

  const fetchScoreAnalysisData = useChurnDashboardStore(
    (s) => s.fetchScoreAnalysisData
  )
  const scoreAnalysisData = useChurnDashboardStore(
    (s) => s.scoreAnalysisData?.data
  )
  const scoreAnalysisCustomers = useChurnDashboardStore(
    (s) => s.scoreAnalysisData?.customers
  )
  const scoreAnalysisDataLoading = useChurnDashboardStore(
    (s) => s.scoreAnalysisDataLoading
  )

  useEffect(() => {
    const fetchData = async () => {
      if (!access_token) return

      setLoading(true)
      setError(null)

      try {
        await fetchCustomerScoreData(access_token)
        // Get the data from store after fetching
        const data = useChurnDashboardStore.getState().customerScoreData
        setCustomerScoreData(data)
      } catch (err: any) {
        setError(err?.message || "Failed to fetch customer score data")
        console.error("Error fetching customer score data:", err)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [access_token, fetchCustomerScoreData])

  useEffect(() => {
    try {
      if (access_token) {
        console.log("Fetching Churn risk distribution...")
        fetchChurnRiskDistribution(access_token)
      }
    } catch (err) {
      console.log("Error loading churn risk distribution data", err)
    }
  }, [access_token, fetchChurnRiskDistribution])

  useEffect(() => {
    if (access_token) {
      fetchImmediateActionsData(access_token)
    }
  }, [access_token, fetchImmediateActionsData])

  useEffect(() => {
    if (access_token) {
      fetchTrendData(access_token)
    }
  }, [access_token, fetchTrendData])

  useEffect(() => {
    if (access_token) {
      fetchScoreAnalysisData(access_token)
    }
  }, [access_token, fetchScoreAnalysisData])

  return (
    <div className="relative space-y-6 p-6">
      {/* Back Button */}
      <div className="relative mb-10">
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

      {/* {loading && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-white/70 backdrop-blur-sm">
          <div className="flex flex-col items-center gap-3">
            <div className="h-10 w-10 animate-spin rounded-full border-4 border-blue-500 border-t-transparent"></div>
            <p className="text-sm text-gray-700">
              Fetching customer score data…
            </p>
          </div>
        </div>
      )} */}

      {error && (
        <div className="rounded-md border border-red-200 bg-red-50 p-3 text-sm text-red-700">
          {error}
        </div>
      )}

      {/* Display Customer Score Data */}
      {/* {customerScoreData && (
        <div className="rounded-xl bg-white p-6 shadow">
          <h2 className="mb-4 text-lg font-semibold text-gray-800">
            Customer Score Data
          </h2>
          <div className="space-y-4">
            <pre className="max-h-96 overflow-auto rounded bg-gray-100 p-4 text-xs">
              {JSON.stringify(customerScoreData, null, 2)}
            </pre>
          </div>
        </div>
      )} */}

      {/* Show message if no data */}
      {!loading && !error && !customerScoreData && (
        <div className="rounded-xl bg-white p-6 shadow">
          <div className="text-center text-gray-500">
            <p>No customer score data available</p>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
        <div className="flex flex-col items-center rounded-xl bg-white p-6 shadow">
          <h3 className="text-sm text-gray-600">High Risk Customers</h3>
          <p className="text-3xl font-bold">
            {customerScoreData?.customer_count}
          </p>

          <MetricChange
            current={customerScoreData?.customer_count}
            previous={customerScoreData?.prev_month_churned_customer_count}
          />
        </div>
        <div className="flex flex-col items-center rounded-xl bg-white p-6 shadow">
          <h3 className="text-sm text-gray-600">Revenue At Risk</h3>
          <p className="text-3xl font-bold">
            {formatCurrency(customerScoreData?.churned_customer_arr)}
          </p>
          <MetricChange
            current={customerScoreData?.churned_customer_arr}
            previous={customerScoreData?.prev_month_churned_customer_arr}
          />
        </div>
        <div className="flex flex-col items-center rounded-xl bg-white p-6 shadow">
          <h3 className="text-sm text-gray-600">Avg Churn Score</h3>
          <p className="text-3xl font-bold">
            {customerScoreData?.avg_churn_risk_score}
          </p>
          <MetricChange
            current={customerScoreData?.avg_churn_risk_score}
            previous={customerScoreData?.avg_prev_month_churn_risk_score}
          />
        </div>
      </div>

      {/* Churn risk distribution data */}
      <div>
        {churnRiskDistributionLoading ? (
          <ChurnRiskChartSkeleton />
        ) : churnRiskDistribution && churnRiskDistribution.length > 0 ? (
          <ChurnRiskChart churnRiskDistribution={churnRiskDistribution} />
        ) : (
          <div className="rounded-xl bg-white p-6 text-center text-gray-500 shadow">
            <p>No churn risk distribution data available</p>
          </div>
        )}
      </div>

      {/* Churn Risk Trend */}
      <ChurnRiskTrendChart isLoading={trendDataLoading} trendData={trendData} />

      <ChurnScoreAnalysis
        isLoading={scoreAnalysisDataLoading}
        companies={scoreAnalysisCustomers}
      />

      {/* Immediate Actions */}
      {!immediateActionsDataLoading &&
        immediateActionsData &&
        immediateActionsData.length > 0 && (
          <ImmediateActions highRiskCustomers={immediateActionsData} />
        )}
    </div>
  )
}
