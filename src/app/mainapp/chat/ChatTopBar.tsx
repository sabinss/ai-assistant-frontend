"use client"
import { Info, Phone, Video } from 'lucide-react';
import botImage from "@/assets/images/bot.png"
import Image from "next/image";
import useNavBarStore from "@/store/store";
export const TopbarIcons = [{ icon: Info }];
import { GrAdd } from "react-icons/gr";
import useAuth from "@/store/user";
import http from "@/config/http";

import usePublicChat from "@/store/public_chat";

export default function ChatTopbar() {
    const { publicChat, publicChatHeaders, setPublicChatHeaders } = usePublicChat();
    console.log({ publicChat })
    const { access_token, setChatSession } = useAuth();
    const changeSession = async () => {
        const newSession = Math.floor(Math.random() * 1000).toString();
        if (publicChat) {
            let newSession = Math.floor(Math.random() * 9000).toString()
            localStorage.setItem("chat_session_agile_move", newSession)
            setPublicChatHeaders({ ...publicChatHeaders, chat_session: newSession })
        }
        else {
            const res = await http.get(`user/profile/changeSession?session=${newSession}`, {
                headers: { Authorization: `Bearer ${access_token}` },
            })
            setChatSession(res?.data?.newSession)
        }
    }
    const { botName } = useNavBarStore()
    return (
        <div className="p-3  w-full bg-muted rounded-md flex flex-col ">
            <div className='flex justify-between items-center'>
                <div className="title">
                    <Image src={botImage} className="rounded-full mr-3 inline" alt="" height={30} width={30} />
                    <h2 className="font-bold text-xl inline">Chat with {botName}</h2>
                </div>
                <div className=" flex cursor-pointer p-2  gap-2 border rounded-md hover:text-black"
                    onClick={changeSession}
                >
                    <GrAdd size={20} />
                    <p >New Session</p>
                </div>
            </div>

            {/* <div className="flex items-center gap-4 mt-3 w-full">
                <Image src={botImage} className="rounded-full" alt="" height={30} width={30} />
                {greeting}
            </div> */}
        </div>
    )
}
