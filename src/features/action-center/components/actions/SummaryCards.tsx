import type { ActionTier, SummaryStat } from "../../types"

const TIER_COLORS: Record<ActionTier, string> = {
  today: "#C0392B",
  week: "#D4A017",
  month: "#2E8B57",
  watch: "#1B3A8C",
}

type SummaryCardsProps = {
  stats: SummaryStat[]
  selectedTier: ActionTier | null
  onTierClick: (tier: ActionTier) => void
}

export default function SummaryCards({ stats, selectedTier, onTierClick }: SummaryCardsProps) {
  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "repeat(4,1fr)",
        gap: 10,
        marginBottom: 18,
      }}
    >
      {stats.map((s) => {
        const isSelected = selectedTier === s.tier
        return (
          <button
            type="button"
            key={s.id}
            onClick={() => onTierClick(s.tier)}
            style={{
              textAlign: "left",
              cursor: "pointer",
              font: "inherit",
              background: "#fff",
              border: isSelected ? `2px solid ${TIER_COLORS[s.tier]}` : "1px solid #E2E6EF",
              borderRadius: 10,
              padding: "12px 16px",
              borderTop: `3px solid ${TIER_COLORS[s.tier]}`,
              boxShadow: isSelected ? "0 2px 8px rgba(26, 31, 46, 0.08)" : "none",
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
          </button>
        )
      })}
    </div>
  )
}
