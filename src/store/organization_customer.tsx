import { create } from "zustand"

type orgCustomerConfig = {
  orgCustomers: { organization: string; customers: [] }
  loading: boolean
  orgToken: string
  setOrgCustomers: (data: any) => void
  setLoading: (loading: boolean) => void
  setOrgToken: (token: string) => void
  agentList: string[]
  redshiftCustomers: any[]
  setOrgAgents: (data: any) => void
}

const useOrgCustomer = create<orgCustomerConfig>((set) => ({
  orgCustomers: { organization: "", customers: [] },
  redshiftCustomers: [],
  loading: false,
  agentList: [],
  orgToken: "",
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
