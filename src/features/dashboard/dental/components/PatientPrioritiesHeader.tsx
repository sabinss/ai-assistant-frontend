type PatientPrioritiesHeaderProps = {
  title: string
  subtitle: string
  clinicName: string
  updatedLabel: string
}

export default function PatientPrioritiesHeader({
  title,
  subtitle,
  clinicName,
  updatedLabel,
}: PatientPrioritiesHeaderProps) {
  return (
    <div className="flex flex-col gap-1 sm:flex-row sm:items-start sm:justify-between">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-slate-900 sm:text-[1.65rem]">
          {title}
        </h1>
        <p className="mt-1 text-sm text-slate-500">{subtitle}</p>
      </div>
      <p className="shrink-0 text-sm text-slate-500 sm:pt-1 sm:text-right">
        {clinicName}
        <span className="mx-1.5 text-slate-300">·</span>
        {updatedLabel}
      </p>
    </div>
  )
}
