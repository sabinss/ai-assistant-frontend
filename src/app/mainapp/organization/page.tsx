"use client"
import { useState, useEffect, useRef } from "react";
import { FiEye, FiEyeOff } from "react-icons/fi";
import { TiEdit } from "react-icons/ti";
import { IoMdReturnRight } from "react-icons/io";
import http from "@/config/http";
import useAuth from "@/store/user";

export default function Edit() {
    const { access_token, user_data } = useAuth(); // Call useAuth here
    const [organizationName, setOrganizationName] = useState("Agile move");
    const [organizationId, setOrganizationId] = useState(12);
    const [isEditable, setIsEditable] = useState(false);
    const [assistantName, setAssistantName] = useState("Assistant Name");
    const [isEditingAssistantName, setIsEditingAssistantName] = useState(false);
    const [isVisible, setIsVisible] = useState(true); // Added state for visibility
    const organizationInputRef = useRef(null);
    const assistantNameInputRef = useRef(null);

    useEffect(() => {
        if (isEditable) {
            organizationInputRef.current.focus();
        }
        fetchOrganizationData();
    }, [isEditable]);

    const fetchOrganizationData = async () => {
        try {
            const response = await http.get('/organization/',
                { headers: { Authorization: `Bearer ${access_token}` } });
            const org_data = response?.data?.org;
            console.log({ org_data })
            setOrganizationId(org_data._id);
            setAssistantName(org_data.assistant_name);
            setOrganizationName(org_data.name);
            0
        } catch (err) {
            console.error(err);
        }
    };


    const handleOrganizationNameChange = (e) => {
        setOrganizationName(e.target.value);
    };

    const handleAssistantNameChange = (e) => {
        setAssistantName(e.target.value);
    };

    const handleKeyPress = (e) => {
        if (e.key === "Enter") {
            if (isEditable) {
                handleSaveOrganizationName();
            } else if (isEditingAssistantName) {
                handleSaveAssistantName();
            }
        }
    };

    const handleEditClick = () => {
        setIsEditable(true);
    };

    const handleSaveOrganizationName = async () => {
        setIsEditable(false);
        try {
            await http.patch('/organization', { name: organizationName }, {
                headers: { Authorization: `Bearer ${access_token}` }
            });
        } catch (err) {
            console.error(err);
        }
    };

    const handleSaveAssistantName = async () => {
        setIsEditingAssistantName(false);
        try {
            await http.patch('/organization', { assistant_name: assistantName }, {
                headers: { Authorization: `Bearer ${access_token}` }
            });
        } catch (err) {
            console.error(err);
        }
    };

    const toggleVisibility = () => {
        setIsVisible((prevVisible) => !prevVisible);
    };

    return (
        <div className="w-full p-4 text-[#333333]">
            <div className="card md:w-2/5 w-full rounded-lg border p-4 bg-white">
                <div className="top flex justify-between">
                    <div className="pt-2 hidden md:block">
                        {isEditingAssistantName ? (
                            <>
                                <input
                                    ref={assistantNameInputRef}
                                    className="inline text-xl outline-none disabled:bg-inherit bg-gray-400"
                                    value={assistantName}
                                    onChange={handleAssistantNameChange}
                                    onKeyDown={handleKeyPress}
                                />
                                <IoMdReturnRight
                                    onClick={handleSaveAssistantName}
                                    className="cursor-pointer text-3xl inline pb-2"
                                />
                            </>
                        ) : (
                            <>
                                <p className="text-xl inline">{isVisible ? assistantName : '******'}</p>
                                <TiEdit
                                    onClick={() => {
                                        setIsEditingAssistantName(true);
                                        assistantNameInputRef?.current?.focus();
                                    }}
                                    className="cursor-pointer text-3xl inline pb-2"
                                />
                            </>
                        )}
                        <p className="text-[#838383]">Ai Assistant Name</p>
                    </div>
                    <div className="ml-3">
                        <p className="text-[#838383]">Organization ID</p>
                        <p className="float-right">{organizationId}</p>
                    </div>
                </div>
                <div className="down mt-4 flex justify-between">
                    <div>
                        {isEditable ? (
                            <>
                                <input
                                    className="inline text-3xl font-medium outline-none disabled:bg-inherit bg-gray-400 w-2/3"
                                    disabled={!isEditable}
                                    value={organizationName}
                                    onChange={handleOrganizationNameChange}
                                    onKeyDown={handleKeyPress}
                                    ref={organizationInputRef}
                                />
                                <IoMdReturnRight
                                    onClick={handleSaveOrganizationName}
                                    className="cursor-pointer text-3xl inline pb-2"
                                />
                            </>
                        ) : (
                            <>
                                <p className="text-3xl font-medium inline break-words">{isVisible ? organizationName : '******'}</p>
                                <TiEdit
                                    onClick={handleEditClick}
                                    className="cursor-pointer text-3xl inline pb-2"
                                />
                            </>
                        )}
                        <p className="text-[#838383]">Organization Name</p>
                    </div>
                    <div className="eye text-[#838383] flex justify-end items-end">
                        {isVisible ? (
                            <FiEyeOff size={20} onClick={toggleVisibility} className="cursor-pointer" />
                        ) : (
                            <FiEye size={20} onClick={toggleVisibility} className="cursor-pointer" />
                        )}
                    </div>
                </div>
            </div>
            <ChatProvider org_id={organizationId} />
        </div>
    );
}

const ChatProvider = ({ org_id }) => {
    const [link, setLink] = useState('Fetching link...');
    const [embedCode, setEmbedCode] = useState('Fetching embed code...');
    useEffect(() => {
        setLink(`${process?.env?.NEXT_PUBLIC_APP_FE_URL}/public_chat?org_id=${org_id}`)
        setEmbedCode(`<div dataOrg="${org_id}" id="embed-container" style="font-size: 16px;"></div>
        <script src="${process?.env?.NEXT_PUBLIC_APP_FE_URL}/embedchat.js"></script>
        `)

    }, [org_id])
    return (
        <div className="card w-full md:w-2/5  text-[#333333] rounded-lg border p-4 bg-white">
            <p className="text-xl text-bold">Public Chat Link</p>
            <textarea className="w-full p-2 bg-gray-300 rounded-md" value={link} disabled></textarea>
            <button className="p-3 border rounded-md mt-4 active:text-blue-800 active:text-xl" onClick={() => {
                navigator.clipboard.writeText(link)
            }}>
                Click to copy link
            </button>
            <textarea className="w-full p-2 bg-gray-300 rounded-md my-3" value={embedCode} disabled></textarea>
            <button className="p-3 border rounded-md mt-4 active:text-blue-800 active:text-xl" onClick={() => {
                navigator.clipboard.writeText(embedCode)
            }}>
                Click to copy EmbedCode
            </button>
        </div>
    )

}