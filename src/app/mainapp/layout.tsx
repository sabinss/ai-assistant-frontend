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
  return _hasHydrated && mounted && (
    <>
      <Suspense fallback={
        <div className="flex justify-center items-center h-[400px]">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
        </div>
      }>
        <TopNavBar />
        <div className="flex flex-row mt-[64px] p-1 relative">
          <Sidebar />
          <div className="w-full h-screen overflow-y-scroll text-sm bg-slate-100 p-2 pb-10">
            {children}
          </div>
        </div>
      </Suspense >
    </>
  )
}