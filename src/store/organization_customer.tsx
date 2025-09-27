import { create } from "zustand"

// Cache duration: 5 minutes
const CACHE_DURATION = 5 * 60 * 1000

interface CustomerScoreCache {
  [customerId: string]: {
    scoreData: any
    detailsData: any
    timestamp: number
  }
}

interface ScoreDriver {
  name: string
  impact: number
  score: number
  trend: string
}

interface ScoreTabData {
  title: string
  value: number
  keyDrivers: ScoreDriver[]
}

type orgCustomerConfig = {
  orgCustomers: { organization: string; customers: [] }
  loading: boolean
  orgToken: string
  setOrgCustomers: (data: any) => void
  setLoading: (loading: boolean) => void
  setOrgToken: (token: string) => void
  agentList: string[]
  customerConversationMessages: any
  redshiftCustomers: any[]
  setOrgAgents: (data: any) => void
  customerMessageSending: boolean
  setCustomerConversationMessage: (data: any) => void
  appendCustomerConversationMessage: (data: any) => void
  setCustomerMessageStatus: (data: any) => void
  clearCustomerConversationMessages: () => void
  // CustomerInsightsChat state management
  isCustomerInsightsOpen: boolean
  setCustomerInsightsOpen: (isOpen: boolean) => void
  resetCustomerInsightsState: () => void
  // Customer Score Cache
  customerScoreCache: CustomerScoreCache
  setCustomerScoreCache: (
    customerId: string,
    scoreData: any,
    detailsData: any
  ) => void
  getCustomerScoreCache: (
    customerId: string
  ) => { scoreData: any; detailsData: any } | null
  clearCustomerScoreCache: (customerId?: string) => void
  isCacheValid: (customerId: string) => boolean
}

const useOrgCustomer = create<orgCustomerConfig>((set, get) => ({
  orgCustomers: { organization: "", customers: [] },
  redshiftCustomers: [],
  loading: false,
  agentList: [],
  orgToken: "",
  customerMessageSending: false,
  // Customer Score Cache
  customerScoreCache: {},

  setCustomerMessageStatus: (loading: boolean) =>
    set({ customerMessageSending: loading }),
  customerConversationMessages: [],
  setCustomerConversationMessage: (messages: any) =>
    set({
      customerConversationMessages: messages,
    }),
  // ➕ Append a new message
  appendCustomerConversationMessage: (data: any) =>
    set({
      customerConversationMessages: [
        ...get().customerConversationMessages,
        data,
      ],
    }),
  // ➕ Clear chat history
  clearCustomerConversationMessages: () =>
    set({
      customerConversationMessages: [],
    }),
  // CustomerInsightsChat state management
  isCustomerInsightsOpen: false,
  setCustomerInsightsOpen: (isOpen: boolean) =>
    set({ isCustomerInsightsOpen: isOpen }),
  resetCustomerInsightsState: () =>
    set({
      isCustomerInsightsOpen: false,
      customerConversationMessages: [],
    }),
  setOrgAgents: (data: any[]) => set({ agentList: data }),
  setOrgCustomers: (data: any) => set({ orgCustomers: data }),
  setRedshiftCustomers: (data: any) => set({ redshiftCustomers: data }),
  // Method to set the mock data
  setLoading: (loading: boolean) => set({ loading }),
  setOrgToken: (orgToken) => {
    set((state) => ({
      ...state,
      orgToken: orgToken,
    }))
  },

  // Customer Score Cache Methods
  setCustomerScoreCache: (
    customerId: string,
    scoreData: any,
    detailsData: any
  ) => {
    set((state) => ({
      customerScoreCache: {
        ...state.customerScoreCache,
        [customerId]: {
          scoreData,
          detailsData,
          timestamp: Date.now(),
        },
      },
    }))
  },

  getCustomerScoreCache: (customerId: string) => {
    const cache = get().customerScoreCache[customerId]
    if (!cache) return null

    // Check if cache is still valid
    if (Date.now() - cache.timestamp > CACHE_DURATION) {
      // Cache expired, remove it
      get().clearCustomerScoreCache(customerId)
      return null
    }

    return {
      scoreData: cache.scoreData,
      detailsData: cache.detailsData,
    }
  },

  isCacheValid: (customerId: string) => {
    const cache = get().customerScoreCache[customerId]
    if (!cache) return false
    return Date.now() - cache.timestamp < CACHE_DURATION
  },

  clearCustomerScoreCache: (customerId?: string) => {
    if (customerId) {
      set((state) => {
        const newCache = { ...state.customerScoreCache }
        delete newCache[customerId]
        return { customerScoreCache: newCache }
      })
    } else {
      // Clear all cache
      set({ customerScoreCache: {} })
    }
  },
}))

export default useOrgCustomer
