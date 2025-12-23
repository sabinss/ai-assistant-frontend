import { create } from "zustand"
import http from "@/config/http"
import { formatCurrency, getBubbleSize, getHoverSize } from "@/utility"

export interface ChurnMetricItem {
  label: string
  value: string
  change: string
}

export type RiskPriority = "CRITICAL" | "HIGH" | "HEALTHY"

export interface RiskMatrixPoint {
  company: string
  churnRisk: number
  daysToRenewal: number
  revenue: number
  segment: string
  csm: string
  priority: RiskPriority
  arr: number
}

// New interfaces for the API response
export interface HighRiskCustomer {
  customer_id: string
  customer_name: string
  churn_risk_score: number
  renewal_days: string
  monetary_value: string
  risk_level: string
  arr?: string
}

export interface ChurnRiskDistribution {
  veryLow: number
  low: number
  medium: number
  high: number
  critical: number
}

export interface MonthData {
  year: number
  month: number
  totalCustomers: number
  highRiskCount: number
  highRiskPercent: number
  avgChurnScore: number
  totalHighRiskScore: number
  churnScores: number[]
  churnRiskDistribution: ChurnRiskDistribution
  highRiskARR: number // Annual Recurring Revenue at risk
  revenueAtRisk: number // Revenue at risk
}

export interface ChurnDashboardAPIResponse {
  threshold: number
  previousMonth: MonthData
  previousPreviousMonth: MonthData
  deltas: {
    highRiskCountPctChange: number | null
    highRiskPercentPctChange: number | null
    avgChurnScorePctChange: number
    revenueAtRiskPctChange: number | null
  }
  insights: {
    riskDistribution: ChurnRiskDistribution
    totalRecordsProcessed: {
      previous: number
      previousPrevious: number
    }
  }
  highRiskCustomers: HighRiskCustomer[]
}

interface ChurnDashboardState {
  metricsData: ChurnMetricItem[]
  distributionData: number[]
  trendData: Array<{
    month: number
    monthName: string
    totalCustomers: number
    highRiskCustomers: number
    avgChurnScore: number
    highRiskARR: number
  }>
  highRiskCustomers: HighRiskCustomer[]
  riskMatrixData: RiskMatrixPoint[]
  isLoading: boolean
  error: string | null
  apiData: ChurnDashboardAPIResponse | null
  setMetricsData: (metrics: ChurnMetricItem[]) => void
  setDistributionData: (distribution: number[]) => void
  setTrendData: (
    trend: Array<{
      month: number
      monthName: string
      totalCustomers: number
      highRiskCustomers: number
      avgChurnScore: number
      highRiskARR: number
    }>
  ) => void
  setRiskMatrixData: (points: RiskMatrixPoint[]) => void
  setApiData: (data: ChurnDashboardAPIResponse) => void
  fetchHighRiskChurnStats: (accessToken: string) => Promise<void>
  fetchCustomerScoreData: (accessToken: string) => Promise<void>
  fetchChurnRiskDistribution: (accessToken: string) => Promise<void>
  fetchImmediateActionsData: (accessToken: string, page: number, limit: number) => Promise<void>
  fetchTrendData: (accessToken: string) => Promise<void>
  fetchScoreAnalysisData: (accessToken: string) => Promise<void>
  fetchUsageFunnelData: (
    accessToken: string,
    page?: number,
    limit?: number,
    search?: string,
    stage?: string
  ) => Promise<void>
  fetchCustomerAlertData: (accessToken: string) => Promise<void>
  customerScoreData: ChurnDataI | null
  churnRiskDistribution: ChurnDataI | null
  churnRiskDistributionLoading: boolean
  immediateActionsDataLoading: boolean
  immediateActionsData: ChurnDataI | null
  trendDataLoading: boolean
  trendDataNew: ChurnDataI | null
  scoreAnalysisDataLoading: boolean
  scoreAnalysisData: ChurnDataI | null
  usageFunnelData: ChurnDataI | null
  usageFunnelDataLoading: boolean
  usageFunnelTableColumns: string[]
  customerAlertData: ChurnDataI | null
  customerAlertDataLoading: boolean
  customerStageList: string[]
  customerStageListLoading: boolean
  fetchCustomerStageList: (accessToken: string) => Promise<void>
  stageDropdownList: string[]
  stageDropdownListLoading: boolean
  fetchStageDropdownList: (accessToken: string) => Promise<void>
  // populateWithDemoData: () => void
}

