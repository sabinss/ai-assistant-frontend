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

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Button } from "react-day-picker"

export default function ChatTopbar() {
  const { publicChat, publicChatHeaders, setPublicChatHeaders } =
    usePublicChat()
  const { setSessionId } = useChatConfig()
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
    setSessionId(null)
    const newSession = Math.floor(Math.random() * 1000).toString()
    if (publicChat) {
      let newSession = Math.floor(Math.random() * 9000).toString()
      localStorage.setItem("chat_session_agile_move", newSession)
      setPublicChatHeaders({ ...publicChatHeaders, chat_session: newSession })
    } else {
      const res = await http.get(
        `user/profile/changeSession?session=${newSession}`,
        {
          headers: { Authorization: `Bearer ${access_token}` },
        }
      )
      setChatSession(res?.data?.newSession)
    }
  }
  const { botName } = useNavBarStore()

  console.log("botName", botName)
  return (
    <div className="flex  w-full flex-col rounded-md bg-muted p-3 ">
      <div className="flex items-center justify-between">
        <div className="title flex">
          <Image
            src={botImage}
            className="mr-3 inline rounded-full"
            alt=""
            height={30}
            width={30}
          />
          <h2 className="inline text-xl font-bold">
            Chat with {botName ? botName : "Gabby"}
          </h2>
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
        <div
          className=" flex cursor-pointer gap-2  rounded-md border p-2 hover:text-black"
          onClick={changeSession}
        >
          <GrAdd size={20} />
          <p>New Session</p>
        </div>
      </div>

      {/* <div className="flex items-center gap-4 mt-3 w-full">
                <Image src={botImage} className="rounded-full" alt="" height={30} width={30} />
                {greeting}
            </div> */}
    </div>
  )
}
