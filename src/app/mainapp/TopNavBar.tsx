import NotificationButton from "../../components/custom/NotificationButton"
import AccountButton from "../../components/custom/AccountButton"
import useAuth from "@/store/user"
import { Search, AlignJustify, X } from "lucide-react"
import useNavBarStore from "@/store/store"
import Image from "next/image"
import logo from "@/assets/images/logo_final.svg"
import { GiHamburgerMenu } from "react-icons/gi"

export default function TopNavBar() {
  const { isCollapsed, setOpen, setCollapse } = useNavBarStore()
  const { is_logged_in } = useAuth()

  return (
    <div className="nav fixed top-0 z-10 box-border flex h-16 w-full items-center justify-between gap-10 border-b bg-[#174894] bg-fixed px-5 py-3 text-white shadow-md">
      <div className="flex items-center ">
        {is_logged_in && (
          <div className="md:hidden">
            {isCollapsed ? (
              <AlignJustify
                className="mr-2 inline cursor-pointer"
                onClick={setOpen}
              />
            ) : (
              <X className="mr-2 inline cursor-pointer" onClick={setCollapse} />
            )}
          </div>
        )}
        <p className="ml-2 text-xl font-bold sm:text-2xl">
          <span className="font-extrabold">
            <Image src={logo} alt="logo" height={200} width={150} />
          </span>
        </p>
        <div className="ml-40 flex h-8 w-8 items-center justify-center rounded-full bg-white p-1">
          <GiHamburgerMenu size={20} color="black" />
        </div>
      </div>

      {is_logged_in && (
        <div className="hidden justify-between  gap-10 md:flex">
          {/* <div className="flex w-full items-center rounded-lg border-none bg-gray-200 px-3 py-2">
            <input
              type="text"
              placeholder="Search"
              className="flex w-full items-center justify-center border-none bg-transparent text-xs outline-none"
            />
            <Search className="text-gray-400" size={20} />
          </div> */}
          <div className="flex items-center gap-5">
            {/* <NotificationButton /> */}
            <AccountButton />
          </div>
        </div>
      )}
    </div>
  )
}
