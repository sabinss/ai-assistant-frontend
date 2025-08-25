"use client"
import { useState, useEffect, useRef } from "react"
import { FiEye, FiEyeOff } from "react-icons/fi"
import { TiEdit } from "react-icons/ti"
import { IoMdReturnRight } from "react-icons/io"
import http from "@/config/http"
import useAuth from "@/store/user"
import { getGoogleOAuthURL } from "@/utility/getGoogleUrl"
import GmailLoginButton from "@/components/ui/googleLoginButton"
import useNavBarStore from "@/store/store"

export default function Edit() {
  const { access_token, user_data } = useAuth() // Call useAuth here
  const [organizationName, setOrganizationName] = useState("Agile move")
  const [organizationId, setOrganizationId] = useState<any>(null)
  const [isEditable, setIsEditable] = useState(false)
  const [assistantName, setAssistantName] = useState("Assistant Name")
  const [isEditingAssistantName, setIsEditingAssistantName] = useState(false)
  const [isVisible, setIsVisible] = useState(true) // Added state for visibility
  const organizationInputRef = useRef(null)
  const assistantNameInputRef = useRef(null)
  const { setBotName } = useNavBarStore()

  useEffect(() => {
    if (isEditable) {
      organizationInputRef.current.focus()
    }
    fetchOrganizationData()
  }, [isEditable])

  const fetchOrganizationData = async () => {
    try {
      const response = await http.get("/organization/", {
        headers: { Authorization: `Bearer ${access_token}` },
      })
      const org_data = response?.data?.org
      setOrganizationId(org_data._id)
      setAssistantName(org_data.assistant_name)
      setBotName(org_data.assistant_name)
      setOrganizationName(org_data.name)
      0
    } catch (err) {
      console.error(err)
    }
  }

  const handleOrganizationNameChange = (e) => {
    setOrganizationName(e.target.value)
  }

  const handleAssistantNameChange = (e) => {
    setAssistantName(e.target.value)
  }

  const handleKeyPress = (e) => {
    if (e.key === "Enter") {
      if (isEditable) {
        handleSaveOrganizationName()
      } else if (isEditingAssistantName) {
        handleSaveAssistantName()
      }
    }
  }

  const handleEditClick = () => {
    setIsEditable(true)
  }

  const handleSaveOrganizationName = async () => {
    setIsEditable(false)
    try {
      await http.patch(
        "/organization",
        { name: organizationName, singleUpdate: true },
        {
          headers: { Authorization: `Bearer ${access_token}` },
        }
      )
    } catch (err) {
      console.error(err)
    }
  }

  const handleSaveAssistantName = async () => {
    setIsEditingAssistantName(false)
    try {
      await http.patch(
        "/organization",
        { assistant_name: assistantName, singleUpdate: true },
        {
          headers: { Authorization: `Bearer ${access_token}` },
        }
      )
    } catch (err) {
      console.error(err)
    }
  }

  const toggleVisibility = () => {
    setIsVisible((prevVisible) => !prevVisible)
  }

  return (
    <div className="w-full p-4 text-[#333333]">
      <div className="card w-full rounded-lg border bg-white p-4 md:w-2/5">
        <div className="top flex justify-between">
          <div className="hidden pt-2 md:block">
            {isEditingAssistantName ? (
              <>
                <input
                  ref={assistantNameInputRef}
                  className="inline bg-gray-400 text-xl outline-none disabled:bg-inherit"
                  value={assistantName}
                  onChange={handleAssistantNameChange}
                  onKeyDown={handleKeyPress}
                />
                <IoMdReturnRight
                  onClick={handleSaveAssistantName}
                  className="inline cursor-pointer pb-2 text-3xl"
                />
              </>
            ) : (
              <>
                <p className="inline text-xl">
                  {isVisible ? assistantName ?? "Gabby" : "******"}
                </p>
                <TiEdit
                  onClick={() => {
                    setIsEditingAssistantName(true)
                    assistantNameInputRef?.current?.focus()
                  }}
                  className="inline cursor-pointer pb-2 text-3xl"
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
                  className="inline w-2/3 bg-gray-400 text-3xl font-medium outline-none disabled:bg-inherit"
                  disabled={!isEditable}
                  value={organizationName}
                  onChange={handleOrganizationNameChange}
                  onKeyDown={handleKeyPress}
                  ref={organizationInputRef}
                />
                <IoMdReturnRight
                  onClick={handleSaveOrganizationName}
                  className="inline cursor-pointer pb-2 text-3xl"
                />
              </>
            ) : (
              <>
                <p className="inline break-words text-3xl font-medium">
                  {isVisible ? organizationName : "******"}
                </p>
                <TiEdit
                  onClick={handleEditClick}
                  className="inline cursor-pointer pb-2 text-3xl"
                />
              </>
            )}
            <p className="text-[#838383]">Organization Name</p>
          </div>
          <div className="eye flex items-end justify-end text-[#838383]">
            {isVisible ? (
              <FiEyeOff
                size={20}
                onClick={toggleVisibility}
                className="cursor-pointer"
              />
            ) : (
              <FiEye
                size={20}
                onClick={toggleVisibility}
                className="cursor-pointer"
              />
            )}
          </div>
        </div>
      </div>
      <ChatProvider org_id={organizationId} />
    </div>
  )
}

