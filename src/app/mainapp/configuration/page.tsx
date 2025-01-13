"use client"
import React, { useState, useEffect } from "react"
import { Textarea } from "@/components/ui/textarea"
import http from "@/config/http"
import useChatConfig from "@/store/useChatSetting"
import useAuth from "@/store/user"
import { ChevronUp, ChevronDown } from "lucide-react"
import { Button } from "@/components/ui/button"
import useOrgCustomer from "@/store/organization_customer"
import { toast } from "react-toastify"
import "react-toastify/dist/ReactToastify.css"

const Accordion = ({ title, children, isOpen, onToggle, savePrompts }: any) => (
  <div className="mb-4 rounded border border-gray-300">
    <div
      className="flex w-full cursor-pointer justify-between bg-gray-100 p-4 text-left font-semibold hover:bg-gray-200"
      onClick={onToggle}
    >
      {title}
      {isOpen ? <ChevronUp /> : <ChevronDown />}
    </div>
    <div
      className={`overflow-hidden transition-all duration-300 ${
        isOpen ? "max-h-96 overflow-y-auto" : "max-h-0"
      }`}
    >
      <div className="p-4">{children}</div>
      {isOpen && (
        <div className="flex justify-end p-3">
          <Button
            className="bg-[#174894] font-medium hover:bg-[#173094]"
            onClick={(e) => {
              e.stopPropagation()
              savePrompts()
            }}
          >
            Update
          </Button>
        </div>
      )}
    </div>
  </div>
)

