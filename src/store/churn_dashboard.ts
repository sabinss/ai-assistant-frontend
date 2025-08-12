import { create } from "zustand"
import http from "@/config/http"

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
  populateWithDemoData: () => void
}

export const useChurnDashboardStore = create<ChurnDashboardState>((set) => ({
  metricsData: [
    {
      label: "High Risk Customers",
      value: "142",
      change: "↓ 5.2% vs last month",
    },
    {
      label: "Revenue at Risk",
      value: "$1.3M",
      change: "↓ 8% vs last month",
    },
    {
      label: "Avg Churn Score",
      value: "23",
      change: "↓ 5.2% improvement",
    },
  ],
  trendData: [],
  distributionData: [10, 15, 25, 30, 20],
  riskMatrixData: [
    {
      company: "Acme Corp",
      churnRisk: 89,
      daysToRenewal: 15,
      revenue: 150000,
      segment: "Enterprise",
      csm: "Sarah Johnson",
      priority: "CRITICAL",
    },
    {
      company: "Globex",
      churnRisk: 83,
      daysToRenewal: 12,
      revenue: 90000,
      segment: "Mid-Market",
      csm: "Tom Lee",
      priority: "HIGH",
    },
    {
      company: "Soylent",
      churnRisk: 78,
      daysToRenewal: 32,
      revenue: 125000,
      segment: "Enterprise",
      csm: "Priya Nair",
      priority: "HEALTHY",
    },
    {
      company: "Initech",
      churnRisk: 84,
      daysToRenewal: 45,
      revenue: 110000,
      segment: "SMB",
      csm: "Alex Kim",
      priority: "HEALTHY",
    },
    {
      company: "Hooli",
      churnRisk: 72,
      daysToRenewal: 60,
      revenue: 70000,
      segment: "Enterprise",
      csm: "Ryan Chen",
      priority: "CRITICAL",
    },
    {
      company: "Umbrella",
      churnRisk: 76,
      daysToRenewal: 75,
      revenue: 50000,
      segment: "Mid-Market",
      csm: "Julia Park",
      priority: "HEALTHY",
    },
    {
      company: "Stark Industries",
      churnRisk: 81,
      daysToRenewal: 98,
      revenue: 210000,
      segment: "Enterprise",
      csm: "Mark Diaz",
      priority: "HIGH",
    },
    {
      company: "Wayne Enterprises",
      churnRisk: 74,
      daysToRenewal: 105,
      revenue: 80000,
      segment: "SMB",
      csm: "Nina Patel",
      priority: "HEALTHY",
    },
    {
      company: "Wonka",
      churnRisk: 71,
      daysToRenewal: 92,
      revenue: 45000,
      segment: "SMB",
      csm: "Sam Reed",
      priority: "HEALTHY",
    },
  ],
  isLoading: false,
  error: null,
  apiData: null,
  setMetricsData: (metrics) => set({ metricsData: metrics }),
  setDistributionData: (distribution) =>
    set({ distributionData: distribution }),
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
      const data = res?.data || {}

      console.log("data----", data.data)

      // Store the raw API data
      set({ apiData: data })

      // Transform the data for the existing components
      if (data.previousMonth && data.previousPreviousMonth) {
        // Update metrics with real data
        const metrics = [
          {
            label: "High Risk Customers",
            value: data.previousMonth.highRiskCount.toString(),
            change: data.deltas.highRiskCountPctChange
              ? `${data.deltas.highRiskCountPctChange > 0 ? "↑" : "↓"} ${Math.abs(data.deltas.highRiskCountPctChange).toFixed(1)}% vs last month`
              : "No change vs last month",
          },
          {
            label: "Revenue at Risk",
            value: `$${(data.previousMonth.revenueAtRisk / 1000000).toFixed(1)}M`,
            change: data.deltas.revenueAtRiskPctChange
              ? `${data.deltas.revenueAtRiskPctChange > 0 ? "↑" : "↓"} ${Math.abs(data.deltas.revenueAtRiskPctChange).toFixed(1)}% vs last month`
              : "No change vs last month",
          },
          {
            label: "Avg Churn Score",
            value: data.previousMonth.avgChurnScore.toFixed(1),
            change: data.deltas.avgChurnScorePctChange
              ? `${data.deltas.avgChurnScorePctChange > 0 ? "↑" : "↓"} ${Math.abs(data.deltas.avgChurnScorePctChange).toFixed(1)}% vs last month`
              : "No change vs last month",
          },
        ]

        console.log("metrics", metrics)
        set({ metricsData: metrics })

        // Update distribution data
        const distribution = [
          data.previousMonth.churnRiskDistribution.veryLow,
          data.previousMonth.churnRiskDistribution.low,
          data.previousMonth.churnRiskDistribution.medium,
          data.previousMonth.churnRiskDistribution.high,
          data.previousMonth.churnRiskDistribution.critical,
        ]
        set({ distributionData: distribution })

        // Transform high risk customers to risk matrix format
        console.log("highRiskCustomers----", data.highRiskCustomers)
        const riskMatrix = data.highRiskCustomers.map(
          (customer: HighRiskCustomer) => ({
            company: customer.customer_name,
            arr: customer.arr,
            churnRisk: customer.churn_risk_score,
            daysToRenewal:
              customer.renewal_days === "N/A"
                ? 0
                : parseInt(customer.renewal_days),
            revenue:
              customer.monetary_value === "N/A"
                ? 0
                : parseFloat(customer.monetary_value),
            segment: "Unknown", // Not provided in API
            csm: "Unknown", // Not provided in API
            priority:
              customer.risk_level === "Critical"
                ? "CRITICAL"
                : customer.risk_level === "High"
                  ? "HIGH"
                  : "HEALTHY",
          })
        )
        set({ riskMatrixData: riskMatrix })
      }

      // Fallback to existing data structure if API doesn't match expected format
      if (Array.isArray(data.metricsData)) {
        set({ metricsData: data.metricsData })
      }
      if (Array.isArray(data.distributionData)) {
        set({ distributionData: data.distributionData })
      }
      console.log("trendData----**", data.data.trendData)
      if (data.data.trendData && Array.isArray(data.data.trendData)) {
        set({ trendData: data.data.trendData })
      }
      if (Array.isArray(data.riskMatrixData)) {
        set({ riskMatrixData: data.riskMatrixData })
      }
    } catch (err: any) {
      console.log("error", err)
      set({ error: err?.message || "Failed to fetch high risk churn stats" })
    } finally {
      console.log("setting isLoading to false")
      set({ isLoading: false })
    }
  },
  // Demo function to populate with sample data
  populateWithDemoData: () => {
    const demoData: ChurnDashboardAPIResponse = {
      threshold: 70,
      previousMonth: {
        year: 2025,
        month: 7,
        totalCustomers: 12,
        highRiskCount: 10,
        highRiskPercent: 83.33,
        avgChurnScore: 80.83,
        totalHighRiskScore: 900,
        churnScores: [34, 36, 90, 90, 90, 90, 90, 90, 90, 90, 90, 90],
        churnRiskDistribution: {
          veryLow: 0,
          low: 2,
          medium: 0,
          high: 0,
          critical: 10,
        },
        highRiskARR: 120000, // Added ARR for demo
        revenueAtRisk: 1300000, // Added revenueAtRisk for demo
      },
      previousPreviousMonth: {
        year: 2025,
        month: 6,
        totalCustomers: 9,
        highRiskCount: 0,
        highRiskPercent: 0,
        avgChurnScore: 40.56,
        totalHighRiskScore: 0,
        churnScores: [40, 35, 50, 40, 45, 35, 30, 40, 50],
        churnRiskDistribution: {
          veryLow: 0,
          low: 6,
          medium: 3,
          high: 0,
          critical: 0,
        },
        highRiskARR: 0, // Added ARR for demo
        revenueAtRisk: 1000000, // Added revenueAtRisk for demo
      },
      deltas: {
        highRiskCountPctChange: null,
        highRiskPercentPctChange: null,
        avgChurnScorePctChange: 99.29,
        revenueAtRiskPctChange: 30.0, // 30% increase in revenue at risk
      },
      insights: {
        riskDistribution: {
          veryLow: 0,
          low: 2,
          medium: 0,
          high: 0,
          critical: 10,
        },
        totalRecordsProcessed: {
          previous: 12,
          previousPrevious: 9,
        },
      },
      highRiskCustomers: [
        {
          customer_id: "66fc1d0de022f0f3a73f004b",
          customer_name: "Best Western",
          churn_risk_score: 90,
          renewal_days: "N/A",
          monetary_value: "N/A",
          risk_level: "Critical",
        },
        {
          customer_id: "67e4fd4f569a094a71643784",
          customer_name: "Ritz Carlton",
          churn_risk_score: 90,
          renewal_days: "N/A",
          monetary_value: "N/A",
          risk_level: "Critical",
        },
        {
          customer_id: "67e4fd4e569a094a7164377b",
          customer_name: "Omni Hotels",
          churn_risk_score: 90,
          renewal_days: "N/A",
          monetary_value: "N/A",
          risk_level: "Critical",
        },
        {
          customer_id: "66fc1d0de022f0f3a73f0045",
          customer_name: "Marriott",
          churn_risk_score: 90,
          renewal_days: "N/A",
          monetary_value: "N/A",
          risk_level: "Critical",
        },
        {
          customer_id: "66fc1d0de022f0f3a73f0047",
          customer_name: "Sheraton",
          churn_risk_score: 90,
          renewal_days: "N/A",
          monetary_value: "N/A",
          risk_level: "Critical",
        },
        {
          customer_id: "67e4fd4c569a094a71643772",
          customer_name: "Fairmont",
          churn_risk_score: 90,
          renewal_days: "N/A",
          monetary_value: "N/A",
          risk_level: "Critical",
        },
        {
          customer_id: "67e5472f569a094a7164378d",
          customer_name: "Motel 6",
          churn_risk_score: 90,
          renewal_days: "N/A",
          monetary_value: "N/A",
          risk_level: "Critical",
        },
        {
          customer_id: "67e4fd4d569a094a71643778",
          customer_name: "AC Hotels",
          churn_risk_score: 90,
          renewal_days: "N/A",
          monetary_value: "N/A",
          risk_level: "Critical",
        },
        {
          customer_id: "67e4fd4b569a094a71643766",
          customer_name: "bestwesternc.om",
          churn_risk_score: 90,
          renewal_days: "N/A",
          monetary_value: "N/A",
          risk_level: "Critical",
        },
        {
          customer_id: "67e4fd4e569a094a71643781",
          customer_name: "Holiday Inn",
          churn_risk_score: 90,
          renewal_days: "N/A",
          monetary_value: "N/A",
          risk_level: "Critical",
        },
      ],
    }

    // Store the raw API data
    set({ apiData: demoData })

    // Transform the data for the existing components
    const metrics = [
      {
        label: "High Risk Customers",
        value: demoData.previousMonth.highRiskCount.toString(),
        change: demoData.deltas.highRiskCountPctChange
          ? `${demoData.deltas.highRiskCountPctChange > 0 ? "↑" : "↓"} ${Math.abs(demoData.deltas.highRiskCountPctChange).toFixed(1)}% vs last month`
          : "No change vs last month",
      },
      {
        label: "Revenue at Risk",
        value: `$${(demoData.previousMonth.revenueAtRisk / 1000000).toFixed(1)}M`,
        change: demoData.deltas.revenueAtRiskPctChange
          ? `${demoData.deltas.revenueAtRiskPctChange > 0 ? "↑" : "↓"} ${Math.abs(demoData.deltas.revenueAtRiskPctChange).toFixed(1)}% vs last month`
          : "No change vs last month",
      },
      {
        label: "Avg Churn Score",
        value: demoData.previousMonth.avgChurnScore.toFixed(1),
        change: demoData.deltas.avgChurnScorePctChange
          ? `${demoData.deltas.avgChurnScorePctChange > 0 ? "↑" : "↓"} ${Math.abs(demoData.deltas.avgChurnScorePctChange).toFixed(1)}% vs last month`
          : "No change vs last month",
      },
    ]
    set({ metricsData: metrics })

    // Update distribution data
    const distribution = [
      demoData.previousMonth.churnRiskDistribution.veryLow,
      demoData.previousMonth.churnRiskDistribution.low,
      demoData.previousMonth.churnRiskDistribution.medium,
      demoData.previousMonth.churnRiskDistribution.high,
      demoData.previousMonth.churnRiskDistribution.critical,
    ]
    set({ distributionData: distribution })

    // Transform high risk customers to risk matrix format
    const riskMatrix = demoData.highRiskCustomers.map(
      (customer: HighRiskCustomer) => ({
        company: customer.customer_name,
        churnRisk: customer.churn_risk_score,
        daysToRenewal:
          customer.renewal_days === "N/A" ? 0 : parseInt(customer.renewal_days),
        revenue:
          customer.monetary_value === "N/A"
            ? 0
            : parseFloat(customer.monetary_value),
        segment: "Unknown", // Not provided in API
        csm: "Unknown", // Not provided in API
        priority: (customer.risk_level === "Critical"
          ? "CRITICAL"
          : customer.risk_level === "High"
            ? "HIGH"
            : "HEALTHY") as RiskPriority,
      })
    )
    set({ riskMatrixData: riskMatrix })
  },
}))
