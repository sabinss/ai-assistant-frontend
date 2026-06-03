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
import { toast } from "react-toastify"
import "react-toastify/dist/ReactToastify.css"

const SUBSCRIPTION_PLANS = ["Free", "Starter", "Growth", "Expansion"] as const
const INDUSTRIES = ["SaaS", "MSP", "PhotoStudio", "Staffing", "ITConsulting", "Accounting", 'Dental Clinic'] as const

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

  // Organization detail, website, subscription plan, industry
  const [organizationDetail, setOrganizationDetail] = useState("")
  const [website, setWebsite] = useState("")
  const [subscriptionPlan, setSubscriptionPlan] = useState<string>(SUBSCRIPTION_PLANS[0])
  const [industry, setIndustry] = useState<string>(INDUSTRIES[0])
  const [isUpdatingDetail, setIsUpdatingDetail] = useState(false)
  const [isLoadingDetail, setIsLoadingDetail] = useState(false)
  const [isDentalClinic, setIsDentalClinic] = useState(false)
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
      console.log("org_data", org_data)
      setOrganizationId(org_data._id)
      setAssistantName(org_data.assistant_name)
      setBotName(org_data.assistant_name)
      setOrganizationName(org_data.name)

      if (org_data.industry == "Dental Clinic") {
        setIsDentalClinic(true)
      }
    } catch (err) {
      console.error(err)
    }
  }

  useEffect(() => {
    if (!organizationId || !access_token) return
    const fetchOrganizationDetail = async () => {
      setIsLoadingDetail(true)
      try {
        const response = await http.get(`/organization/${organizationId}/detail`, {
          headers: { Authorization: `Bearer ${access_token}` },
        })
        const data = response?.data?.data ?? response?.data
        if (!data) return
        if (data.organizationDetail != null) setOrganizationDetail(data.organizationDetail)
        else if (data.organization_detail != null) setOrganizationDetail(data.organization_detail)
        if (data.website != null) setWebsite(data.website)
        if (data.subscriptionPlan != null && SUBSCRIPTION_PLANS.includes(data.subscriptionPlan))
          setSubscriptionPlan(data.subscriptionPlan)
        else if (data.subscription_plan != null && SUBSCRIPTION_PLANS.includes(data.subscription_plan))
          setSubscriptionPlan(data.subscription_plan)
        if (data.industry != null && INDUSTRIES.includes(data.industry))
          setIndustry(data.industry)
      } catch (err) {
        console.error(err)
      } finally {
        setIsLoadingDetail(false)
      }
    }
    fetchOrganizationDetail()
  }, [organizationId, access_token])

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
      await http.put(
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
      await http.put(
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

  const handleUpdateOrganizationDetail = async () => {
    setIsUpdatingDetail(true)
    try {
      await http.post(
        `/organization/${organizationId}/detail`,
        {
          organizationDetail,
          website,
          subscriptionPlan,
          industry,
        },
        { headers: { Authorization: `Bearer ${access_token}` } }
      )
      toast.success("Organization details updated successfully")
    } catch (err: any) {
      toast.error(err?.response?.data?.message ?? "Failed to update organization details")
    } finally {
      setIsUpdatingDetail(false)
    }
  }

  return (
    <div className="w-full p-4 text-[#333333]">
      <div className="card w-full rounded-lg border bg-white p-4 md:w-full">
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
      <div className="card mt-4 w-full rounded-lg border bg-white p-4 md:w-full">
        <p className="mb-3 text-lg font-medium text-[#333333]">Organization Details</p>
        {isLoadingDetail ? (
          <div className="flex flex-col items-center justify-center gap-4 py-8">
            <div
              className="h-10 w-10 animate-spin rounded-full border-2 border-[#174894] border-t-transparent"
              aria-hidden
            />
            <p className="text-sm text-[#838383]">Loading organization details...</p>
            <div className="w-full space-y-3">
              <div className="h-16 animate-pulse rounded-md bg-gray-200" />
              <div className="h-10 animate-pulse rounded-md bg-gray-200" />
              <div className="h-10 animate-pulse rounded-md bg-gray-200" />
              <div className="h-10 animate-pulse rounded-md bg-gray-200" />
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <div>
              <label className="mb-1 block text-sm text-[#838383]">Organization Detail</label>
              <textarea
                className="w-full rounded-md border border-gray-300 bg-gray-50 p-2 text-[#333333] outline-none focus:border-[#174894] focus:ring-1 focus:ring-[#174894]"
                rows={6}
                placeholder="Enter organization details..."
                value={organizationDetail}
                onChange={(e) => setOrganizationDetail(e.target.value)}
              />
            </div>
            <div>
              <label className="mb-1 block text-sm text-[#838383]">Website</label>
              <input
                type="text"
                className="w-full rounded-md border border-gray-300 bg-gray-50 p-2 text-[#333333] outline-none focus:border-[#174894] focus:ring-1 focus:ring-[#174894]"
                placeholder="https://example.com"
                value={website}
                onChange={(e) => setWebsite(e.target.value)}
              />
            </div>
            <div>
              <label className="mb-1 block text-sm text-[#838383]">Subscription Plan</label>
              <select
                className="w-full rounded-md border border-gray-300 bg-gray-50 p-2 text-[#333333] outline-none focus:border-[#174894] focus:ring-1 focus:ring-[#174894]"
                value={subscriptionPlan}
                onChange={(e) => setSubscriptionPlan(e.target.value)}
              >
                {SUBSCRIPTION_PLANS.map((plan) => (
                  <option key={plan} value={plan}>
                    {plan}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="mb-1 block text-sm text-[#838383]">Industry</label>
              <select
                className="w-full rounded-md border border-gray-300 bg-gray-50 p-2 text-[#333333] outline-none focus:border-[#174894] focus:ring-1 focus:ring-[#174894]"
                value={isDentalClinic ? "Dental Clinic" : industry}
                disabled={isDentalClinic}
                onChange={(e) => setIndustry(e.target.value)}
              >
                {INDUSTRIES.map((ind) => (
                  <option key={ind} value={ind}>
                    {ind}
                  </option>
                ))}
              </select>
            </div>
            <button
              type="button"
              disabled={isUpdatingDetail}
              className="rounded-md bg-[#174894] px-4 py-2 font-medium text-white hover:bg-[#173094] disabled:opacity-60"
              onClick={handleUpdateOrganizationDetail}
            >
              {isUpdatingDetail ? "Updating..." : "Update"}
            </button>
          </div>
        )}
      </div>
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
    <div className="card w-full rounded-lg  border bg-white p-4 text-[#333333] md:w-full mt-4">
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