interface ChurnDataI {
  [key: string]: any
  timestamp?: any
}

// Add cache expiration check (e.g., 5 minutes)
const isCacheValid = (timestamp: number) => {
  const CACHE_DURATION = 5 * 60 * 1000 // 5 minutes
  return Date.now() - timestamp < CACHE_DURATION
}

export const useChurnDashboardStore = create<ChurnDashboardState>((set) => ({
  customerScoreData: null,
  churnRiskDistribution: null,
  scoreAnalysisData: null,
  customerAlertData: null,
  customerAlertDataLoading: false,
  customerStageList: [],
  customerStageListLoading: false,
  stageDropdownList: [],
  stageDropdownListLoading: false,
  scoreAnalysisDataLoading: false,
  immediateActionsDataLoading: false,
  usageFunnelData: null,
  usageFunnelTableColumns: [],
  usageFunnelDataLoading: false,
  immediateActionsData: null,
  metricsData: [],
  trendData: [],
  trendDataNew: null,
  trendDataLoading: false,
  distributionData: [],
  riskMatrixData: [],
  highRiskCustomers: [],
  isLoading: false,
  churnRiskDistributionLoading: false,
  error: null,
  apiData: null,
  setMetricsData: (metrics) => set({ metricsData: metrics }),
  setDistributionData: (distribution) => set({ distributionData: distribution }),
  setTrendData: (trend) => set({ trendData: trend }),
  setRiskMatrixData: (points) => set({ riskMatrixData: points }),
  setApiData: (data) => set({ apiData: data }),
  fetchHighRiskChurnStats: async (accessToken: string) => {
    set({ isLoading: true, error: null })
    try {
      console.log("fetching high risk churn stats.....")
      const res = await http.get(`/customer/high-risk-churn-stats`, {
        headers: { Authorization: `Bearer ${accessToken}` },
      })
      const data = res?.data?.data || {}

      // Store the raw API data
      set({ apiData: data })

      if (data.previousMonth && data.previousPreviousMonth) {
        // Update metrics with real data
        const metrics = [
          {
            label: "High Risk Customers",
            value: data.previousMonth.highRiskCount.toString(),
            change: data.deltas?.highRiskCountPctChange
              ? `${data.deltas.highRiskCountPctChange > 0 ? "↑" : "↓"} ${Math.abs(data.deltas.highRiskCountPctChange).toFixed(1)}% vs last month`
              : "No change vs last month",
          },
          {
            label: "Revenue at Risk",
            // value: `$${data.previousMonth.revenueAtRisk} asdf`,
            value: formatCurrency(data.previousMonth.revenueAtRisk),
            change: data.deltas?.revenueAtRiskPctChange
              ? `${data.deltas.revenueAtRiskPctChange > 0 ? "↑" : "↓"} ${Math.abs(data.deltas.revenueAtRiskPctChange).toFixed(1)}% vs last month`
              : "No change vs last month",
          },
          {
            label: "Avg Churn Score",
            value: data.previousMonth.avgChurnScore.toFixed(1),
            change: data.deltas?.avgChurnScorePctChange
              ? `${data.deltas.avgChurnScorePctChange > 0 ? "↑" : "↓"} ${Math.abs(data.deltas.avgChurnScorePctChange).toFixed(1)}% vs last month`
              : "No change vs last month",
          },
        ]

        set({ metricsData: metrics })

        // Update distribution data - check multiple possible locations
        if (Array.isArray(data.distributionData)) {
          set({ distributionData: data.distributionData })
        } else if (data.riskDistribution) {
          // Transform riskDistribution to distributionData format
          const distribution = [
            data.riskDistribution.veryLow || 0,
            data.riskDistribution.low || 0,
            data.riskDistribution.medium || 0,
            data.riskDistribution.high || 0,
            data.riskDistribution.critical || 0,
          ]
          set({ distributionData: distribution })
        } else if (data.previousMonth?.churnRiskDistribution) {
          // Use the churnRiskDistribution from previousMonth if available
          const distribution = [
            data.previousMonth.churnRiskDistribution.veryLow || 0,
            data.previousMonth.churnRiskDistribution.low || 0,
            data.previousMonth.churnRiskDistribution.medium || 0,
            data.previousMonth.churnRiskDistribution.high || 0,
            data.previousMonth.churnRiskDistribution.critical || 0,
          ]
          set({ distributionData: distribution })
        } else if (data.insights?.riskDistribution) {
          // Use the riskDistribution from insights if available
          const distribution = [
            data.insights.riskDistribution.veryLow || 0,
            data.insights.riskDistribution.low || 0,
            data.insights.riskDistribution.medium || 0,
            data.insights.riskDistribution.high || 0,
            data.insights.riskDistribution.critical || 0,
          ]
          set({ distributionData: distribution })
        }

        // Transform high risk customers to risk matrix format
        set({ highRiskCustomers: data.highRiskCustomers })
        const riskMatrix = data.highRiskCustomers.map((customer: HighRiskCustomer) => ({
          company: customer.customer_name,
          arr: customer.arr ? parseFloat(customer.arr) || 0 : 0,
          churnRisk: customer.churn_risk_score,
          daysToRenewal: customer.renewal_days === "N/A" ? 0 : parseInt(customer.renewal_days),
          revenue: customer.monetary_value === "N/A" ? 0 : parseFloat(customer.monetary_value),
          segment: "Unknown", // Not provided in API
          csm: "Unknown", // Not provided in API
          priority:
            customer.risk_level === "Critical"
              ? "CRITICAL"
              : customer.risk_level === "High"
                ? "HIGH"
                : "HEALTHY",
        }))
        set({ riskMatrixData: riskMatrix })
      } else {
        // Check if we have totalCustomers data
        if (data.totalCustomers !== undefined) {
          const metrics = [
            {
              label: "Total Customers",
              value: data.totalCustomers.toString(),
              change: "From API",
            },
            {
              label: "Critical Customers",
              value: data.riskDistribution?.critical?.toString() || "0",
              change: "From API",
            },
            {
              label: "Healthy Customers",
              value: data.riskDistribution?.healthy?.toString() || "0",
              change: "From API",
            },
          ]
          set({ metricsData: metrics })
          // Also set distribution data for pie chart
          if (data.riskDistribution) {
            const distribution = [
              data.riskDistribution.veryLow || 0,
              data.riskDistribution.low || 0,
              data.riskDistribution.medium || 0,
              data.riskDistribution.high || 0,
              data.riskDistribution.critical || 0,
            ]
            set({ distributionData: distribution })
          }
        }
      }

      // Fallback to existing data structure if API doesn't match expected format
      if (Array.isArray(data.metricsData)) {
        set({ metricsData: data.metricsData })
      }

      // Final fallback for distribution data if still not set
      if (
        !Array.isArray(data.distributionData) &&
        !data.riskDistribution &&
        !data.previousMonth?.churnRiskDistribution &&
        !data.insights?.riskDistribution
      ) {
        console.log("No distribution data found, setting default empty array")
        set({ distributionData: [0, 0, 0, 0, 0] })
      }
      if (data.trendData && Array.isArray(data.trendData)) {
        set({ trendData: data.trendData })
      } else {
        console.log("No trendData found, checking if we can create it from customers data")
        // If no trend data, we might need to create it from the customers data
        if (data.riskMatrix?.customers && Array.isArray(data.riskMatrix.customers)) {
          console.log("Creating trend data from customers data")
          // For now, set empty trend data since we don't have monthly progression
          set({ trendData: [] })
        }
      }
      if (Array.isArray(data.riskMatrixData)) {
        set({ riskMatrixData: data.riskMatrixData })
      }

      // Handle the new customers data structure for risk matrix
      if (data.riskMatrix.customers && Array.isArray(data.riskMatrix.customers)) {
        let customers = data.riskMatrix.customers

        // Transform customers data to risk matrix format
        const riskMatrix = data.highRiskCustomers.map((customer: any) => ({
          company: customer.customer_name,
          arr: customer.arr ? parseFloat(customer.arr) || 0 : 0,
          churnRisk: customer.churn_risk_score,
          daysToRenewal: customer.renewal_days || 0,
          revenue: customer.arr || 0,
          segment: "Unknown", // Not provided in API
          csm: "Unknown", // Not provided in API
          priority: (customer.risk_level === "Critical"
            ? "CRITICAL"
            : customer.risk_level === "High"
              ? "HIGH"
              : "HEALTHY") as RiskPriority,
          riskColor: customer.risk_color || "#000000",
        }))

        set({ riskMatrixData: riskMatrix })
      }
    } catch (err: any) {
      console.log("error", err)
      set({ error: err?.message || "Failed to fetch high risk churn stats" })
    } finally {
      console.log("setting isLoading to false")
      set({ isLoading: false })
    }
  },
  fetchCustomerScoreData: async (accessToken: string) => {
    const state: any = useChurnDashboardStore.getState()
    if (state.customerScoreData && isCacheValid(state.customerScoreData?.timestamp)) {
      return state.customerScoreData
    } else {
      set({ isLoading: true, error: null })
      try {
        const res = await http.get(`/customer/score-dashboard`, {
          headers: { Authorization: `Bearer ${accessToken}` },
        })
        set({
          customerScoreData: {
            ...res.data.data,
            timestamp: Date.now(),
          },
        })
      } catch (err: any) {
        set({ isLoading: false, error: err })
      }
    }
  },
  fetchChurnRiskDistribution: async (accessToken: string) => {
    const state: any = useChurnDashboardStore.getState()
    if (state.churnRiskDistribution && isCacheValid(state.churnRiskDistribution?.timestamp)) {
      return state.churnRiskDistribution
    } else {
      set({ churnRiskDistributionLoading: true, error: null })
      try {
        const res = await http.get(`/customer/churn-risk-distribution`, {
          headers: { Authorization: `Bearer ${accessToken}` },
        })
        set({
          churnRiskDistribution: {
            data: [...res.data.data],
            timestamp: Date.now(),
          },
        })
        set({ churnRiskDistributionLoading: false })
      } catch (err: any) {
        set({ churnRiskDistributionLoading: false, error: err })
      }
    }
  },
  fetchImmediateActionsData: async (accessToken: string, page: number = 1, limit: number = 5) => {
    set({ immediateActionsDataLoading: true, error: null })
    try {
      console.log(`Fetching immediate actions data - Page: ${page}, Limit: ${limit}`)
      const res = await http.get(`/customer/immediate-actions`, {
        headers: { Authorization: `Bearer ${accessToken}` },
        params: {
          page: page,
          limit: limit,
        },
      })
      console.log("API Response:", res.data)
      set({
        immediateActionsData: {
          data: [...res.data.data],
          pagination: res.data.pagination,
          timestamp: Date.now(),
        },
      })
      set({ immediateActionsDataLoading: false })
    } catch (err: any) {
      console.error("Error fetching immediate actions data:", err)
      set({ immediateActionsDataLoading: false, error: err })
    }
  },
  fetchTrendData: async (accessToken: string) => {
    const state: any = useChurnDashboardStore.getState()
    if (state.trendData && isCacheValid(state.trendData?.timestamp)) {
      console.log("Using cached immediateActionsData")
      return state.trendData
    } else {
      set({ trendDataLoading: true, error: null })
      try {
        const res = await http.get(`/customer/churn-risk-trend`, {
          headers: { Authorization: `Bearer ${accessToken}` },
        })
        set({
          trendDataNew: {
            data: res.data.data,
            timestamp: Date.now(),
          },
        })
        set({ trendDataLoading: false })
      } catch (err: any) {
        set({ trendDataLoading: false, error: err })
      }
    }
  },
  fetchScoreAnalysisData: async (accessToken: string) => {
    const state: any = useChurnDashboardStore.getState()
    if (state.scoreAnalysisData && isCacheValid(state.scoreAnalysisData?.timestamp)) {
      return state.scoreAnalysisData
    } else {
      set({ scoreAnalysisDataLoading: true, error: null })
      try {
        const res = await http.get(`/customer/customer-score-analysis`, {
          headers: { Authorization: `Bearer ${accessToken}` },
        })
        console.log("Score analysis data response-->", res.data.data?.customers)
        const customers = res.data.data?.customers

        set({
          scoreAnalysisData: {
            data: res.data.data,
            customers: res.data.data?.customers,
            timestamp: Date.now(),
          },
        })
        set({ scoreAnalysisDataLoading: false })
      } catch (err: any) {
        set({ scoreAnalysisDataLoading: false, error: err })
      }
    }
  },
  fetchUsageFunnelData: async (
    accessToken: string,
    page: number = 1,
    limit: number = 10,
    search: string = "",
    stage: string = "all"
  ) => {
    const state: any = useChurnDashboardStore.getState()
    // Check if we have cached data with the same parameters
    const hasValidCache =
      state.usageFunnelData?.data &&
      state.usageFunnelData?.page === page &&
      state.usageFunnelData?.limit === limit &&
      state.usageFunnelData?.search === search &&
      state.usageFunnelData?.stage === stage &&
      isCacheValid(state.usageFunnelData?.timestamp)

    if (hasValidCache) {
      return state.usageFunnelData?.data
    }
    set({ usageFunnelDataLoading: true, error: null })
    try {
      const params: any = {
        page: page,
        limit: limit,
      }

      if (search) {
        params.search = search
      }

      if (stage && stage !== "all") {
        params.stage = stage
      }

      const res = await http.get(`/customer/usage-funnel`, {
        headers: { Authorization: `Bearer ${accessToken}` },
        params: params,
      })
      set({
        usageFunnelData: {
          data: res.data.data,
          pagination: res.data.pagination,
          page: page,
          limit: limit,
          search: search,
          stage: stage,
          timestamp: Date.now(),
        },
      })
      set({ usageFunnelTableColumns: res.data?.columns })
      set({ usageFunnelDataLoading: false })
    } catch (err: any) {
      set({ usageFunnelDataLoading: false, error: err })
    }
  },
  fetchCustomerAlertData: async (accessToken: string) => {
    const state: any = useChurnDashboardStore.getState()
    if (state.customerAlertData && isCacheValid(state.customerAlertData?.timestamp)) {
      return state.customerAlertData
    } else {
      set({ customerAlertDataLoading: true, error: null })
      try {
        const res = await http.get(`/customer/alerts`, {
          headers: { Authorization: `Bearer ${accessToken}` },
        })
        set({
          customerAlertData: {
            data: res.data.data,
            timestamp: Date.now(),
          },
        })
        set({ customerAlertDataLoading: false })
      } catch (err: any) {
        set({ customerAlertDataLoading: false, error: err })
      }
    }
  },
  fetchCustomerStageList: async (accessToken: string) => {
    const state: any = useChurnDashboardStore.getState()
    if (state.customerStageList && state.customerStageList.length > 0) {
      return state.customerStageList
    } else {
      set({ customerStageListLoading: true, error: null })
      try {
        const res = await http.get(`/customer/stage-list`, {
          headers: { Authorization: `Bearer ${accessToken}` },
        })
        console.log("Stage list API response:", res.data)

        // Extract stage values from the response data
        const stages = res.data.data || []
        console.log("Raw stages data:", stages)

        const stageList = Array.isArray(stages)
          ? stages.map((item: any) => {
              if (typeof item === "string") {
                return item
              } else if (typeof item === "object" && item !== null) {
                return item.stage || item.name || item.value || item.label || JSON.stringify(item)
              }
              return String(item)
            })
          : []

        console.log("Processed stage list:", stageList)

        set({ customerStageList: stageList })
        set({ customerStageListLoading: false })
      } catch (err: any) {
        set({ customerStageListLoading: false, error: err })
      }
    }
  },
  fetchStageDropdownList: async (accessToken: string) => {
    const state: any = useChurnDashboardStore.getState()
    if (state.stageDropdownList && state.stageDropdownList.length > 0) {
      return state.stageDropdownList
    } else {
      set({ stageDropdownListLoading: true, error: null })
      try {
        const res = await http.get(`/customer/stage-list/dropdown`, {
          headers: { Authorization: `Bearer ${accessToken}` },
        })
        console.log("Stage dropdown list API response:", res.data)

        // Extract stage values from the response data
        const stages = res.data.data || []
        console.log("Raw dropdown stages data:", stages)

        const stageList = Array.isArray(stages)
          ? stages.map((item: any) => {
              if (typeof item === "string") {
                return item
              } else if (typeof item === "object" && item !== null) {
                return item.stage || item.name || item.value || item.label || JSON.stringify(item)
              }
              return String(item)
            })
          : []

        console.log("Processed dropdown stage list:", stageList)

        set({
          stageDropdownList: stageList,
        })
        set({ stageDropdownListLoading: false })
      } catch (err: any) {
        set({ stageDropdownListLoading: false, error: err })
      }
    }
  },
}))
