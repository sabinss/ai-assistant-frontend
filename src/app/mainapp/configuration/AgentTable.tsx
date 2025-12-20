"use client"
import React, { useEffect, useState } from "react"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { FaEdit, FaPlus, FaPlusCircle, FaPlay } from "react-icons/fa"
import { FaRegSave } from "react-icons/fa"
import { MdDelete, MdOutlineCancel } from "react-icons/md"
import http from "@/config/http"
import useAuth from "@/store/user"
import { toast } from "react-toastify"
import "react-toastify/dist/ReactToastify.css"
import { ImSpinner2 } from "react-icons/im" // Import spinner icon

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { ToolsMultiSelect } from "@/components/ui/tools-multi-select"
const tableHeader = [
  { name: "Name", sortable: false },
  { name: "Objective", sortable: false },
  { name: "Actions", sortable: false },
]

export const AgentTable = () => {
  const [agentList, setAgentList] = useState<any>([])
  const [isEditing, setIsEditing] = useState(false)
  const { access_token, role } = useAuth() // Call useAuth here
  const isIndividual = role === "individual"
  const [isAgent, setIsAgent] = useState(false)
  const [frequency, setFrequency] = useState("")
  const [dayTime, setDayTime] = useState("")
  // Add state for confirmation dialog
  const [showConfirmDialog, setShowConfirmDialog] = useState(false)
  const [selectedAgent, setSelectedAgent] = useState<any>(null)

  useEffect(() => {
    async function getOrgAgentList() {
      await fetchOrgAgentInstructions()
    }
    getOrgAgentList()
  }, [])
  const [formData, setFormData] = useState<any>({
    name: "",
    routing_instruction: "Draft Email",
    greeting: "",
    routing_examples: true,
    objective: "",
    tools_used: [] as string[], // Array to store selected tools
    primary_instruction: "",
    frequency: null,
    dayTime: null,
    scheduleTime: null, // Add time field for scheduling
    timezone: "EST", // Add timezone field with EST as default
    isAgent: null,
    tasks: [], // Array to store instructions dynamically
    active: false,
    batch_process_enabled: false,
    batch_size: null,
    batch_scope: "",
  })
  const [isAddNew, setAddNew] = useState(false)
  const [isAgentLoading, setAgentLoading] = useState(false)
  const addInstruction = () => {
    setFormData((prev: any) => ({
      ...prev,
      tasks: [...(prev.tasks || []), { _id: Date.now(), instruction: "", tools: "", name: "" }],
    }))
  }
  const getDayTimeOptions = () => {
    switch (formData.frequency) {
      case "Daily":
        return [
          { value: "1", label: "Monday" },
          { value: "2", label: "Tuesday" },
          { value: "3", label: "Wednesday" },
          { value: "4", label: "Thursday" },
          { value: "5", label: "Friday" },
          { value: "6", label: "Saturday" },
          { value: "7", label: "Sunday" },
        ]
      case "Weekly":
        return [
          { value: "1", label: "Monday" },
          { value: "2", label: "Tuesday" },
          { value: "3", label: "Wednesday" },
          { value: "4", label: "Thursday" },
          { value: "5", label: "Friday" },
          { value: "6", label: "Saturday" },
          { value: "7", label: "Sunday" },
        ]
      case "Monthly":
        return Array.from({ length: 31 }, (_, i) => ({
          value: `${i + 1}`,
          label: `${i + 1}`,
        }))
      case "Quarterly":
        return [
          { value: "1", label: "Q1 (Jan-Mar)" },
          { value: "2", label: "Q2 (Apr-Jun)" },
          { value: "3", label: "Q3 (Jul-Sep)" },
          { value: "4", label: "Q4 (Oct-Dec)" },
        ]
      default:
        return []
    }
  }

  const getTimezoneOptions = () => {
    return [
      { value: "EST", label: "Eastern Standard Time (EST)" },
      { value: "PST", label: "Pacific Standard Time (PST)" },
      { value: "CST", label: "Central Standard Time (CST)" },
      { value: "MST", label: "Mountain Standard Time (MST)" },
      { value: "UTC", label: "Coordinated Universal Time (UTC)" },
      { value: "GMT", label: "Greenwich Mean Time (GMT)" },
      { value: "CET", label: "Central European Time (CET)" },
      { value: "JST", label: "Japan Standard Time (JST)" },
      { value: "AEST", label: "Australian Eastern Standard Time (AEST)" },
      { value: "IST", label: "India Standard Time (IST)" },
    ]
  }

  const removeInstruction = (id: number) => {
    setFormData((prev: any) => ({
      ...prev,
      tasks: prev.tasks.filter((item) => item._id != id),
    }))
  }

  const updateInstruction = (id: number, field: any, value: any) => {
    setFormData((prev: any) => ({
      ...prev,
      tasks: prev.tasks.map((item) => (item._id === id ? { ...item, [field]: value } : item)),
    }))
  }

  const handleAddNew = () => {
    setAddNew(true)
    setFormData({
      id: null,
      name: "",
      objective: "",
      tools_used: [],
      dayTime,
      frequency,
      scheduleTime: null,
      timezone: "EST", // Set default timezone
      isAgent,
    })
    setIsEditing(true)
  }

  const handleEdit = (agent: any) => {
    setAddNew(false)
    // Handle tools_used - convert from string to array if needed for backwards compatibility
    // If tools_used is not found (undefined/null) or is "NA", default to empty array
    let toolsUsed: string[] = []
    if (agent.tools_used != null && agent.tools_used !== "NA") {
      if (Array.isArray(agent.tools_used)) {
        toolsUsed = agent.tools_used.filter((t: string) => t !== "NA")
      } else if (typeof agent.tools_used === "string" && agent.tools_used) {
        toolsUsed = agent.tools_used
          .split(",")
          .map((t: string) => t.trim())
          .filter((t: string) => t && t !== "NA")
      }
    }

    setFormData({
      ...agent,
      active: agent.active,
      tools_used: toolsUsed,
      scheduleTime: agent.schedule_time || agent.scheduleTime || null,
      timezone: agent.time_zone || agent.timezone || "EST", // Default to EST if not set
    })
    setIsEditing(true)
  }

  const handleDelete = async (agent: any) => {
    try {
      console.log("Delete agent", agent)
      await http.delete(`/organization/agent/${agent._id}/instruction`, {
        headers: { Authorization: `Bearer ${access_token}` },
      })
      await fetchOrgAgentInstructions()
      toast.success("Agent deleted successfully")
    } catch (err: any) {
      toast.error(err?.message || "Failed to delete Agent")
    }
  }

  const fetchOrgAgentInstructions = async () => {
    try {
      const response = await http.get("/organization/agent/instruction", {
        headers: { Authorization: `Bearer ${access_token}` },
      })
      console.log("Agent List", response?.data?.data)
      setAgentList(response?.data?.data)
    } catch (err: any) {
      toast.error(err?.message || "Failed to fetch Agent")
    }
  }

  console.log("formData--,formData", formData)

  const handleSave = async () => {
    setAgentLoading(true)
    let data = { ...formData }

    // Convert tools_used array to comma-separated string for API
    const toolsUsedString = Array.isArray(data.tools_used)
      ? data.tools_used.join(",")
      : data.tools_used || ""

    // Ensure timezone and scheduleTime are included in payload
    console.log("Saving agent with data:", {
      ...data,
      tools_used: toolsUsedString,
      time_zone: data.timezone || "EST",
      schedule_time: data.scheduleTime || null,
    })

    try {
      if (data._id) {
        // Ensure timezone and scheduleTime are explicitly included
        const updateData = {
          ...data,
          tools_used: toolsUsedString,
          time_zone: data.timezone || "EST",
          schedule_time: data.scheduleTime || null,
        }
        await http.put("/organization/agent", updateData, {
          headers: { Authorization: `Bearer ${access_token}` },
        })
        // Update the agent list without re-fetching from API
        setAgentList((prevList: any) =>
          prevList.map((agent: any) =>
            agent._id === data._id ? { ...agent, ...data, tools_used: toolsUsedString } : agent
          )
        )
        setAgentLoading(false)
        setIsEditing(false)
        toast.success("Agent updated successfully")
        await fetchOrgAgentInstructions()
      } else {
        // Ensure timezone and scheduleTime are explicitly included for new agents
        const createData = {
          ...data,
          tools_used: toolsUsedString,
          time_zone: data.timezone || "EST",
          schedule_time: data.scheduleTime || null,
        }
        const response = await http.post("/organization/agent", createData, {
          headers: { Authorization: `Bearer ${access_token}` },
        })
        await fetchOrgAgentInstructions()
        // setAgentList((prevList: any) => [...prevList, response.data.agent])

        setAgentLoading(false)
        setIsEditing(false)
        toast.success("Agent created successfully")
      }
    } catch (err: any) {
      setAgentLoading(false)
      toast.error(err?.message || "Failed to save Agent")
    }
  }

  const handleCancel = () => {
    setIsEditing(false)
  }

  const handleStartAgent = async (agent: any) => {
    // Show custom confirmation dialog
    setSelectedAgent(agent)
    setShowConfirmDialog(true)
  }
  const cancelStartAgent = () => {
    setShowConfirmDialog(false)
    setSelectedAgent(null)
  }
  const confirmStartAgent = async () => {
    if (!selectedAgent) return

    try {
      console.log("Starting agent:", selectedAgent)
      toast.success(`Starting agent: ${selectedAgent.name}`)
      await http.get(
        `/organization/agent/${selectedAgent._id}/start?agent_name=${selectedAgent.name}&org_id=${selectedAgent.organization}`,
        {
          headers: { Authorization: `Bearer ${access_token}` },
        }
      )
      toast.success(`Agent "${selectedAgent.name}" started successfully!`)
    } catch (err: any) {
      toast.error(err?.message || "Failed to start agent")
    } finally {
      setShowConfirmDialog(false)
      setSelectedAgent(null)
    }
  }
  return (
    <div className="relative mb-10 w-full overflow-y-auto rounded-md bg-white p-4 text-[#333333]">
      <Dialog open={showConfirmDialog} onOpenChange={setShowConfirmDialog}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Confirm Agent Start</DialogTitle>
            <DialogDescription>
              Are you sure you want to start the agent "{selectedAgent?.name}"? This action will
              initiate the agent process.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button onClick={cancelStartAgent} variant="outline" className="mr-2">
              Cancel
            </Button>
            <Button onClick={confirmStartAgent} className="bg-green-600 hover:bg-green-700">
              Start Agent
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      {isEditing ? (
        <div className="rounded-lg bg-gray-100 p-4">
          <h2 className="text-lg font-semibold">{!isAddNew ? "Edit Agent" : "Add New Agent"}</h2>
          <div className="flex flex-col gap-4">
            <div>
              {" "}
              <label className="block font-medium">Agent Name</label>{" "}
              <input
                type="text"
                placeholder="Name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full rounded border p-2"
              />
            </div>

            <div>
              {" "}
              <label className="block font-medium">Active</label>{" "}
              <select
                id="active"
                value={formData.active === true ? "true" : formData.active === false ? "false" : ""}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    active:
                      e.target.value === "true" ? true : e.target.value === "false" ? false : null,
                  }))
                }
                className="w-full rounded border p-2"
              >
                <option value="">Select</option>
                <option value="true">Y</option>
                <option value="false">N</option>
              </select>
            </div>

            <div className="mb-4">
              <label className="block font-medium">Greeting</label>
              <textarea
                className="h-10 w-full rounded border p-2"
                value={formData.greeting}
                onChange={(e) => {
                  setFormData({ ...formData, greeting: e.target.value })
                }}
              />
            </div>
            <div className="mb-4 flex items-center">
              <input
                type="checkbox"
                id="nonAgent"
                checked={formData.isAgent}
                onChange={(event) =>
                  setFormData((prev) => ({
                    ...prev,
                    isAgent: event?.target.checked,
                  }))
                }
                className="h-4 w-4"
              />
              <label htmlFor="nonAgent" className=" ml-2 text-sm font-medium">
                Non Interactive Agent?
              </label>
            </div>

            {formData.isAgent && (
              <>
                <div>
                  <label htmlFor="frequency" className="mb-1 block text-sm font-semibold">
                    Frequency
                  </label>
                  <select
                    id="frequency"
                    value={formData.frequency}
                    onChange={(e) => {
                      setFormData((prev) => ({
                        ...prev,
                        frequency: e.target.value,
                      }))
                    }}
                    className="w-full rounded border p-2"
                  >
                    <option value="">Select Frequency</option>
                    <option value="Quarterly">Quarterly</option>
                    <option value="Monthly">Monthly</option>
                    <option value="Weekly">Weekly</option>
                    <option value="Daily">Daily</option>
                  </select>
                </div>
                {formData.frequency && (
                  <div className="space-y-3">
                    <div>
                      <label htmlFor="dayTime" className="mb-1 block text-sm font-semibold">
                        {formData.frequency === "Daily"
                          ? "Day of Week"
                          : formData.frequency === "Weekly"
                            ? "Day of Week"
                            : formData.frequency === "Monthly"
                              ? "Day of Month"
                              : formData.frequency === "Quarterly"
                                ? "Quarter"
                                : "Day/Time"}
                      </label>
                      <select
                        id="dayTime"
                        value={formData.dayTime}
                        onChange={(e) =>
                          setFormData((prev) => ({
                            ...prev,
                            dayTime: e.target.value,
                          }))
                        }
                        className="w-full rounded border p-2"
                      >
                        <option value="">Select Option</option>
                        {getDayTimeOptions().map((opt) => (
                          <option key={opt.value} value={opt.value}>
                            {opt.label}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label htmlFor="scheduleTime" className="mb-1 block text-sm font-semibold">
                        Time
                      </label>
                      <input
                        type="time"
                        id="scheduleTime"
                        value={formData.scheduleTime || ""}
                        onChange={(e) =>
                          setFormData((prev) => ({
                            ...prev,
                            scheduleTime: e.target.value,
                          }))
                        }
                        className="w-full rounded border p-2"
                      />
                    </div>

                    <div>
                      <label htmlFor="timezone" className="mb-1 block text-sm font-semibold">
                        Timezone
                      </label>
                      <select
                        id="timezone"
                        value={formData.timezone || "EST"}
                        onChange={(e) =>
                          setFormData((prev) => ({
                            ...prev,
                            timezone: e.target.value,
                          }))
                        }
                        className="w-full rounded border p-2"
                      >
                        {getTimezoneOptions().map((opt) => (
                          <option key={opt.value} value={opt.value}>
                            {opt.label}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                )}
              </>
            )}

            <div className="mb-4">
              <label className="block font-medium">Objective</label>
              <textarea
                className="h-20 w-full rounded border p-2"
                value={formData.objective}
                onChange={(e) => {
                  setFormData({ ...formData, objective: e.target.value })
                }}
              />
            </div>
            <div>
              <label className="block font-medium">Tools Used</label>
              <ToolsMultiSelect
                selectedTools={
                  Array.isArray(formData.tools_used)
                    ? formData.tools_used
                    : typeof formData.tools_used === "string" && formData.tools_used
                      ? formData.tools_used
                          .split(",")
                          .map((t: string) => t.trim())
                          .filter(Boolean)
                      : []
                }
                onChange={(tools) => setFormData({ ...formData, tools_used: tools })}
                placeholder="Select tools..."
              />
            </div>
            {/* <div className="mb-4">
              <label className="block font-medium">Routing Instruction</label>
              <textarea
                className="h-20 w-full rounded border p-2"
                value={formData.routing_instruction}
                onChange={(e) => {
                  setFormData({
                    ...formData,
                    routing_instruction: e.target.value,
                  })
                }}
              />
            </div> */}
            {/* <div className="mb-4">
              <label className="block font-medium">Routing Examples</label>
              <textarea
                className="h-20 w-full rounded border p-2"
                value={formData.routing_examples}
                onChange={(e) => {
                  setFormData({
                    ...formData,
                    routing_examples: e.target.value,
                  })
                }}
              />
            </div> */}

            <div className="mb-4">
              <div className="space-y-3">
                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="batch-process-enabled"
                    checked={formData.batch_process_enabled}
                    onChange={(e) => {
                      setFormData({
                        ...formData,
                        batch_process_enabled: e.target.checked,
                      })
                    }}
                    className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <label className="block font-medium">Batch Process</label>
                </div>

                {formData.batch_process_enabled && (
                  <>
                    <div>
                      <label className="mb-1 block text-sm font-medium text-gray-700">
                        Batch Size
                      </label>
                      <input
                        type="number"
                        min="1"
                        value={formData.batch_size}
                        onChange={(e) => {
                          console.log("batch size", e.target.value)
                          setFormData({
                            ...formData,
                            batch_size: e.target.value,
                          })
                        }}
                        className="w-full rounded border p-2"
                      />
                    </div>

                    <div>
                      <label className="mb-1 block text-sm font-medium text-gray-700">Scope</label>
                      <textarea
                        className="h-20 w-full rounded border p-2"
                        placeholder="Enter batch process scope..."
                        value={formData.batch_scope}
                        onChange={(e) => {
                          setFormData({
                            ...formData,
                            batch_scope: e.target.value,
                          })
                        }}
                      />
                    </div>
                  </>
                )}
              </div>
            </div>

            <div className="mb-4">
              <label className="block font-medium">Primary Instructions</label>
              <textarea
                className="h-96 w-full rounded border p-2"
                value={formData.primary_instruction}
                onChange={(e) => {
                  setFormData({
                    ...formData,
                    primary_instruction: e.target.value,
                  })
                }}
              />
            </div>

            {/* Add New Instruction Button */}
            <div className="w-400[x]">
              <button
                onClick={addInstruction}
                className="mt-2 inline-flex w-[400x] items-center rounded-lg bg-green-600 px-4 py-2 font-semibold text-white shadow-md transition-all hover:bg-green-700"
              >
                <FaPlus className="mr-2" />
                Add New Task
              </button>
            </div>

            {/* Instructions List */}
            {formData?.tasks && formData?.tasks.length > 0 && (
              <div className="mt-4 space-y-4">
                {formData.tasks.map((item) => (
                  <div key={item.id} className="flex flex-col gap-2 rounded-lg border p-4 shadow">
                    <label htmlFor={`name-${item._id}`} className="font-semibold">
                      Task Name
                    </label>
                    <input
                      type="text"
                      placeholder="Name"
                      value={item.name}
                      onChange={(e) => updateInstruction(item._id, "name", e.target.value)}
                      className="w-full rounded border p-2"
                    />
                    <label htmlFor={`tools-${item._id}`} className="font-semibold">
                      Tools
                    </label>
                    <input
                      type="text"
                      placeholder="Tools"
                      value={item.tools}
                      onChange={(e) => updateInstruction(item._id, "tools", e.target.value)}
                      className="w-full rounded border p-2"
                    />
                    <label htmlFor={`instruction-${item._id}`} className="font-semibold">
                      Instruction
                    </label>
                    <textarea
                      className="h-80 w-full rounded border p-2"
                      placeholder="Instruction"
                      value={item.instruction}
                      onChange={(e) => updateInstruction(item._id, "instruction", e.target.value)}
                    />
                    <div className="w-400[x]">
                      {" "}
                      <button
                        onClick={() => removeInstruction(item._id)}
                        className="mt-2 flex items-center rounded-lg bg-red-600 px-4 py-2 font-semibold text-white shadow-md transition-all hover:bg-red-700"
                      >
                        <MdDelete className="mr-2" />
                        Delete
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
            <div className="mt-4 flex justify-end space-x-2">
              <button
                disabled={isAgentLoading}
                onClick={handleSave}
                className="flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-white hover:bg-blue-700 disabled:opacity-50"
              >
                <FaRegSave className="inline" />
                Save
                {isAgentLoading && <ImSpinner2 className="ml-2 h-5 w-5 animate-spin text-white" />}
              </button>
              <button
                onClick={handleCancel}
                className="rounded-lg bg-gray-500 px-4 py-2 text-white hover:bg-gray-600"
              >
                <MdOutlineCancel className="mr-2 inline" /> Cancel
              </button>
            </div>
          </div>
        </div>
      ) : (
        <>
          {!isIndividual && (
            <div className="flex justify-end p-3">
              <button
                onClick={handleAddNew}
                className="rounded-lg bg-gradient-to-r from-blue-700 to-blue-500 px-6 py-2 font-semibold text-white shadow-md hover:from-blue-800 hover:to-blue-600"
              >
                <div className="flex items-center">
                  <FaPlusCircle />
                  <span className="pl-3"> Add New</span>
                </div>
              </button>
            </div>
          )}
          <Table className="mt-2">
            <TableHeader>
              <TableRow className="bg-[#174894]">
                {tableHeader.map((item, index) => (
                  <TableHead key={index} className="text-white">
                    {item.name}
                  </TableHead>
                ))}
              </TableRow>
            </TableHeader>
            <TableBody>
              {agentList?.length > 0 ? (
                agentList.map((agent, index) => (
                  <TableRow
                    key={agent.id}
                    className={`${index % 2 === 0 ? "bg-white" : "bg-gray-200"} cursor-pointer hover:bg-gray-100`}
                  >
                    <TableCell className="py-3">{agent.name}</TableCell>
                    <TableCell className="py-3">{agent.objective}</TableCell>
                    <TableCell className="py-3">
                      <div className="flex  justify-start gap-2">
                        {agent.isAgent && (
                          <button
                            onClick={() => handleStartAgent(agent)}
                            className="flex items-center gap-1 rounded bg-green-600 px-3 py-1 text-sm text-white hover:bg-green-700"
                            title="Start Agent"
                          >
                            <FaPlay size={12} />
                            Start
                          </button>
                        )}
                        {!isIndividual && (
                          <>
                            <button onClick={() => handleEdit(agent)}>
                              <FaEdit size={20} />
                            </button>
                            <button onClick={() => handleDelete(agent)}>
                              <MdDelete size={20} />
                            </button>
                          </>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={tableHeader.length} className="py-3 text-center">
                    No Agent list found
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </>
      )}
    </div>
  )
}
