"use client"
import useAuth from "@/store/user"
import { useEffect } from "react"
import { useRouter } from "next/navigation"

export default function Page() {
    const router = useRouter()
    const { logoutUser } = useAuth()
    useEffect(() => {
        logoutUser();
        router.push("/auth/signin");
    }, [])
    return (
        <div>
            <h1> Logging you Out  ...... </h1>
        </div>
    )
}