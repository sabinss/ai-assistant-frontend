import { renderSectionTitle } from "@/lib/sectionTitle"
import { formatCurrency } from "@/utility"
import { ChevronRight } from "lucide-react"

export default function ImmediateActions({ highRiskCustomers }: any) {
  return (
    <div className="rounded-xl bg-white p-6 shadow">
      {renderSectionTitle("Immediate Actions Required")}
      <div className="space-y-4">
        {highRiskCustomers.length > 0 &&
          highRiskCustomers?.map((item: any, idx: number) => {
            const isCritical = item.scoreLabel?.toLowerCase() === "high risk"
            const pillClasses = isCritical
              ? "bg-red-100 text-red-700"
              : "bg-amber-100 text-amber-700"
            return (
              <div
                key={idx}
                className="flex items-center justify-between rounded-xl bg-gray-50 px-4 py-5"
              >
                <div>
                  <div className="font-semibold text-gray-800">{item.name}</div>
                  <div className="text-sm text-gray-500">
                    Score: {item.churn_risk_score} | Renewal:{" "}
                    {item.renewal_duration} days
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="text-right font-semibold text-green-600">
                    {formatCurrency(item?.arr ? parseFloat(item.arr) : 0)}
                  </div>
                  <span
                    className={`rounded-full px-3 py-1 text-xs ${pillClasses}`}
                  >
                    {isCritical ? "Critical" : "High"}
                  </span>
                  <ChevronRight
                    size={20}
                    className="cursor-pointer text-gray-400 transition-colors hover:text-gray-600"
                    onClick={() => {
                      // Transform the item data to match the expected customer format
                      // const customerData = {
                      //   _id: item.customer_id,
                      //   name: item.customer_name,
                      //   arr: item.arr ? parseFloat(item.arr) : 0,
                      //   health_score: 0, // Default value since not available
                      //   churn_risk_score: item.churn_risk_score,
                      //   expansion_opp_score: 0, // Default value since not available
                      //   // Add any other fields that CustomerSlideIn might need
                      // }
                      //   setSelectedCustomer(customerData)
                    }}
                  />
                </div>
              </div>
            )
          })}
      </div>
    </div>
  )
}
