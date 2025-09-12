"use client"
import { Textarea } from "@/components/ui/textarea"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import RangeSlider from "../commoncompnents/RangeSlider"
import Dropdown from "../commoncompnents/DropDown"
import { useState, useEffect } from "react"
import http from "@/config/http"
import { toast } from "react-toastify"
import "react-toastify/dist/ReactToastify.css"
import useAuth from "@/store/user"
import useChatConfig from "@/store/useChatSetting"
import { Eye, EyeOff } from "lucide-react"

import useOrgCustomer from "@/store/organization_customer"
export default function Page() {
  const sources = ["gpt-4o", "gpt-3.5-turbo", "gpt-4", "gpt-4-1106-preview"]
  const { access_token, user_data } = useAuth() // Call useAuth here
  const { setOrgToken, orgToken } = useOrgCustomer()
  const [organizationData, setOrganizationData] = useState<any>(null)
  const [selectedModel, setSelectedModel] = useState("")
  const [temperature, setTemperature] = useState(0)
  const [apiKey, setApiKey] = useState("")
  const [prompt, setPrompt] = useState("")
  const [greeting, setGreeting] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [updatingWorkflow, setUpdatingWorkflow] = useState(false)
  const [settingData, setSettingData] = useState<any>(null)
  const [showFields, setShowFields] = useState(false)
  const toggleShowFields = () => setShowFields((prev) => !prev)

  const [whatsappConfig, setWhatsappConfig] = useState<any>({
    whatsappPhoneNumber: null,
    whatsappToken: null,
    whatsAppPhoneNumberId: null,
  })

  const [orgSetting, setOrgSetting] = useState({
    database_name: "",
    redshit_work_space: "",
    redshift_db: "",
    zendesk_token: "",
    zendesk_user: "",
    zendesk_subdomain: "",
    hubspot_bearer_token: "",
  })

  const [supportWorkflowFlag, setSupportWorkflowFlag] = useState(false)

  const [additionalPrompt, setAdditionalPrompt] = useState<any>({
    primary_assistant_prompt: "",
    investigation_prompt: "",
    solution_prompt: "",
    recommendation_prompt: "",
    upsell_prompt: "",
    survey_prompt: "",
    log_prompt: "",
    workflow_engine_enabled: false,
  })

  // const [workflowFlag, setWorkFlow] = useState(false)
  // const [mockData, setMockData] = useState("")
  const { workflowFlag, mockData, setWorkFlowFlag, setMockData } =
    useChatConfig()
  const [errors, setErrors] = useState({
    apiKey: false,
    prompt: false,
    greeting: false,
  })

  const handleOrgSettingDb = (e: any) => {
    const { name, value } = e.target
    setOrgSetting((prev: any) => ({ ...prev, [name]: value }))
  }

  useEffect(() => {
    async function getOrgDetails() {
      try {
        setIsLoading(true)
        const res = await http.get("/organization/", {
          headers: { Authorization: `Bearer ${access_token}` },
        })
        const orgData = res?.data?.org
        setOrganizationData(orgData)
        setOrgSetting({
          database_name: orgData?.database_name ?? "",
          redshit_work_space: orgData?.redshit_work_space ?? "",
          redshift_db: orgData?.redshift_db ?? "",
          zendesk_token: orgData?.zendesk_token ?? "",
          zendesk_user: orgData?.zendesk_user ?? "",
          zendesk_subdomain: orgData?.zendesk_subdomain ?? "",
          hubspot_bearer_token: orgData?.hubspot_bearer_token ?? "",
        })
        setWhatsappConfig(orgData.whatsappConfig)
        setSelectedModel(orgData?.model || "gpt 3.5 turbo")
        setSupportWorkflowFlag(orgData?.workflow_engine_enabled)
        // setMockData(MOCK_DATA)
        setTemperature(
          orgData?.temperature !== null && orgData?.temperature !== undefined
            ? orgData?.temperature
            : 0
        )
        setApiKey(orgData?.api || "")
        setPrompt(orgData?.prompt || "")
        setGreeting(orgData?.greeting || "")
      } catch (e) {
        console.log(e)
      } finally {
        setIsLoading(false)
      }
    }

    getOrgDetails()
  }, [access_token])

  useEffect(() => {
    async function getOrgToken() {
      try {
        const res = await http.get("/generate/token", {
          headers: { Authorization: `Bearer ${access_token}` },
        })
        setOrgToken(res.data.token)
        setSettingData(res.data.settings)
      } catch (err) {}
    }
    getOrgToken()
  }, [])

  const handleChangeAdditionalPrompt = (field: any) => (event: any) => {
    setAdditionalPrompt((prev) => ({
      ...prev,
      [field]: event.target.value, // Update the specific field with the new value
    }))
  }
  const handleSubmit = async () => {
    try {
      setIsLoading(true)
      // let hasError = false
      // // Reset errors
      // setErrors({
      //   apiKey: false,
      //   prompt: false,
      //   greeting: false,
      // })

      // Validate fields
      // if (!apiKey) {
      //   setErrors(prevErrors => ({ ...prevErrors, apiKey: true }));
      //   hasError = true;
      // }
      // if (!prompt) {
      //   setErrors((prevErrors) => ({ ...prevErrors, prompt: true }))
      //   hasError = true
      // }
      // // if (!greeting) {
      // //   setErrors(prevErrors => ({ ...prevErrors, greeting: true }));
      // //   hasError = true;
      // // }

      // if (hasError) {
      //   return
      // }

      const data = {
        selectedModel,
        temperature,
        apiKey,
        configuration: "setting",
        orgDbSetting: { ...orgSetting },
        whatsappConfig,
      }
      await http.put("/organization", data, {
        headers: { Authorization: `Bearer ${access_token}` },
      })
      toast.success("Organization data updated successfully")
    } catch (e) {
      console.log("Error updating organization data", e)
    } finally {
      setIsLoading(false)
    }
  }

  const handleCheckboxChange = async (flag: boolean) => {
    try {
      if (updatingWorkflow) return
      setUpdatingWorkflow(true)

      const res = await http.put(
        "/organization/support-workflow",
        {
          org_id: organizationData._id,
          workflow_engine_enabled: flag,
        },
        {
          headers: { Authorization: `Bearer ${access_token}` },
        }
      )
      console.log("update support", res.data)
      setSupportWorkflowFlag(flag)
      toast.success("Organization support workflow updated successfully")
    } catch (err) {
      // setUpdatingWorkflow(() => false)
    } finally {
      setUpdatingWorkflow(false)
    }
  }

  return (
    <div className="relative mb-4 h-fit w-full rounded-lg border bg-white px-5 py-6 text-[#333333]">
      {isLoading && (
        <div className="absolute left-0 top-0 z-50 flex h-full w-full items-center justify-center bg-gray-200 bg-opacity-50">
          <div className="h-12 w-12 animate-spin rounded-full border-b-2 border-t-2 border-gray-900"></div>
        </div>
      )}
      <h1 className="text-2xl font-semibold">AI Product Assistant</h1>

      <div className="flex flex-col gap-4">
        <div className="gptselect mt-4 md:w-1/2 ">
          <h3 className="mb-6 font-semibold tracking-widest">
            Select GPT Model
          </h3>
          <Dropdown
            options={sources}
            value={selectedModel}
            onChange={(value) => setSelectedModel(value)}
          />
        </div>
        <div className="temperature mt-4">
          <p className="mb-4 font-semibold tracking-widest">Temperature</p>
          <RangeSlider
            defaultValue={temperature}
            onChange={(value) => setTemperature(value)}
          />
        </div>

        <div className="apikeyflex mt-4 flex-col md:w-1/2">
          <h3 className="text-sm text-primary">Your Api key</h3>
          <Input
            className={`mt-2 ${errors.apiKey ? "border-red-500" : ""}`}
            placeholder="Your Api key will be here"
            value={apiKey}
            onChange={(e) => setApiKey(e.target.value)}
          />
          {errors.apiKey && (
            <span className="text-red-500">API key cannot be empty</span>
          )}
        </div>
        <div className="apikeyflex mt-4 flex-col">
          <h3 className="text-sm text-primary">Organization Token</h3>

          <Textarea
            className={`mt-2 border-[#CCCCCC] bg-[#F7f7f7]`}
            rows={4}
            placeholder="Type your Greeting..."
            value={orgToken}
          />
        </div>

        <div className="apikeyflex mt-4 flex-col md:w-1/2">
          <h3 className="text-sm text-primary">Database Name.</h3>
          <Input
            name="database_name"
            className={`mt-2 ${errors.apiKey ? "border-red-500" : ""}`}
            placeholder="Database Name"
            value={orgSetting?.database_name}
            onChange={handleOrgSettingDb}
          />
        </div>
        <div className="apikeyflex mt-4 flex-col md:w-1/2">
          <h3 className="text-sm text-primary">Red Shift Work Group</h3>
          <Input
            name="redshit_work_space"
            className={`mt-2 ${errors.apiKey ? "border-red-500" : ""}`}
            placeholder="Redshift Work Group"
            value={orgSetting?.redshit_work_space}
            onChange={handleOrgSettingDb}
          />
        </div>
        <div className="apikeyflex mt-4 flex-col md:w-1/2">
          <h3 className="text-sm text-primary">Redshit DB</h3>
          <Input
            name="redshift_db"
            className={`mt-2 ${errors.apiKey ? "border-red-500" : ""}`}
            placeholder="REDSHIFT_DB"
            value={orgSetting?.redshift_db}
            onChange={handleOrgSettingDb}
          />
        </div>
        <div className="apikeyflex mt-4 flex-col md:w-1/2">
          <h3 className="text-sm text-primary">Zendesk Token</h3>
          <Input
            name="zendesk_token"
            className={`mt-2 ${errors.apiKey ? "border-red-500" : ""}`}
            placeholder="Zendesk Token"
            value={orgSetting?.zendesk_token}
            onChange={handleOrgSettingDb}
          />
        </div>
        <div className="apikeyflex mt-4 flex-col md:w-1/2">
          <h3 className="text-sm text-primary">Zendesk User</h3>
          <Input
            name="zendesk_user"
            className={`mt-2 ${errors.apiKey ? "border-red-500" : ""}`}
            placeholder="Zendesk User"
            value={orgSetting?.zendesk_user}
            onChange={handleOrgSettingDb}
          />
        </div>
        <div className="apikeyflex mt-4 flex-col md:w-1/2">
          <h3 className="text-sm text-primary">Zendesk Subdomain</h3>
          <Input
            name="zendesk_subdomain"
            className={`mt-2 ${errors.apiKey ? "border-red-500" : ""}`}
            placeholder="Subdomain"
            value={orgSetting?.zendesk_subdomain}
            onChange={handleOrgSettingDb}
          />
        </div>
        <div className="apikeyflex mt-4 flex-col md:w-1/2">
          <h3 className="text-sm text-primary">Hubspot Bearer Token</h3>
          <Input
            name="hubspot_bearer_token"
            className={`mt-2 ${errors.apiKey ? "border-red-500" : ""}`}
            placeholder="Bearer token"
            value={orgSetting?.hubspot_bearer_token}
            onChange={handleOrgSettingDb}
          />
        </div>
        <div className="apikeyflex mt-4 flex-col">
          <h3 className="text-sm text-primary">Organization Token</h3>

          <Textarea
            className={`mt-2 border-[#CCCCCC] bg-[#F7f7f7]`}
            rows={4}
            placeholder="Type your Greeting..."
            value={orgToken}
          />
        </div>
        {/* WhatsApp Token Section --*/}
        <div className="mt-6">
          <div className="mt-2 flex items-center">
            <label className="mr-5 text-sm font-medium text-gray-700">
              WhatsApp Token
            </label>
            <div
              className="cursor-pointer text-gray-500"
              onClick={toggleShowFields}
            >
              {showFields ? <EyeOff size={18} /> : <Eye size={18} />}
            </div>
          </div>
          <input
            type={showFields ? "text" : "password"}
            className="mt-1 w-full rounded-md border border-[#CCCCCC] bg-[#F7F7F7] p-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Enter your WhatsApp Token"
            value={whatsappConfig.whatsappToken}
            onChange={(e) =>
              setWhatsappConfig({
                ...whatsappConfig,
                whatsappToken: e.target.value,
              })
            }
          />
          <label className="mt-4 block text-sm font-medium text-gray-700">
            WhatsApp Phone Number Id
          </label>
          <input
            type={showFields ? "text" : "password"}
            className="mt-1 w-full rounded-md border border-[#CCCCCC] bg-[#F7F7F7] p-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Enter your WhatsApp Phone Number"
            value={whatsappConfig.whatsAppPhoneNumberId}
            onChange={(e) =>
              setWhatsappConfig({
                ...whatsappConfig,
                whatsAppPhoneNumberId: e.target.value,
              })
            }
          />

          <label className="mt-4 block text-sm font-medium text-gray-700">
            WhatsApp Phone Number
          </label>
          <input
            type={showFields ? "text" : "password"}
            className="mt-1 w-full rounded-md border border-[#CCCCCC] bg-[#F7F7F7] p-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Enter your WhatsApp Phone Number"
            value={whatsappConfig.whatsappPhoneNumber}
            onChange={(e) =>
              setWhatsappConfig({
                ...whatsappConfig,
                whatsappPhoneNumber: e.target.value,
              })
            }
          />
        </div>
        {/* <div className="prompt mt-4">
          <h3 className="text-sm">Enter your Greeting</h3>
          <Textarea
            className={`mt-2 border-[#CCCCCC] bg-[#F7f7f7] ${errors.greeting ? "border-red-500" : ""}`}
            rows={10}
            placeholder="Type your Greeting..."
            value={greeting}
            onChange={(e) => setGreeting(e.target.value)}
          />
          {errors.greeting && (
            <span className="text-red-500">Greeting cannot be empty</span>
          )}
        </div> */}

        {/* <div className="prompt mt-4">
          <h3 className="text-sm">Enter your prompt</h3>
          <Textarea
            className={`mt-2 border-[#CCCCCC] bg-[#F7f7f7] ${errors.prompt ? "border-red-500" : ""}`}
            rows={10}
            placeholder="Type your prompt here..."
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
          />
          {errors.prompt && (
            <span className="text-red-500">Prompt cannot be empty</span>
          )}
        </div> */}

        <div className="w-full"></div>

        {/* <div className="flex items-center space-x-2">
          <input
            id="workflow-engine"
            type="checkbox"
            disabled={updatingWorkflow}
            checked={supportWorkflowFlag}
            onChange={(event: any) =>
              handleCheckboxChange(event?.target.checked)
            }
            className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
          />
          <label
            htmlFor="workflow-engine"
            className="text-sm font-medium text-gray-900"
          >
            Use support workflow
          </label>
        </div> */}
        {/* workflowFlag */}
        {false && (
          <div>
            <div className="prompt mt-4">
              <h3 className="text-sm">Primary Agent Prompt</h3>
              <Textarea
                className={`mt-2 border-[#CCCCCC] bg-[#F7f7f7] ${errors.prompt ? "border-red-500" : ""}`}
                rows={10}
                placeholder="Type your prompt here..."
                value={additionalPrompt?.primary_assistant_prompt}
                onChange={handleChangeAdditionalPrompt(
                  "primary_assistant_prompt"
                )}
              />
              {errors.prompt && (
                <span className="text-red-500">Prompt cannot be empty</span>
              )}
            </div>
            <div className="prompt mt-4">
              <h3 className="text-sm">Investigation Prompt</h3>
              <Textarea
                className={`mt-2 border-[#CCCCCC] bg-[#F7f7f7] ${errors.prompt ? "border-red-500" : ""}`}
                rows={10}
                placeholder="Type your prompt here..."
                value={additionalPrompt.investigation_prompt}
                onChange={handleChangeAdditionalPrompt("investigation_prompt")}
              />
              {errors.prompt && (
                <span className="text-red-500">Prompt cannot be empty</span>
              )}
            </div>
            <div className="prompt mt-4">
              <h3 className="text-sm">Solution Prompt</h3>
              <Textarea
                className={`mt-2 border-[#CCCCCC] bg-[#F7f7f7] ${errors.prompt ? "border-red-500" : ""}`}
                rows={10}
                placeholder="Type your prompt here..."
                value={additionalPrompt.solution_prompt}
                onChange={handleChangeAdditionalPrompt("solution_prompt")}
              />
              {errors.prompt && (
                <span className="text-red-500">Prompt cannot be empty</span>
              )}
            </div>
            <div className="prompt mt-4">
              <h3 className="text-sm">Recommendation</h3>
              <Textarea
                className={`mt-2 border-[#CCCCCC] bg-[#F7f7f7] ${errors.prompt ? "border-red-500" : ""}`}
                rows={10}
                placeholder="Type your prompt here..."
                value={additionalPrompt.recommendation_prompt}
                onChange={handleChangeAdditionalPrompt("recommendation_prompt")}
              />
              {errors.prompt && (
                <span className="text-red-500">Prompt cannot be empty</span>
              )}
            </div>
            <div className="prompt mt-4">
              <h3 className="text-sm">Upsell Prompt</h3>
              <Textarea
                className={`mt-2 border-[#CCCCCC] bg-[#F7f7f7] ${errors.prompt ? "border-red-500" : ""}`}
                rows={10}
                placeholder="Type your prompt here..."
                value={additionalPrompt.upsell_prompt}
                onChange={handleChangeAdditionalPrompt("upsell_prompt")}
              />
              {errors.prompt && (
                <span className="text-red-500">Prompt cannot be empty</span>
              )}
            </div>
            <div className="prompt mt-4">
              <h3 className="text-sm">Survey Prompt</h3>
              <Textarea
                className={`mt-2 border-[#CCCCCC] bg-[#F7f7f7] ${errors.prompt ? "border-red-500" : ""}`}
                rows={10}
                placeholder="Type your prompt here..."
                value={additionalPrompt.survey_prompt}
                onChange={handleChangeAdditionalPrompt("survey_prompt")}
              />
              {errors.prompt && (
                <span className="text-red-500">Prompt cannot be empty</span>
              )}
            </div>
            <div className="prompt mt-4">
              <h3 className="text-sm">Log Prompt</h3>
              <Textarea
                className={`mt-2 border-[#CCCCCC] bg-[#F7f7f7] ${errors.prompt ? "border-red-500" : ""}`}
                rows={10}
                placeholder="Type your prompt here..."
                value={additionalPrompt.log_prompt}
                onChange={handleChangeAdditionalPrompt("log_prompt")}
              />
              {errors.prompt && (
                <span className="text-red-500">Prompt cannot be empty</span>
              )}
            </div>
          </div>
        )}

        <div className="buttons mt-3 w-full md:flex md:justify-end">
          <Button
            className="block w-full bg-[#174894] md:inline md:w-auto"
            onClick={handleSubmit}
          >
            Submit
          </Button>
        </div>
      </div>
    </div>
  )
}
