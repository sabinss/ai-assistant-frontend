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
import { FaEdit, FaPlus, FaPlusCircle } from "react-icons/fa"
import { FaRegSave } from "react-icons/fa"
import { MdDelete, MdOutlineCancel } from "react-icons/md"
import http from "@/config/http"
import useAuth from "@/store/user"
import { toast } from "react-toastify"
import "react-toastify/dist/ReactToastify.css"
import { ImSpinner2 } from "react-icons/im" // Import spinner icon
import useOrgCustomer from "@/store/organization_customer"

const tableHeader = [
  { name: "Name", sortable: false },
  { name: "Objective", sortable: false },
  { name: "", sortable: false },
]

export const AgentTable = () => {
  const [agentList, setAgentList] = useState<any>([])
  const [isEditing, setIsEditing] = useState(false)
  const { access_token } = useAuth() // Call useAuth here
  const [isAgent, setIsAgent] = useState(false)
  const [frequency, setFrequency] = useState("")
  const [dayTime, setDayTime] = useState("")
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
    tools_used: "",
    primary_instruction: "",
    frequency: null,
    dayTime: null,
    isAgent: null,
    tasks: [], // Array to store instructions dynamically
    active: false,
  })
  console.log("formData---", formData)
  const [isAddNew, setAddNew] = useState(false)
  const [isAgentLoading, setAgentLoading] = useState(false)
  const addInstruction = () => {
    setFormData((prev: any) => ({
      ...prev,
      tasks: [
        ...(prev.tasks || []),
        { _id: Date.now(), tasks: "", tools: "", name: "" },
      ],
    }))
  }
  const getDayTimeOptions = () => {
    switch (formData.frequency) {
      case "Daily":
        return Array.from({ length: 24 }, (_, i) => `${i + 1}`)
      case "Weekly":
        return Array.from({ length: 7 }, (_, i) => `W-${i + 1}`)
      case "Monthly":
        return Array.from({ length: 28 }, (_, i) => `M-${i + 1}`)
      case "Quarterly":
        return ["1", "2", "3"]
      default:
        return []
    }
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
      tasks: prev.tasks.map((item) =>
        item._id === id ? { ...item, [field]: value } : item
      ),
    }))
  }

  const handleAddNew = () => {
    setAddNew(true)
    setFormData({
      id: null,
      name: "",
      objective: "",
      dayTime,
      frequency,
      isAgent,
    })
    setIsEditing(true)
  }

  const handleEdit = (agent: any) => {
    console.log("Edit", agent)
    setAddNew(false)
    setFormData({
      ...agent,
      active: agent.active,
    })
    setIsEditing(true)
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
    try {
      if (data._id) {
        await http.put("/organization/agent", data, {
          headers: { Authorization: `Bearer ${access_token}` },
        })
        // Update the agent list without re-fetching from API
        setAgentList((prevList: any) =>
          prevList.map((agent: any) =>
            agent._id === data._id ? { ...agent, ...data } : agent
          )
        )
        setAgentLoading(false)
        setIsEditing(false)
        toast.success("Agent updated successfully")
        await fetchOrgAgentInstructions()
      } else {
        const response = await http.post("/organization/agent", data, {
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

  return (
    <div className="relative mb-10 w-full overflow-y-auto rounded-md bg-white p-4 text-[#333333]">
      {isEditing ? (
        <div className="rounded-lg bg-gray-100 p-4">
          <h2 className="text-lg font-semibold">
            {!isAddNew ? "Edit Agent" : "Add New Agent"}
          </h2>
          <div className="flex flex-col gap-4">
            <div>
              {" "}
              <label className="block font-medium">Agent Name</label>{" "}
              <input
                type="text"
                placeholder="Name"
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
                className="w-full rounded border p-2"
              />
            </div>

            <div>
              {" "}
              <label className="block font-medium">Active</label>{" "}
              <select
                id="active"
                value={formData.active}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    active: e.target.value,
                  }))
                }
                className="w-full rounded border p-2"
              >
                <option value="">Select</option>
                <option value={true}>Y</option>
                <option value={false}>N</option>
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
                  <label
                    htmlFor="frequency"
                    className="mb-1 block text-sm font-semibold"
                  >
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
                  <div>
                    <label
                      htmlFor="dayTime"
                      className="mb-1 block text-sm font-semibold"
                    >
                      Day/Time
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
                        <option key={opt} value={opt}>
                          {opt}
                        </option>
                      ))}
                    </select>
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
              {" "}
              <label className="block font-medium">Tools Used</label>{" "}
              <input
                type="text"
                placeholder="Name"
                value={formData.tools_used}
                onChange={(e) =>
                  setFormData({ ...formData, tools_used: e.target.value })
                }
                className="w-full rounded border p-2"
              />
            </div>
            <div className="mb-4">
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
            </div>
            <div className="mb-4">
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
                  <div
                    key={item.id}
                    className="flex flex-col gap-2 rounded-lg border p-4 shadow"
                  >
                    <label
                      htmlFor={`name-${item._id}`}
                      className="font-semibold"
                    >
                      Task Name
                    </label>
                    <input
                      type="text"
                      placeholder="Name"
                      value={item.name}
                      onChange={(e) =>
                        updateInstruction(item._id, "name", e.target.value)
                      }
                      className="w-full rounded border p-2"
                    />
                    <label
                      htmlFor={`tools-${item._id}`}
                      className="font-semibold"
                    >
                      Tools
                    </label>
                    <input
                      type="text"
                      placeholder="Tools"
                      value={item.tools}
                      onChange={(e) =>
                        updateInstruction(item._id, "tools", e.target.value)
                      }
                      className="w-full rounded border p-2"
                    />
                    <label
                      htmlFor={`instruction-${item._id}`}
                      className="font-semibold"
                    >
                      Instruction
                    </label>
                    <textarea
                      className="h-80 w-full rounded border p-2"
                      placeholder="Instruction"
                      value={item.instruction}
                      onChange={(e) =>
                        updateInstruction(
                          item._id,
                          "instruction",
                          e.target.value
                        )
                      }
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
                {isAgentLoading && (
                  <ImSpinner2 className="ml-2 h-5 w-5 animate-spin text-white" />
                )}
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
                      <button onClick={() => handleEdit(agent)}>
                        <FaEdit size={20} />
                      </button>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell
                    colSpan={tableHeader.length}
                    className="py-3 text-center"
                  >
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
