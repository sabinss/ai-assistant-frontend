"use client"
import { Info, Phone, Plus, Video } from "lucide-react"
import botImage from "@/assets/images/bot.png"
import Image from "next/image"
import useNavBarStore from "@/store/store"
export const TopbarIcons = [{ icon: Info }]
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
      className={`flex w-full shrink-0 flex-col border-b border-[#E2E6EF] bg-white font-sans ${publicChat ? "px-3 py-2.5 sm:px-4" : "px-4 py-3"}`}
    >
      <div
        className={`flex justify-between gap-2 ${publicChat ? "items-start" : "items-center"}`}
      >
        <div
          className={`title flex min-w-0 flex-1 gap-2.5 ${publicChat ? "items-start" : "items-center"}`}
        >
          {!publicChat && (
            <div className="flex h-[30px] w-[30px] shrink-0 items-center justify-center rounded-full bg-[#1B3A8C]">
              <Image
                src={botImage}
                className="rounded-full"
                alt=""
                height={22}
                width={22}
              />
            </div>
          )}
          {publicChat ? (
            <div className="flex min-w-0 flex-1 flex-col gap-0.5 pr-1">
              <span className="block text-[13.5px] font-semibold leading-snug text-[#1A1F2E]">
                {botName?.trim() ? botName : "Gabby"}
              </span>
              {visitorTitle ? (
                <span className="block max-w-full break-words text-[11px] font-medium leading-snug text-[#8B91A3]">
                  Chatting with {visitorTitle}
                </span>
              ) : (
                <span className="block text-[11px] leading-snug text-[#8B91A3]">
                  We&apos;re here to help
                </span>
              )}
            </div>
          ) : (
            <div className="flex min-w-0 flex-col gap-0.5">
              <span className="text-[13.5px] font-semibold leading-snug text-[#1A1F2E]">
                Chat with {botName ? botName : "Gabby"}
              </span>
              <span className="text-[11px] leading-snug text-[#8B91A3]">We&apos;re here to help</span>
            </div>
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
          className={`flex shrink-0 cursor-pointer items-center gap-1 border-0 bg-transparent font-sans font-medium transition-opacity hover:opacity-80 ${publicChat ? "text-xs text-[#1B3A8C]" : "text-[12px] text-[#1B3A8C]"
            }`}
          title="Start a new conversation"
          onClick={changeSession}
        >
          {publicChat ? (
            <>
              <Plus className="h-3.5 w-3.5 shrink-0" strokeWidth={2.5} aria-hidden />
              <span>New Qns</span>
            </>
          ) : (
            <>
              <svg
                width="13"
                height="13"
                viewBox="0 0 24 24"
                fill="none"
                stroke="#1B3A8C"
                strokeWidth="2"
                className="shrink-0"
                aria-hidden
              >
                <line x1="12" y1="5" x2="12" y2="19" />
                <line x1="5" y1="12" x2="19" y2="12" />
              </svg>
              <span className="font-medium">New Session</span>
            </>
          )}
        </button>
      </div>

      {/* <div className="flex items-center gap-4 mt-3 w-full">
                <Image src={botImage} className="rounded-full" alt="" height={30} width={30} />
                {greeting}
            </div> */}
    </div>
  )
}
