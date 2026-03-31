"use client"
import { Info, Phone, Video } from "lucide-react"
import botImage from "@/assets/images/bot.png"
import Image from "next/image"
import useNavBarStore from "@/store/store"
export const TopbarIcons = [{ icon: Info }]
import { GrAdd } from "react-icons/gr"
import useAuth from "@/store/user"
import http from "@/config/http"
import { IoIosArrowDropdown } from "react-icons/io"
import { useState } from "react"

import usePublicChat from "@/store/public_chat"
import useChatConfig from "@/store/useChatSetting"
import useApiType from "@/store/apiType"
import { generateSessionIdLength5 } from "@/lib/utils"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Button } from "react-day-picker"

type ChatTopbarProps = {
  /** Prefer URL param on first paint (public embed); falls back to store. */
  visitorDisplayNameFromUrl?: string | null
}

export default function ChatTopbar({
  visitorDisplayNameFromUrl,
}: ChatTopbarProps = {}) {
  const {
    publicChat,
    publicChatHeaders,
    setPublicChatHeaders,
    publicVisitorDisplayName,
  } = usePublicChat()
  const { setSessionId, setSelectedAgentInfo, triggerNewSession } = useChatConfig()
  const { apiType, setApiType } = useApiType()
  const [selectedOption, setSelectedOption] = useState(apiType)
  const handleSelect = (option: string) => {
    setSelectedOption(option)
    setApiType(option)

    if (selectedOption !== option) {
      changeSession()
    }
  }

  const { access_token, setChatSession } = useAuth()
  const changeSession = async () => {
    triggerNewSession()
    setSessionId(null)
    setSelectedAgentInfo(null, null)
    if (publicChat) {
      const newSessionId = generateSessionIdLength5()
      localStorage.setItem("chat_session_agile_move", String(newSessionId))
      setPublicChatHeaders({ ...publicChatHeaders, chat_session: String(newSessionId) })
      setSessionId(newSessionId)
    } else {
      const newSession = generateSessionIdLength5()
      try {
        const res = await http.get(
          `user/profile/changeSession?session=${newSession}`,
          {
            headers: { Authorization: `Bearer ${access_token}` },
          }
        )
        setChatSession(res?.data?.newSession ?? String(newSession))
      } catch {
        setChatSession(String(newSession))
      }
      setSessionId(newSession)
    }
  }
  const { botName } = useNavBarStore()

  /* Visitor title is public / embed only — ignore store URL when in main app chat */
  const visitorTitle = publicChat
    ? (
      visitorDisplayNameFromUrl?.trim() ||
      publicVisitorDisplayName?.trim() ||
      ""
    ).trim()
    : ""

  return (
    <div
      className={`flex w-full flex-col rounded-md bg-muted ${publicChat ? "p-2 sm:p-2.5" : "p-3"}`}
    >
      <div
        className={`flex justify-between gap-2 ${publicChat ? "items-start" : "items-center"}`}
      >
        <div
          className={`title flex min-w-0 flex-1 ${publicChat ? "items-start" : "items-center"}`}
        >
          <Image
            src={botImage}
            className={`inline shrink-0 rounded-full ${publicChat ? "mr-2" : "mr-3"}`}
            alt=""
            height={publicChat ? 28 : 30}
            width={publicChat ? 28 : 30}
          />
          {publicChat ? (
            <div className="flex min-w-0 flex-1 flex-col gap-0.5 pr-1">
              <span className="block text-sm font-semibold leading-snug text-foreground">
                {botName?.trim() ? botName : "Gabby"}
              </span>
              {visitorTitle ? (
                <span className="block max-w-full break-words text-xs font-medium leading-snug text-muted-foreground">
                  Chatting with {visitorTitle}
                </span>
              ) : (
                <span className="block text-xs leading-snug text-muted-foreground">
                  We&apos;re here to help
                </span>
              )}
            </div>
          ) : (
            <h2 className="inline text-xl font-bold">
              Chat with {botName ? botName : "Gabby"}
            </h2>
          )}
          {/* <span className="inline text-xl font-bold">
            Chat about {publicChat && "Product Knowledge"}
          </span> */}
          {/* <div className="ml-1.5 flex pb-1">
            {!publicChat && (
              <DropdownMenu>
                <DropdownMenuTrigger>
                  <div className="flex items-center space-x-2">
                    <span className="text-xl font-bold">{selectedOption}</span>{" "}
                    {!publicChat && <IoIosArrowDropdown size={25} />}
                  </div>
                </DropdownMenuTrigger>
                <DropdownMenuContent>
                  <DropdownMenuSeparator /> */}
          {/* Selecting Product Knowledge */}
          {/* <DropdownMenuItem
                    onClick={() => handleSelect("Product Knowledge")}
                  >
                    Product Knowledge
                  </DropdownMenuItem> */}
          {/* Selecting Customer Information */}
          {/* <DropdownMenuItem
                    onClick={() => handleSelect("Customer Information")}
                  >
                    Customer Information
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            )}
          </div> */}
        </div>
        <button
          type="button"
          className={`flex shrink-0 cursor-pointer items-center gap-1.5 rounded-md border border-border bg-background/90 font-medium text-foreground shadow-sm transition-colors hover:bg-accent hover:text-accent-foreground ${publicChat ? "px-2 py-1.5 text-xs" : "gap-2 p-2 text-sm hover:text-black"
            }`}
          title="Start a new conversation"
          onClick={changeSession}
        >
          <GrAdd size={publicChat ? 16 : 20} className="shrink-0" />
          {/* {publicChat ? (
            <span>New chat</span>
          ) : (
            <span>New Session</span>
          )} */}
          <span>New Session</span>
        </button>
      </div>

      {/* <div className="flex items-center gap-4 mt-3 w-full">
                <Image src={botImage} className="rounded-full" alt="" height={30} width={30} />
                {greeting}
            </div> */}
    </div>
  )
}
