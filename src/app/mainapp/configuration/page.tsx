"use client"
import React, { useState, useEffect } from "react"
import { Textarea } from "@/components/ui/textarea"
import useChatConfig from "@/store/useChatSetting"
import useOrgCustomer from "@/store/organization_customer"
import useAuth from "@/store/user"
import { Button } from "react-day-picker"
import http from "@/config/http"
import { toast } from "react-toastify"
import "react-toastify/dist/ReactToastify.css"
import { TaskAgentTable } from "./TaskAgentTable"
import { AgentTable } from "./AgentTable"
import { SampleQuerySetup } from "./SampleQuerySetup"
const TABS = [
  { key: "support_workflow", label: "Support Workflow" },
  { key: "customer_insights", label: "Customer Insights" },
  { key: "email_rply", label: "Email Reply" },
  { key: "task_agent", label: "Task Agent" },
  { key: "agent", label: "Agent" },
  { key: "sample_query", label: "Sample Query" },
]

export const Configuration = () => {
  const [selectedModel, setSelectedModel] = useState("")
  const [greeting, setGreeting] = useState("")
  const [prompt, setPrompt] = useState("")
  const { workflowFlag, mockData } = useChatConfig()
  const [apiKey, setApiKey] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const { access_token } = useAuth()
  const [temperature, setTemperature] = useState(0)
  const [activeTab, setActiveTab] = useState("support_workflow")
  const [organization_id, setOrganizationId] = useState(null)
  const [orgTaskAgents, setOrgTaskAgents] = useState<any>([])
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
    outreach_email_generation_prompt: "",
    outreach_customer_list_generation_prompt: "",
  })
  useEffect(() => {
    async function fetchOrganizationData() {
      try {
        const res = await http.get("/organization/", {
          headers: { Authorization: `Bearer ${access_token}` },
        })
        const orgData = res?.data?.org
        setOrganizationId(orgData._id)
        setAdditionalPrompt({
          primary_prompt: orgData.primary_prompt || "",
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
          outreach_email_generation_prompt:
            orgData.outreach_email_generation_prompt,
          outreach_customer_list_generation_prompt:
            orgData.outreach_customer_list_generation_prompt,
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

  useEffect(() => {
    if (organization_id) {
      fetchOrganizationTaskAgents(organization_id)
    }
  }, [organization_id])
  const fetchOrganizationTaskAgents = async (organization_id) => {
    try {
      setIsLoading(true)
      const res = await http.get(
        `/organization/${organization_id}/task_agent`,
        {
          headers: { Authorization: `Bearer ${access_token}` },
        }
      )
      setOrgTaskAgents(res?.data?.taskAgents)
      setIsLoading(false)
    } catch (err) {
      setIsLoading(false)
      console.log("Error fetching organization task agents", err)
    }
  }
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
      ...(from === "email_rply" && {
        email_reply_prompt: additionalPrompt.email_reply_prompt || "",
        // outreach_email_generation_prompt:
        //   additionalPrompt.outreach_email_generation_prompt,
        // outreach_customer_list_generation_prompt:
        //   additionalPrompt.outreach_customer_list_generation_prompt,
      }),
    }
    // Make API call here
    await handleSubmit(data)
  }

  const saveOrUpdateTaskAgent = async (data: any) => {
    try {
      let toasMsg = "sfdsf"
      if (data?._id) {
        const res = await http.put(
          `/organization/${organization_id}/task_agent/${data?._id}`,
          data,
          {
            headers: { Authorization: `Bearer ${access_token}` },
          }
        )
        setOrgTaskAgents((prev: any) =>
          prev.map((agent: any) =>
            agent._id === data._id ? { ...agent, ...res.data } : agent
          )
        )
        toasMsg = "Task Agent updated successfully"
      } else {
        const res = await http.post(
          `/organization/${organization_id}/task_agent`,
          data,
          {
            headers: { Authorization: `Bearer ${access_token}` },
          }
        )
        // Add the new task agent to the orgTaskAgents list
        setOrgTaskAgents((prev: any) => [res.data, ...prev])
        toasMsg = "Task Agent created successfully"
      }
      setActiveTab("task_agent")
      toast.success(toasMsg)
    } catch (err) {
      console.log("Failed saveOrUpdateTaskAgent", err)
      toast.error(err?.response?.data?.message ?? "Something went wrong")
    }
  }

  return (
    <div className="mb-10">
      <div className="flex">
        {TABS.map((tab) => {
          return (
            <button
              onClick={() => setActiveTab(tab.key)}
              key={tab.key}
              className={`px-4 py-2 text-sm font-medium ${
                activeTab === tab.key
                  ? "border-b-2 border-blue-600 "
                  : "text-gray-600 hover:text-blue-600"
              }`}
            >
              {tab.label}
            </button>
          )
        })}
      </div>

      {/* Tab Content */}
      <div className="mt-4">
        {activeTab === "support_workflow" && (
          <>
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
                  value={additionalPrompt.primary_prompt}
                  onChange={handleChangeAdditionalPrompt("primary_prompt")}
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

              <li className="prompt mt-4">
                <h3 className="text-sm">Internal Solution Prompt</h3>
                <Textarea
                  className={`mt-2 border-[#CCCCCC] bg-[#F7f7f7]`}
                  rows={10}
                  placeholder="Type your prompt here..."
                  value={additionalPrompt.internal_solution_prompt}
                  onChange={handleChangeAdditionalPrompt(
                    "internal_solution_prompt"
                  )}
                />
              </li>
            </ul>
            <div className="flex justify-end p-3">
              <button
                onClick={() => savePrompts("support_workflow")}
                className="rounded-lg bg-gradient-to-r from-blue-700 to-blue-500 px-6 py-2 font-semibold text-white shadow-md transition-all duration-300 hover:from-blue-800 hover:to-blue-600"
              >
                Update
              </button>
            </div>
          </>
        )}
        {activeTab === "customer_insights" && (
          <>
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
              <div className="flex justify-end p-3">
                <button
                  onClick={() => savePrompts("customer_insights")}
                  className="rounded-lg bg-gradient-to-r from-blue-700 to-blue-500 px-6 py-2 font-semibold text-white shadow-md transition-all duration-300 hover:from-blue-800 hover:to-blue-600"
                >
                  Update
                </button>
              </div>
            </ul>
          </>
        )}

        {activeTab === "email_rply" && (
          <>
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
              <div className="flex justify-end p-3">
                <button
                  onClick={() => savePrompts("email_rply")}
                  className="rounded-lg bg-gradient-to-r from-blue-700 to-blue-500 px-6 py-2 font-semibold text-white shadow-md transition-all duration-300 hover:from-blue-800 hover:to-blue-600"
                >
                  Update
                </button>
              </div>
            </ul>
          </>
        )}
        {activeTab === "task_agent" && !isLoading && (
          <TaskAgentTable
            orgTaskAgents={orgTaskAgents}
            handleTaskAgent={saveOrUpdateTaskAgent}
          />
        )}
        {activeTab === "agent" && <AgentTable />}
        {activeTab === "sample_query" && <SampleQuerySetup />}
      </div>
    </div>
  )
}

export default Configuration
