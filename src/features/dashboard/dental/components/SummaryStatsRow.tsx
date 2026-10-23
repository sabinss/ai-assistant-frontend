import type { PatientPrioritySummaryStat } from "../types"
import SummaryStatCard from "./SummaryStatCard"

type SummaryStatsRowProps = {
  stats: PatientPrioritySummaryStat[]
  onStatClick?: (statId: string) => void
}

export default function SummaryStatsRow({
  stats,
  onStatClick,
}: SummaryStatsRowProps) {
  return (
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
      {stats.map((stat) => (
        <SummaryStatCard key={stat.id} stat={stat} onClick={onStatClick} />
      ))}
    </div>
  )
}
