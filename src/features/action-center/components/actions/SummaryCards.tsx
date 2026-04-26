import type { ActionTier, SummaryStat } from "../../types"

const TIER_COLORS: Record<ActionTier, string> = {
  today: "#C0392B",
  week: "#D4A017",
  month: "#2E8B57",
  watch: "#1B3A8C",
}

type SummaryCardsProps = { stats: SummaryStat[] }

export default function SummaryCards({ stats }: SummaryCardsProps) {
  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "repeat(4,1fr)",
        gap: 10,
        marginBottom: 18,
      }}
    >
      {stats.map((s) => (
        <div
          key={s.id}
          style={{
            background: "#fff",
            border: "1px solid #E2E6EF",
            borderRadius: 10,
            padding: "12px 16px",
            borderTop: `3px solid ${TIER_COLORS[s.tier]}`,
          }}
        >
          <div
            style={{
              fontSize: 10.5,
              color: "#8B91A3",
              textTransform: "uppercase",
              letterSpacing: "0.07em",
              marginBottom: 4,
              fontWeight: 500,
            }}
          >
            {s.label}
          </div>
          <div
            style={{
              fontSize: 24,
              fontWeight: 700,
              color: "#1A1F2E",
              letterSpacing: "-0.5px",
            }}
          >
            {s.count}
          </div>
          <div style={{ fontSize: 11, color: "#8B91A3", marginTop: 1 }}>{s.sub}</div>
        </div>
      ))}
    </div>
  )
}
