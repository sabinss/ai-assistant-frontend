"use client"
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import React, { useEffect, useState } from 'react';
import { BiSolidBot } from "react-icons/bi";
import { IoChatboxEllipses } from "react-icons/io5";
import { HiMiniClipboardDocument } from "react-icons/hi2";
import { FaPencilAlt } from "react-icons/fa";
import { FaRegTrashAlt } from "react-icons/fa";
import http from '@/config/http';
import useAuth from '@/store/user';
const Cards = () => {
    const [data, setData] = useState({
        botName: "GPT-TrainerBot",
        botUid: "123961209387holikj12312",
        totalconvo: 1000,
        fromLastMonth: 63.7,
        processedSources: 11,
        totalSources: 11,
        lastTrained: "2023-01-01 12:00:00",
    })
    const { access_token, user_data } = useAuth()
    useEffect(() => {
        const getBotDetails = async () => {
            const res = await http.get("/organization/greeting_botname?org_id=" + user_data?.organization,
                { headers: { Authorization: `Bearer ${access_token}` } }
            )
            const data_ = res?.data
            setData(prevData => ({
                ...prevData,
                botName: data_?.assistant_name,
                botUid: data_?.org_id
            }));

        }

        const getTotalConversation = async () => {
            const res = await http.get("/conversations/count",
                {
                    headers: {
                        Authorization: `Bearer ${access_token}`,
                    },
                }
            )
            setData(prevData => ({
                ...prevData,
                totalconvo: res?.data
            }));
        }
        const getSourcesCount = async () => {
            const res = await http.getPdfList(user_data?.organization)
            const sourcesCount = res?.results?.files?.length
            setData(prevData => ({
                ...prevData,
                processedSources: sourcesCount,
                totalSources: sourcesCount
            }));

        }
        getTotalConversation()
        getBotDetails()
        getSourcesCount()
    }, [])




    return (
        <div className='flex gap-2 md:flex-row flex-col'>
            <Card className='md:w-1/3'>
                <CardHeader className='flex flex-row items-center  justify-between space-y-0 pb-2'>
                    ChatBot
                    <BiSolidBot size={28} />
                </CardHeader>
                <CardContent>
                    <p className="font-bold tracking-wide">{data.botName} </p>

                    <div className='text-gray-400  justify-between gap-2 flex'>
                        ID : {data.botUid}
                        <div className='flex'>
                            {/* <FaPencilAlt className='cursor-pointer' /> */}
                            {/* <FaRegTrashAlt className='text-red-500 ml-4 cursor-pointer' /> */}
                        </div>
                    </div>
                </CardContent>

            </Card>
            <Card className='md:w-1/3'>

                <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
                    Total Conversations
                    <IoChatboxEllipses size={28} />
                </CardHeader>
                <CardContent>
                    <p className="font-bold">{data.totalconvo} </p>
                    <p className='text-gray-400 '>
                        {/* ~{data.fromLastMonth} from last month */}
                    </p>
                </CardContent>

            </Card>
            <Card className='md:w-1/3'>
                <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
                    Sources
                    <HiMiniClipboardDocument size={28} />
                </CardHeader>
                <CardContent>
                    <div className="flex text-xl">
                        <p className="font-bold text-green-700 ">{data.processedSources} </p>/<p className="font-bold text-base pt-1">{data.totalSources} </p>

                    </div>
                    <p className='text-gray-400 '>
                        {/* Last Trained on {data.lastTrained} */}
                    </p>
                </CardContent>
            </Card>


        </div>
    );
};

export default Cards;