const Configuration = () => {
  const [isLoading, setIsLoading] = useState(false)
  const { access_token } = useAuth()
  const { setOrgToken } = useOrgCustomer()
  const [activeAccordion, setActiveAccordion] = useState("Support Workflow")
  const [temperature, setTemperature] = useState(0)

  const [additionalPrompt, setAdditionalPrompt] = useState<any>({
    primary_prompt: "",
    solution_prompt: "",
    followup_prompt: "",
    upsell_prompt: "",
    survey_prompt: "",
    log_prompt: "",
    customer_outreach_prompt: "",
    data_agent_prompt: "",
    email_outreach: "",
    schema_prompt: "",
    abstract_refinement_prompt: "",
    nltosql_prompt: "",
    internal_solution_prompt: "",
  })
  const [selectedModel, setSelectedModel] = useState("")
  const [greeting, setGreeting] = useState("")
  const [prompt, setPrompt] = useState("")
  const { workflowFlag, mockData } = useChatConfig()
  const [apiKey, setApiKey] = useState("")

  useEffect(() => {
    async function fetchOrganizationData() {
      try {
        const res = await http.get("/organization/", {
          headers: { Authorization: `Bearer ${access_token}` },
        })
        const orgData = res?.data?.org
        console.log("orgData", res)
        setAdditionalPrompt({
          primary_assistant_prompt: orgData.primary_prompt || "",
          solution_prompt: orgData.solution_prompt || "",
          followup_prompt: orgData.followup_prompt || "",
          upsell_prompt: orgData.upsell_prompt || "",
          survey_prompt: orgData.survey_prompt || "",
          log_prompt: orgData.log_prompt || "",
          customer_outreach_prompt: orgData.customer_outreach_prompt || "",
          data_agent_prompt: orgData.data_agent_prompt || "",
          email_reply_prompt: orgData.email_reply_prompt || "",
          internal_solution_prompt: orgData.internal_solution_prompt,
          nltosql_prompt: orgData?.nltosql_prompt,
          schema_prompt: orgData?.schema_prompt,
          abstract_refinement_prompt: orgData?.abstract_refinement_prompt,
        })
        setPrompt(orgData?.internal_solution_prompt || "")
        setApiKey(orgData?.api || "")
        setSelectedModel(orgData?.model || "gpt 3.5 turbo")
        setGreeting(orgData?.greeting)
        setTemperature(
          orgData?.temperature !== null && orgData?.temperature !== undefined
            ? orgData?.temperature
            : 0
        )
      } catch (error) {
        console.error("Error fetching organization data", error)
      }
    }
    fetchOrganizationData()
  }, [access_token])

  const handleChangeAdditionalPrompt = (field: string) => (event: any) => {
    setAdditionalPrompt((prev) => ({
      ...prev,
      [field]: event.target.value,
    }))
  }
  const handleSubmit = async (data: any) => {
    try {
      setIsLoading(true)
      const response = await http.patch(
        "/organization",
        {
          selectedModel,
          temperature,
          apiKey,
          prompt,
          greeting,
          workflowFlag,
          mockData,
          configuration: true,
          additionalPrompt: {
            ...data,
          },
        },
        {
          headers: { Authorization: `Bearer ${access_token}` },
        }
      )
      console.log("response", response)
      toast.success("Organization data updated successfully")
    } catch (err) {
      setIsLoading(false)
      console.log("Orgnaization update error", err)
    }
  }

  const savePrompts = async (from: string) => {
    const data = {
      ...(from === "support_workflow" && {
        greeting,
        primary_assistant_prompt: additionalPrompt.primary_prompt,
        solution_prompt: additionalPrompt.solution_prompt,
        recommendation_prompt: additionalPrompt.followup_prompt,
        // log_prompt: additionalPrompt.log_prompt,
        internal_solution_prompt: additionalPrompt.internal_solution_prompt,
      }),
      ...(from === "customer_insights" && {
        data_agent_prompt: additionalPrompt.data_agent_prompt,
        nltosql_prompt: additionalPrompt.nltosql_prompt,
        schema_prompt: additionalPrompt.schema_prompt,
        abstract_refinement_prompt: additionalPrompt.abstract_refinement_prompt,
      }),
      ...(from === "email_outreach" && {
        email_reply_prompt: additionalPrompt.email_reply_prompt || "",
        customer_outreach_prompt: additionalPrompt.customer_outreach_prompt,
      }),
    }
    console.log("Saving data:", data)
    // Make API call here
    await handleSubmit(data)
  }

  return (
    <div className="mb-10">
      <Accordion
        title="Support Workflow"
        isOpen={activeAccordion === "Support Workflow"}
        onToggle={() =>
          setActiveAccordion((prev) =>
            prev === "Support Workflow" ? "" : "Support Workflow"
          )
        }
        savePrompts={() => savePrompts("support_workflow")}
      >
        <ul className="list-none pl-5">
          <li className="prompt mt-4">
            <h3 className="text-sm">Enter your Greeting</h3>
            <Textarea
              className="mt-2 border-[#CCCCCC] bg-[#F7f7f7]"
              rows={10}
              placeholder="Type your Greeting..."
              value={greeting}
              onChange={(e) => setGreeting(e.target.value)}
            />
          </li>
          <li className="prompt mt-4">
            <h3 className="text-sm">Primary Prompt</h3>
            <Textarea
              className="mt-2 border-[#CCCCCC] bg-[#F7f7f7]"
              rows={10}
              placeholder="Type your prompt here..."
              value={additionalPrompt.primary_assistant_prompt}
              onChange={handleChangeAdditionalPrompt(
                "primary_assistant_prompt"
              )}
            />
          </li>
          <li className="prompt mt-4">
            <h3 className="text-sm">Solution Prompt</h3>
            <Textarea
              className="mt-2 border-[#CCCCCC] bg-[#F7f7f7]"
              rows={10}
              placeholder="Type your prompt here..."
              value={additionalPrompt.solution_prompt}
              onChange={handleChangeAdditionalPrompt("solution_prompt")}
            />
          </li>
          <li className="prompt mt-4">
            <h3 className="text-sm">Followup Prompt</h3>
            <Textarea
              className="mt-2 border-[#CCCCCC] bg-[#F7f7f7]"
              rows={10}
              placeholder="Type your prompt here..."
              value={additionalPrompt.followup_prompt}
              onChange={handleChangeAdditionalPrompt("followup_prompt")}
            />
          </li>
          {/* <li className="prompt mt-4">
            <h3 className="text-sm">Log Prompt</h3>
            <Textarea
              className="mt-2 border-[#CCCCCC] bg-[#F7f7f7]"
              rows={10}
              placeholder="Type your prompt here..."
              value={additionalPrompt.log_prompt}
              onChange={handleChangeAdditionalPrompt("log_prompt")}
            />
          </li> */}
          <li className="prompt mt-4">
            <h3 className="text-sm">Internal Solution Prompt</h3>
            <Textarea
              className={`mt-2 border-[#CCCCCC] bg-[#F7f7f7]`}
              rows={10}
              placeholder="Type your prompt here..."
              value={additionalPrompt.internal_solution_prompt}
              onChange={(e) =>
                handleChangeAdditionalPrompt("internal_solution_prompt")
              }
            />
          </li>
        </ul>
      </Accordion>

      <Accordion
        title="Customer Insights"
        isOpen={activeAccordion === "Customer Insights"}
        onToggle={() =>
          setActiveAccordion((prev) =>
            prev === "Customer Insights" ? "" : "Customer Insights"
          )
        }
        savePrompts={() => savePrompts("customer_insights")}
      >
        <ul className="list-none pl-5">
          <li className="prompt mt-4">
            <h3 className="text-sm">Schema</h3>
            <Textarea
              className="mt-2 border-[#CCCCCC] bg-[#F7f7f7]"
              rows={10}
              placeholder="Type your prompt here..."
              value={additionalPrompt.schema_prompt}
              onChange={handleChangeAdditionalPrompt("schema_prompt")}
            />
          </li>
          <li className="prompt mt-4">
            <h3 className="text-sm">Abstract refinement prompt</h3>
            <Textarea
              className="mt-2 border-[#CCCCCC] bg-[#F7f7f7]"
              rows={10}
              placeholder="Type your prompt here..."
              value={additionalPrompt.abstract_refinement_prompt}
              onChange={handleChangeAdditionalPrompt(
                "abstract_refinement_prompt"
              )}
            />
          </li>
          <li className="prompt mt-4">
            <h3 className="text-sm">NLtoSQL Prompt</h3>
            <Textarea
              className="mt-2 border-[#CCCCCC] bg-[#F7f7f7]"
              rows={10}
              placeholder="Type your prompt here..."
              value={additionalPrompt.nltosql_prompt}
              onChange={handleChangeAdditionalPrompt("nltosql_prompt")}
            />
          </li>
        </ul>
      </Accordion>

      <Accordion
        title="Email Outreach"
        isOpen={activeAccordion === "Email Outreach"}
        onToggle={() =>
          setActiveAccordion((prev) =>
            prev === "Email Outreach" ? "" : "Email Outreach"
          )
        }
        savePrompts={() => savePrompts("email_outreach")}
      >
        <ul className="list-none pl-5">
          <li className="prompt mt-4">
            <h3 className="text-sm">Email Reply Prompt</h3>
            <Textarea
              className="mt-2 border-[#CCCCCC] bg-[#F7f7f7]"
              rows={10}
              placeholder="Type your prompt here..."
              value={additionalPrompt.email_reply_prompt}
              onChange={handleChangeAdditionalPrompt("email_reply_prompt")}
            />
          </li>
          <li className="prompt mt-4">
            <h3 className="text-sm">Customer Outreach Prompt</h3>
            <Textarea
              className="mt-2 border-[#CCCCCC] bg-[#F7f7f7]"
              rows={10}
              placeholder="Type your prompt here..."
              value={additionalPrompt.customer_outreach_prompt}
              onChange={handleChangeAdditionalPrompt(
                "customer_outreach_prompt"
              )}
            />
          </li>
        </ul>
      </Accordion>
    </div>
  )
}

export default Configuration
