"use client"

import {
  LayoutDashboard,
  FolderClockIcon,
  MessageSquareMore,
  Users,
  TrendingUp,
  Settings,
  Info,
  LogOut,
  MessageCircleMore,
  UserRound,
} from "lucide-react"
import useAuth from "@/store/user"
import useNavBarStore from "@/store/store"
import NavItem from "@/components/ui/navitem"
import { usePathname } from "next/navigation"
import QuickLinks from "@/components/ui/quick-links"
import { useEffect, useRef } from "react"

function getNavLinks(rolePermission) {
  const mainLinks = [
    {
      name: "Dashboard",
      path: "/mainapp/admin",
      icon: LayoutDashboard,
    },
    {
      name: "Chat",
      path: "/mainapp/chat",
      icon: MessageCircleMore,
    },
    {
      name: "Customers",
      path: "/mainapp/customers",
      icon: UserRound,
    },
    {
      name: "Feedbacks",
      path: "/mainapp/feedbacks",
      icon: MessageSquareMore,
    },
    {
      name: "Source",
      path: "/mainapp/source",
      icon: FolderClockIcon,
    },
  ]

  const otherLinks = [
    {
      name: "User Management",
      path: "/mainapp/users",
      icon: Users,
    },
    {
      name: "Settings",
      path: "/mainapp/settings",
      icon: Settings,
    },
    {
      name: "Organization",
      path: "/mainapp/organization",
      icon: TrendingUp,
    },
    {
      name: "Help",
      path: "/mainapp/help",
      icon: Info,
    },
  ]

  const quickLinks = [
    {
      name: "Privacy Policy",
      path: "/mainapp/privacy-policy",
    },
    {
      name: "Cookies Policy",
      path: "/mainapp/cookies-policy",
    },
    {
      name: "Terms of Use",
      path: "/mainapp/terms-of-use",
    },
  ]

  const filteredMainLinks = mainLinks.filter((link) => {
    return rolePermission.includes(link.path.split("/mainapp/")[1])
  })

  const filteredOtherLinks = otherLinks.filter((link) => {
    return rolePermission.includes(link.path.split("/mainapp/")[1])
  })

  return {
    main: filteredMainLinks,
    others: filteredOtherLinks,
    quickLinks,
  }
}

function Navbar() {
  const { setCollapse, setOpen, isCollapsed, showSideBar } = useNavBarStore()
  const { user_data, rolePermission } = useAuth()

  useEffect(() => {
    console.log({ rolePermission })

    const handleResize = () => {
      if (window.innerWidth <= 640) {
        setCollapse()
      } else {
        setOpen()
      }
    }

    window.addEventListener("resize", handleResize)
    handleResize()

    return () => {
      window.removeEventListener("resize", handleResize)
    }
  }, [])

  const divRef = useRef<HTMLDivElement>(null)
  const path = usePathname()
  const navLinks = getNavLinks([...rolePermission, "customers"])

  if (isCollapsed && divRef.current) {
    divRef.current.classList.add("translate-x-[-100%]")
  } else if (divRef.current) {
    divRef.current.classList.remove("translate-x-[-100%]")
  }
  return (
    <div
      ref={divRef}
      className={`absolute z-50 box-border h-screen ${showSideBar ? "w-[300px]" : "w-[100px]"} overflow-y-scroll border-r  bg-white shadow-lg transition-all  duration-150 md:relative `}
    >
      <div className=" mx-5 mb-16 flex flex-col gap-1 py-4 pt-2">
        {navLinks.main.map((nav, index) => (
          <NavItem
            key={index}
            isActive={path === nav.path}
            icon={nav.icon}
            path={nav.path}
            name={nav.name}
          />
        ))}

        <p className="py-3 font-[16px] text-[#333333]"> Others</p>

        {navLinks.others.map((nav, index) => (
          <NavItem
            key={index}
            isActive={path === nav.path}
            icon={nav.icon}
            path={nav.path}
            name={nav.name}
          />
        ))}

        <NavItem
          key={"logout"}
          isActive={false}
          icon={LogOut}
          path={"/logout"}
          name={`Logout`}
        />

        {showSideBar && (
          <QuickLinks links={navLinks.quickLinks} title={`Quick Links`} />
        )}
      </div>
    </div>
  )
}

export default Navbar
