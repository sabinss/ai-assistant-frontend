import { X } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"
import ScoreTab from "./ScoreTab"
import { useEffect, useState } from "react"
import useAuth from "@/store/user"
import http from "@/config/http"
import { Loader2 } from "lucide-react" // spinner icon from lucide-react
import InsightsPanel from "./CustomeInsightsChat"
import useOrgCustomer from "@/store/organization_customer"

export default function CustomerSlideIn({
  customer,
  onClose,
  sendCustomerChat,
}: any) {
  const { user_data, access_token, chatSession, setChatSession } = useAuth()
  const { clearCustomerConversationMessages } = useOrgCustomer()
  const [loading, setLoading] = useState(false)
  const [score, setScore] = useState<any[]>([])
  const [scoreDetails, setScoreDetails] = useState<any[]>([])
  const health = customer?.health_score ?? 0
  const churn = customer?.churn_risk_score ?? 0
  const opp = customer?.expansion_opp_score ?? 0

  const [scoreTabData, setScoreTabData] = useState<any>([])
  const [recommendedActions, setRecommendedActions] = useState<any>([])
  const [scoreAnalysis, setScoreAnalysis] = useState<any>([])

  useEffect(() => {
    if (!customer?._id) return

    async function fetchCustomerScoreData() {
      try {
        setLoading(true)
        const [scoreResp, detailResp] = await Promise.all([
          http.get(`/customer/${customer._id}/score`, {
            headers: { Authorization: `Bearer ${access_token}` },
          }),
          http.get(`/customer/${customer._id}/details`, {
            headers: { Authorization: `Bearer ${access_token}` },
          }),
        ])
        console.log("scoreResp---", scoreResp)
        console.log("detailResp---", detailResp)

        let healthDrivers: any[] = []
        let churnDrivers: any[] = []
        let expansionDrivers: any[] = []

        if (detailResp?.data?.data?.length > 0) {
          const grouped = detailResp.data.data.reduce((acc: any, item: any) => {
            const key = item.score_type
            if (!acc[key]) acc[key] = []
            acc[key].push(item)
            return acc
          }, {})

          healthDrivers = (grouped["Health"] || []).map((d) => ({
            name: d.score_driver_id,
            impact: d.score,
            score: d.score,
            trend: "",
          }))

          churnDrivers = (grouped["Churn"] || []).map((d) => ({
            name: d.score_driver_id,
            impact: d.score,
            score: d.score,
            trend: "",
          }))

          expansionDrivers = (grouped["Expansion"] || []).map((d) => ({
            name: d.score_driver_id,
            impact: d.score,
            score: d.score,
            trend: "",
          }))
        }

        if (scoreResp.data?.data?.length > 0) {
          const {
            health_score,
            churn_risk_score,
            expansion_opp_score,
            churn_score_analysis,
            expansion_score_analysis,
            health_score_analysis,
            recommendation,
          } = scoreResp.data.data[0]

          // ✅ Set keyDrivers here using mapped arrays
          setScoreTabData([
            {
              title: "Health Score",
              value: health_score,
              keyDrivers: healthDrivers,
            },
            {
              title: "Churn Risk",
              value: churn_risk_score,
              keyDrivers: churnDrivers,
            },
            {
              title: "Expansion Opp Score",
              value: expansion_opp_score,
              keyDrivers: expansionDrivers,
            },
          ])

          setRecommendedActions([recommendation])

          setScoreAnalysis([
            {
              title: "Health Score Analysis",
              growthIndicators: [health_score_analysis],
              recommendedActions: [],
            },
            {
              title: "Churn Risk Analysis",
              growthIndicators: [churn_score_analysis],
              recommendedActions: [],
            },
            {
              title: "Expansion Opportunity Analysis",
              growthIndicators: [expansion_score_analysis],
            },
          ])
        } else {
          // No scores available
          setScoreTabData([
            {
              title: "Health Score",
              value: 0,
              keyDrivers: [],
            },
            {
              title: "Churn Risk",
              value: 0,
              keyDrivers: [],
            },
            {
              title: "Expansion Opp Score",
              value: 0,
              keyDrivers: [],
            },
          ])
          setScoreAnalysis([
            {
              title: "Health Score Analysis",
              growthIndicators: [],
              recommendedActions: [],
            },
            {
              title: "Churn Risk Analysis",
              growthIndicators: [],
              recommendedActions: [],
            },
            {
              title: "Expansion Opportunity Analysis",
              growthIndicators: [],
            },
          ])
        }
      } catch (error) {
        console.error("Error fetching customer score data", error)
      } finally {
        setLoading(false)
      }
    }

    fetchCustomerScoreData()
  }, [customer?._id])

  // Clear chat history when component unmounts
  useEffect(() => {
    return () => {
      // Clear chat history when CustomerSlideIn is unmounted
      clearCustomerConversationMessages()
    }
  }, [clearCustomerConversationMessages])

  return (
    <AnimatePresence>
      {customer && (
        <motion.div
          className="fixed inset-0 z-50 flex flex-row bg-white"
          initial={{ x: "-100%" }}
          animate={{ x: 0 }}
          exit={{ x: "-100%" }}
          transition={{ type: "spring", stiffness: 300, damping: 30 }}
        >
          {/* 👉 Scrollable Left Side */}
          <div className="flex h-screen w-[calc(100%-500px)] flex-grow-[1] flex-col overflow-y-auto">
            <div className="flex items-center justify-between border-b bg-white p-4 shadow-md">
              <div>
                <h2 className="text-xl font-bold">{customer.name}</h2>
                <p className="text-sm text-gray-500">ARR: {customer.arr}</p>
              </div>
              <X
                className="cursor-pointer"
                onClick={() => {
                  // Clear chat history when closing the slide-in
                  clearCustomerConversationMessages()
                  onClose()
                }}
              />
            </div>

            {loading ? (
              <div className="flex items-center justify-center py-10">
                <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
                <span className="ml-3 text-sm text-gray-600">
                  Loading customer scores...
                </span>
              </div>
            ) : (
              <>
                <div className="grid grid-cols-1 gap-4 p-6 md:grid-cols-3">
                  <ScoreCard title="Health Score" value={health} color="blue" />
                  <ScoreCard title="Churn Risk" value={churn} color="red" />
                  <ScoreCard
                    title="Expansion Opportunity"
                    value={opp}
                    color="green"
                  />
                </div>
                <ScoreTab
                  tabsData={scoreTabData}
                  analysisData={scoreAnalysis}
                  recommendedActions={recommendedActions}
                />
              </>
            )}
          </div>

          {/* 👉 Fixed Insights Panel (floating on the right) */}
          <div className="h-screen w-[500px] shrink-0 overflow-y-auto border-l shadow-lg">
            <InsightsPanel
              customer={customer}
              sendCustomerChat={sendCustomerChat}
            />
          </div>
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
