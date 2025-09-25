const fs = require('fs');

// Read the file
let content = fs.readFileSync('src/store/churn_dashboard.ts', 'utf8');

// Replace the specific lines in the fetchCustomerScoreData function
content = content.replace(
  '      console.log("res", res)',
  '      console.log("Customer Score Data Response:", res.data)\n      const data = res?.data?.data || res?.data\n      set({ customerScoreData: data, isLoading: false })'
);

content = content.replace(
  '    } catch (err: any) {\n      set({ isLoading: false, error: err })\n    }',
  '    } catch (err: any) {\n      console.error("Error fetching customer score data:", err)\n      set({ isLoading: false, error: err?.message || "Failed to fetch customer score data" })\n    }'
);

// Write the file back
fs.writeFileSync('src/store/churn_dashboard.ts', content);

console.log('Store updated successfully');
