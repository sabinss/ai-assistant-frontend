import { create } from "zustand"

type orgCustomerConfig = {
  orgCustomers: { organization: string; customers: [] }
  loading: boolean
  setOrgCustomers: (data: any) => void
  setLoading: (loading: boolean) => void
}

const useOrgCustomer = create<orgCustomerConfig>((set) => ({
  orgCustomers: { organization: "", customers: [] },
  loading: false,

  setOrgCustomers: (data: any) => set({ orgCustomers: data }),
  // Method to set the mock data
  setLoading: (loading: boolean) => set({ loading }),
}))

export default useOrgCustomer