const ChatProvider = ({ org_id }) => {
  const [link, setLink] = useState("Fetching link...")
  const [embedCode, setEmbedCode] = useState("Fetching embed code...")
  const { access_token, user_data } = useAuth() // Call useAuth here
  const [isGoogleLogin, setGoogleLogin] = useState(false)
  const [checkingGoogleUser, setCheckingGoogleUser] = useState(false)
  useEffect(() => {
    setLink(
      `${process?.env?.NEXT_PUBLIC_APP_FE_URL}/public_chat?org_id=${org_id}`
    )
    setEmbedCode(`<div dataOrg="${org_id}" id="embed-container" style="font-size: 16px;"></div>
        <script src="${process?.env?.NEXT_PUBLIC_APP_FE_URL}/embedchat.js"></script>
        `)
  }, [org_id])

  useEffect(() => {
    checkGoogleLoggedInUser()
  }, [])

  const checkGoogleLoggedInUser = async () => {
    try {
      setCheckingGoogleUser(true)
      if (user_data?.email) {
        const res = await http.post(
          "/auth/google-login-verify",
          { email: user_data.email },
          {
            headers: { Authorization: `Bearer ${access_token}` },
          }
        )
        console.log("res", res.data)
        if (res?.data?.success) {
          setGoogleLogin(true)
        }
        setCheckingGoogleUser(false)
      }
    } catch (err) {
      console.log(err)
      setCheckingGoogleUser(false)
    }
  }

  return (
    <div className="card w-full rounded-lg  border bg-white p-4 text-[#333333] md:w-2/5">
      <p className="text-bold text-xl">Public Chat Link</p>
      <textarea
        className="w-full rounded-md bg-gray-300 p-2"
        value={link}
        disabled
      ></textarea>
      <button
        className="mt-4 rounded-md border p-3 active:text-xl active:text-blue-800"
        onClick={() => {
          navigator.clipboard.writeText(link)
        }}
      >
        Click to copy link
      </button>
      <textarea
        className="my-3 w-full rounded-md bg-gray-300 p-2"
        value={embedCode}
        disabled
      ></textarea>

      <div className="mt-4 flex items-center gap-4">
        <button
          className=" rounded-md border p-3 active:text-xl active:text-blue-800"
          onClick={() => {
            navigator.clipboard.writeText(embedCode)
          }}
        >
          Click to copy EmbedCode
        </button>
        {/* <GmailLoginButton
          disabled={checkingGoogleUser}
          isLoggedIn={isGoogleLogin}
          onClick={() => {
            const url = getGoogleOAuthURL()
            console.log("url", url)
            window.location.href = url
          }}
        /> */}
      </div>
    </div>
  )
}
