"use client"
import { Suspense, useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import Sidebar from "./Sidebar"
import TopNavBar from "./TopNavBar"
import useAuth from "@/store/user"
import useStore from "@/store/useStore"
export default function MainAppLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const [mounted, setMounted] = useState(false)
  const { is_logged_in, _hasHydrated } = useAuth()
  const router = useRouter()
  useEffect(() => {
    setMounted(true)
  }, [_hasHydrated])
  return (
    _hasHydrated &&
    mounted && (
      <>
        <Suspense
          fallback={
            <div className="flex h-[400px] items-center justify-center">
              <div className="h-12 w-12 animate-spin rounded-full border-b-2 border-gray-900"></div>
            </div>
          }
        >
          <TopNavBar />
          <div className="relative mt-[64px] flex flex-row p-1">
            <Sidebar />
            <div className="h-screen w-full overflow-y-scroll bg-slate-100 p-2 pb-10 text-sm">
              {children}
            </div>
          </div>
        </Suspense>
      </>
    )
  )
}
