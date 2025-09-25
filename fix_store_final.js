const fs = require('fs');

// Read the file
let content = fs.readFileSync('src/store/churn_dashboard.ts', 'utf8');

// Find and replace the fetchCustomerScoreData function
const oldFunction = `  fetchCustomerScoreData: async (accessToken: string) => {
    set({ isLoading: true, error: null })
    try {
      const res = await http.get(\`/customer/score-dashboard\`, {
        headers: { Authorization: \`Bearer \${accessToken}\` },
      })
      console.log("res", res)
    } catch (err: any) {
      set({ isLoading: false, error: err })
    }
  },`;

const newFunction = `  fetchCustomerScoreData: async (accessToken: string) => {
    set({ isLoading: true, error: null })
    try {
      const res = await http.get(\`/customer/score-dashboard\`, {
        headers: { Authorization: \`Bearer \${accessToken}\` },
      })
      console.log("Customer Score Data Response:", res.data)
      const data = res?.data?.data || res?.data
      set({ customerScoreData: data, isLoading: false })
    } catch (err: any) {
      console.error("Error fetching customer score data:", err)
      set({ isLoading: false, error: err?.message || "Failed to fetch customer score data" })
    }
  },`;

// Replace the function
content = content.replace(oldFunction, newFunction);

// Write the file back
fs.writeFileSync('src/store/churn_dashboard.ts', content);

console.log('Store updated successfully');
