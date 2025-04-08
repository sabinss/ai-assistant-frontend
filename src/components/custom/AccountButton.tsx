import * as React from "react"
import { ChevronDown, CircleUserRound } from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { useRouter } from "next/navigation"
import useAuth from "@/store/user"
import Link from "next/link"

export function AccountButton() {
  const { logoutUser, user_data } = useAuth()
  const router = useRouter()

  const handleLogout = () => {
    logoutUser()
    router.push("/auth/signin")
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <div className="flex items-center gap-3">
          <CircleUserRound
            size={32}
            absoluteStrokeWidth
            className="text-white"
          />
          <div className="flex flex-col text-nowrap">
            <p className="text-xs text-gray-400">Welcome back</p>
            <p className="text-sm text-white">
              {user_data !== null ? user_data.email : "name"}
            </p>
          </div>
          <ChevronDown className="text-gray-400" />
        </div>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-56">
        <DropdownMenuLabel>Accounts</DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuRadioGroup>
          <DropdownMenuRadioItem value="top">
            <Link href={"/mainapp/profile"}> Profile </Link>{" "}
          </DropdownMenuRadioItem>
          <DropdownMenuRadioItem value="right" onClick={() => handleLogout()}>
            Logout
          </DropdownMenuRadioItem>
        </DropdownMenuRadioGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

export default AccountButton
