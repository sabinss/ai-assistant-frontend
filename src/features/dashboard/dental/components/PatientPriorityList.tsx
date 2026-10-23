import type { PatientPriorityItem } from "../types"
import PatientPriorityRow from "./PatientPriorityRow"

type PatientPriorityListProps = {
  patients: PatientPriorityItem[]
  onMarkDone?: (patientId: string) => void
  emptyMessage?: string
}

export default function PatientPriorityList({
  patients,
  onMarkDone,
  emptyMessage = "No patients in this priority right now.",
}: PatientPriorityListProps) {
  if (patients.length === 0) {
    return (
      <div className="px-5 py-12 text-center text-sm text-slate-500">
        {emptyMessage}
      </div>
    )
  }

  return (
    <div>
      {patients.map((patient) => (
        <PatientPriorityRow
          key={patient.id}
          patient={patient}
          onMarkDone={onMarkDone}
        />
      ))}
    </div>
  )
}
