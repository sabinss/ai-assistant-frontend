"use client"
import Image from "next/image"
import robotImage from "../../assets/images/robo1.jpeg"
import { Button } from "@/components/ui/button"
import TopNavBar from "../mainapp/TopNavBar"
import useAuth from "@/store/user"
import { useEffect } from "react"
import { useRouter } from "next/navigation"

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const router = useRouter()

  const { is_logged_in } = useAuth()
  useEffect(() => {
    if (is_logged_in === true) router.push("/mainapp/chat")
  }, [is_logged_in])

  return (
    <>
      <TopNavBar />
      <div className="flex h-[100vh] items-center justify-center">
        <div className="mx-10 flex h-[580px] w-full overflow-hidden rounded-xl border-2 border-slate-100 shadow-lg lg:w-[60%]">
          <div className="hidden w-1/2 flex-col justify-center bg-gradient-to-b from-[#174894] to-[#242866] md:flex">
            <h1 className="text-center text-lg text-white">
              AI Co-worker, Ready to Assist.
            </h1>
            <Image
              className="mx-auto mt-4 w-[80%] rounded-md"
              src={robotImage}
              alt="auth-img"
            />
            <p className="text-center text-sm text-white"></p>
            {/* <Button className="mx-auto mt-5 w-fit bg-[#174894]">
              Learn More
            </Button> */}
          </div>
          <div className="flex min-h-[100%] w-full flex-col justify-center rounded-e-xl md:w-1/2">
            {children}
          </div>
        </div>
      </div>
    </>
  )
}
