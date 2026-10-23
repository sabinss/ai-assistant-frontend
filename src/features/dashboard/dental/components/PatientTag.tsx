import type { PatientPriorityTag } from "../types"

const KIND_STYLES: Record<PatientPriorityTag["kind"], string> = {
  very_high: "bg-rose-50 text-rose-700 ring-rose-200",
  high: "bg-orange-50 text-orange-700 ring-orange-200",
  reply_waiting: "bg-sky-50 text-sky-700 ring-sky-200",
  treatment: "bg-emerald-50 text-emerald-700 ring-emerald-200",
  health: "bg-green-50 text-green-700 ring-green-200",
  might_leave: "bg-violet-50 text-violet-700 ring-violet-200",
}

type PatientTagProps = {
  tag: PatientPriorityTag
}

export default function PatientTag({ tag }: PatientTagProps) {
  return (
    <span
      className={[
        "inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ring-1 ring-inset",
        KIND_STYLES[tag.kind],
      ].join(" ")}
    >
      {tag.label}
    </span>
  )
}
