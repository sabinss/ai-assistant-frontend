import { create } from "zustand"

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
}

const useOrgCustomer = create<orgCustomerConfig>((set, get) => ({
  orgCustomers: { organization: "", customers: [] },
  redshiftCustomers: [],
  loading: false,
  agentList: [],
  orgToken: "",
  customerMessageSending: false,
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
}))

export default useOrgCustomer
