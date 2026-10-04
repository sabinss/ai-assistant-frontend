import ActivityView from "@/features/activity/ActivityView"

export default function ActivityPage() {
  return (
    <div className="box-border flex h-[min(100dvh,100vh)] min-h-0 w-full min-w-0 max-w-full flex-1 flex-col overflow-hidden p-1">
      <ActivityView />
    </div>
  )
}
