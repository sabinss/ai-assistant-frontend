import type { PatientPrioritySummaryStat } from "../types"

const TONE_STYLES: Record<
  PatientPrioritySummaryStat["tone"],
  { label: string; count: string; activeBorder: string }
> = {
  very_high: {
    label: "text-blue-700",
    count: "text-blue-800",
    activeBorder: "border-blue-500 ring-1 ring-blue-500/30",
  },
  health: {
    label: "text-emerald-700",
    count: "text-emerald-800",
    activeBorder: "border-emerald-500 ring-1 ring-emerald-500/30",
  },
  might_leave: {
    label: "text-violet-700",
    count: "text-violet-800",
    activeBorder: "border-violet-500 ring-1 ring-violet-500/30",
  },
  treatment: {
    label: "text-teal-700",
    count: "text-teal-800",
    activeBorder: "border-teal-500 ring-1 ring-teal-500/30",
  },
  total: {
    label: "text-slate-700",
    count: "text-slate-900",
    activeBorder: "border-slate-400 ring-1 ring-slate-400/30",
  },
}

type SummaryStatCardProps = {
  stat: PatientPrioritySummaryStat
  onClick?: (statId: string) => void
}

export default function SummaryStatCard({ stat, onClick }: SummaryStatCardProps) {
  const tone = TONE_STYLES[stat.tone]
  const interactive = Boolean(onClick)

  return (
    <button
      type="button"
      disabled={!interactive}
      onClick={() => onClick?.(stat.id)}
      className={[
        "rounded-xl border bg-white px-4 py-3.5 text-left shadow-sm transition",
        stat.active
          ? tone.activeBorder
          : "border-slate-200 hover:border-slate-300",
        interactive ? "cursor-pointer" : "cursor-default",
      ].join(" ")}
    >
      <p className={`text-sm font-medium ${tone.label}`}>{stat.label}</p>
      <p className={`mt-1 text-3xl font-semibold tracking-tight ${tone.count}`}>
        {stat.count}
      </p>
      <p className="mt-1 text-sm text-slate-500">{stat.description}</p>
    </button>
  )
}
