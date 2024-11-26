import { create } from "zustand"

type orgCustomerConfig = {
  orgCustomers: { organization: string; customers: [] }
  loading: boolean
  orgToken: string
  setOrgCustomers: (data: any) => void
  setLoading: (loading: boolean) => void
  setOrgToken: (token: string) => void
}

const useOrgCustomer = create<orgCustomerConfig>((set) => ({
  orgCustomers: { organization: "", customers: [] },
  loading: false,
  orgToken: "",
  setOrgCustomers: (data: any) => set({ orgCustomers: data }),
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
