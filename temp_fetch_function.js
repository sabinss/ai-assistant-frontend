  fetchCustomerScoreData: async (accessToken: string) => {
    set({ isLoading: true, error: null })
    try {
      const res = await http.get(`/customer/score-dashboard`, {
        headers: { Authorization: `Bearer ${accessToken}` },
      })
      console.log("Customer Score Data Response:", res.data)
      const data = res?.data?.data || res?.data
      set({ customerScoreData: data, isLoading: false })
    } catch (err: any) {
      console.error("Error fetching customer score data:", err)
      set({ isLoading: false, error: err?.message || "Failed to fetch customer score data" })
    }
  },
