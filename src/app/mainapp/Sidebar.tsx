"use client"

import {
  LayoutDashboard,
  FolderClockIcon,
  MessageSquareMore,
  Users,
  TrendingUp,
  Info,
  LogOut,
  MessageCircleMore,
  UserRound,
  Settings,
  Cog,
  Bell,
} from "lucide-react"
import useAuth from "@/store/user"
import useNavBarStore from "@/store/store"
import NavItem from "@/components/ui/navitem"
import { usePathname } from "next/navigation"
import QuickLinks from "@/components/ui/quick-links"
import { useEffect, useRef, useState } from "react"
import ChatMain from "./chat/ChatMain"
import ChatTopBar from "./chat/ChatTopBar"
import usePublicChat from "@/store/public_chat"
import { generateSessionIdLength5 } from "@/lib/utils"

function getNavLinks(rolePermission: any, hideList: string[] = []) {
  const mainLinks = [
    {
      name: "Dashboard",
      path: "/mainapp/dashboard",
      icon: LayoutDashboard,
    },
    {
      name: "Notifications",
      path: "/mainapp/notification",
      icon: Bell,
    },

    // {
    //   name: "Dashboard",
    //   path: "/mainapp/admin",
    //   icon: LayoutDashboard,
    // },
    {
      name: "Chat",
      path: "/mainapp/chat",
      icon: MessageCircleMore,
    },
    // {
    //   name: "Customers",
    //   path: "/mainapp/customers",
    //   icon: UserRound,
    // },
  ]

  const otherLinks = [
    {
      name: "Feedbacks",
      path: "/mainapp/feedbacks",
      icon: MessageSquareMore,
    },
    {
      name: "Upload Documents",
      path: "/mainapp/source",
      icon: FolderClockIcon,
    },
    {
      name: "Users",
      path: "/mainapp/users",
      icon: Users,
    },
    {
      name: "Settings",
      path: "/mainapp/settings",
      icon: Settings,
    },
    {
      name: "Agent Config",
      path: "/mainapp/configuration",
      icon: Cog,
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
    // {
    //   name: "Cookies Policy",
    //   path: "/mainapp/cookies-policy",
    // },
    {
      name: "Terms",
      path: "/mainapp/terms-of-use",
    },
  ]

  const filteredMainLinks = mainLinks
    .filter((link) => {
      return rolePermission.includes(link.path.split("/mainapp/")[1])
    })
    .filter((x) => !hideList.includes(x.name))

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
  const { rolePermission, role, user_data } = useAuth()
  const { setPublicChat, setPublicChatHeaders } = usePublicChat()
  const [isHelpChatOpen, setIsHelpChatOpen] = useState(false)

  const openHelpChat = () => {
    let chatSession = localStorage.getItem("chat_session_agile_move")
    if (!chatSession) {
      chatSession = String(generateSessionIdLength5())
      localStorage.setItem("chat_session_agile_move", chatSession)
    }
    setPublicChatHeaders({
      org_id: user_data?.organization ?? "",
      chat_session: chatSession,
    })
    setPublicChat(true)
    setIsHelpChatOpen(true)
  }

  const closeHelpChat = () => {
    setIsHelpChatOpen(false)
    setPublicChat(false)
  }
  useEffect(() => {
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
  const navLinks = getNavLinks([
    ...rolePermission,
    // "customers",
    ...(role != "individual" ? ["notification", "dashboard"] : []),
    ,
  ])

  if (isCollapsed && divRef.current) {
    divRef.current.classList.add("translate-x-[-100%]")
  } else if (divRef.current) {
    divRef.current.classList.remove("translate-x-[-100%]")
  }
  return (
    <div
      ref={divRef}
      className={`absolute z-50 box-border h-full ${showSideBar ? "w-[300px]" : "w-[100px]"} overflow-y-auto border-r  bg-white shadow-lg transition-all  duration-150 md:relative `}
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
            isActive={nav.name === "Help" ? isHelpChatOpen : path === nav.path}
            icon={nav.icon}
            path={nav.path}
            name={nav.name}
            onClick={
              nav.name === "Help"
                ? (e) => {
                    e.preventDefault()
                    openHelpChat()
                  }
                : undefined
            }
          />
        ))}

        <NavItem key={"logout"} isActive={false} icon={LogOut} path={"/logout"} name={`Logout`} />

        {/* {showSideBar && (
          <QuickLinks links={navLinks.quickLinks} title={`Quick Links`} />
        )} */}
      </div>
      {isHelpChatOpen && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 p-4"
          onClick={closeHelpChat}
        >
          <div
            className="h-[85vh] w-full max-w-6xl overflow-hidden rounded-lg bg-white shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b px-4 py-3">
              <h2 className="text-lg font-semibold text-[#333333]">Help</h2>
              <button
                type="button"
                className="rounded bg-red-500 px-3 py-1 text-sm text-white hover:bg-red-600"
                onClick={closeHelpChat}
              >
                Close
              </button>
            </div>
            <div className="flex h-[calc(85vh-57px)] min-h-0 w-full flex-col overflow-hidden bg-white p-1 text-[#333333]">
              <ChatTopBar />
              <ChatMain />
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default Navbar
