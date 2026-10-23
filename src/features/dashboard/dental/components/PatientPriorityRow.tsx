import type { PatientPriorityItem } from "../types"
import PatientTag from "./PatientTag"

type PatientPriorityRowProps = {
  patient: PatientPriorityItem
  onMarkDone?: (patientId: string) => void
}

export default function PatientPriorityRow({
  patient,
  onMarkDone,
}: PatientPriorityRowProps) {
  return (
    <article className="grid grid-cols-1 gap-4 border-b border-slate-100 px-4 py-5 last:border-b-0 lg:grid-cols-[minmax(0,1.1fr)_minmax(0,1.6fr)_minmax(0,1.2fr)_auto] lg:items-start lg:gap-6 lg:px-5">
      <div className="min-w-0">
        <h3 className="text-base font-semibold text-blue-700">
          {patient.patientName}
        </h3>
        <div className="mt-2 flex flex-wrap gap-1.5">
          {patient.tags.map((tag) => (
            <PatientTag key={`${patient.id}-${tag.id}`} tag={tag} />
          ))}
        </div>
      </div>

      <div className="min-w-0">
        <p className="text-sm leading-relaxed text-slate-700">{patient.reason}</p>
        <p className="mt-2 text-xs text-slate-500">{patient.meta}</p>
      </div>

      <div className="min-w-0">
        <p className="text-sm text-slate-800">
          <span className="font-semibold text-slate-900">Next step</span>{" "}
          {patient.nextStep}
        </p>
      </div>

      <div className="lg:pt-0.5">
        <button
          type="button"
          onClick={() => onMarkDone?.(patient.id)}
          className="rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-sm font-medium text-slate-700 shadow-sm transition hover:border-slate-300 hover:bg-slate-50"
        >
          Patient Detail
        </button>
      </div>
    </article>
  )
}
