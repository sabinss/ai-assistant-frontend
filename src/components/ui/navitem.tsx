import useNavBarStore from "@/store/store"
import { LucideIcon } from "lucide-react"
import Link from "next/link"
import { MouseEvent } from "react"
interface NavItemProps {
  isActive: boolean
  icon: LucideIcon // Assuming LucideIcon is the type for Lucide icons
  path: string
  name: string
  onClick?: (e: MouseEvent<HTMLAnchorElement>) => void
}

export default function NavItem({
  isActive,
  name,
  icon: Icon,
  path,
  onClick,
}: NavItemProps) {
  //to collapse sidebar when menu is clicked
  const { setCollapse, showSideBar } = useNavBarStore()
  const collapseIfMobile = () => {
    if (window.innerWidth < 640) {
      setCollapse()
    }
  }

  const handleClick = (e: MouseEvent<HTMLAnchorElement>) => {
    onClick?.(e)
    collapseIfMobile()
  }
  return (
    <Link href={path} onClick={handleClick}>
      <div className=" flex w-full">
        <div
          className={`flex w-full rounded-lg px-4 py-3 hover:bg-muted ${
            isActive ? "bg-[#174894]" : ""
          }`}
        >
          <span className="mr-4">
            <Icon size={20} color={isActive ? "white" : "#535353"} />
          </span>
          {showSideBar && (
            <span
              className={`text-sm ${isActive ? "text-white" : "text-[#535353]"}`}
            >
              {name}
            </span>
          )}
        </div>
      </div>
    </Link>
  )
}
