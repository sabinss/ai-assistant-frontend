import { X } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"
import ScoreTab from "./ScoreTab"

export default function CustomerSlideIn({ customer, onClose }: any) {
  const health = customer?.redShiftCustomer?.health_score ?? 0
  const churn = customer?.redShiftCustomer?.churn_risk_score ?? 0
  const opp = customer?.redShiftCustomer?.expansion_opp_score ?? 0

  return (
    <AnimatePresence>
      {customer && (
        <motion.div
          className="fixed inset-0 z-50 flex flex-col overflow-y-auto bg-white"
          initial={{ x: "-100%" }}
          animate={{ x: 0 }}
          exit={{ x: "-100%" }}
          transition={{ type: "spring", stiffness: 300, damping: 30 }}
        >
          <div className="flex items-center justify-between border-b bg-white p-4 shadow-md">
            <div>
              <h2 className="text-xl font-bold">{customer.name}</h2>
              <p className="text-sm text-gray-500">
                ARR: {customer.arr} • Renewed
              </p>
            </div>
            <X className="cursor-pointer" onClick={onClose} />
          </div>

          <div className="grid grid-cols-1 gap-4 p-6 md:grid-cols-3">
            <ScoreCard
              title="Health Score"
              value={health}
              description="Excellent"
              color="blue"
            />
            <ScoreCard
              title="Churn Risk"
              value={churn}
              description="Minimal Risk"
              color="red"
            />
            <ScoreCard
              title="Expansion Opportunity"
              value={opp}
              description="Good Opportunity"
              color="green"
            />
          </div>
          <ScoreTab />
        </motion.div>
      )}
    </AnimatePresence>
  )
}

function ScoreCard({ title, value, description, color }: any) {
  const colorMap: any = {
    blue: "bg-blue-50 text-blue-700",
    red: "bg-red-50 text-red-700",
    green: "bg-green-50 text-green-700",
  }

  return (
    <div className={`rounded p-4 text-left ${colorMap[color]}`}>
      <h3 className="text-xl font-bold">{title}</h3>
      <p className="text-2xl font-bold">{value}</p>
      <p className="text-base font-bold">{description}</p>
    </div>
  )
}
