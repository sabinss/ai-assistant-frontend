"use client"
import React, { Suspense, useState } from "react"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { FaEdit, FaPlusCircle } from "react-icons/fa"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { FaRegSave } from "react-icons/fa"
import { MdOutlineCancel } from "react-icons/md"
import { toast } from "react-toastify"
import "react-toastify/dist/ReactToastify.css"
import useAuth from "@/store/user"
import axios from "axios"
import http from "@/config/http"

const tableHeader = [
  { name: "Name", sortable: false },
  { name: "Action", sortable: false },
  { name: "Objective", sortable: false },
  { name: "Active", sortable: false },
  { name: "Frequency", sortable: true, sortKey: "last_seen" },
  { name: "", sortable: true, sortKey: "last_seen" },
  { name: "" },
]
const MemoizedTableRow = React.memo(
  ({ item, index, handleEdit, handleManualTrigger, triggerLoading }: any) => {
    return (
      <TableRow
        key={item._id}
        className={`${index % 2 === 0 ? "bg-white" : "bg-gray-200"} cursor-pointer hover:bg-gray-100`}
      >
        <TableCell className="max-w-20 break-words py-3">{item.name}</TableCell>
        <TableCell className="max-w-20 break-words py-3">
          {item.action}
        </TableCell>

        <TableCell className="max-w-20 break-words py-3">
          {item.objective}
        </TableCell>
        <TableCell className="max-w-20 break-words py-3">
          {item.active ? "Y" : "N"}
        </TableCell>
        <TableCell className="max-w-20 break-words py-3">
          {item.frequency}
        </TableCell>
        <TableCell className="max-w-20 break-words py-3">
          {/* <button
            disabled={triggerLoading}
            className="ml-3 rounded bg-blue-500 p-2 font-semibold text-white hover:bg-blue-600"
            onClick={() => {
              handleManualTrigger(item.name)
            }}
          >
            Trigger Now {triggerLoading ? "loading" : ""}
          </button> */}
          <button
            disabled={triggerLoading}
            className="ml-3 flex items-center gap-2 rounded bg-blue-500 p-2 font-semibold text-white hover:bg-blue-600 disabled:opacity-50"
            onClick={() => handleManualTrigger(item.name)}
          >
            Trigger Now
            {triggerLoading && (
              <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent"></span>
            )}
          </button>
        </TableCell>
        <TableCell
          className="max-w-10 break-words py-3"
          onClick={(e) => {
            console.log("clicked")
            e.stopPropagation()
            handleEdit()
          }}
        >
          <FaEdit size={20} />
        </TableCell>
      </TableRow>
    )
  }
)
export const TaskAgentTable = ({ orgTaskAgents, handleTaskAgent }: any) => {
  const [isOpen, setIsOpen] = useState(false)
  const { access_token, user_data } = useAuth() // Call useAuth here
  const [isManualTriggering, setManualTrigger] = useState(false)
  const [loadingItem, setLoadingItem] = useState<any>(null)

  const [formData, setFormData] = useState<any>({
    name: "",
    action: "Draft Email",
    objective: "",
    active: true,
    frequency: "",
    output: "",
    trigger: "",
    who: "",
  })
  const openForm = (item: any = null) => {
    console.log("item", item)
    if (item) {
      setFormData(item)
    } else {
      setFormData({
        name: "",
        action: "Draft Email",
        objective: "",
        active: "Y",
        frequency: "Daily",
        output: "",
        trigger: "",
        who: "",
      })
    }
    setIsOpen(true)
  }
  const closeForm = () => {
    setIsOpen(false)
  }

  const callTaskAgent = async (taskName: string) => {
    try {
      const response = await http.post(
        "/organization/task-agent/trigger",
        { task_name: taskName, org_id: user_data?.organization },
        { headers: { Authorization: `Bearer ${access_token}` } }
      )
      console.log("response", response)
      setLoadingItem(null)
      toast.success("Success")
    } catch (err: any) {
      console.log(err)
      setLoadingItem(null)
      toast.error(err?.message || "Failed to call task agent api")
    }
  }

  return (
    <div className="relative mb-10 w-full overflow-y-auto rounded-md bg-white p-4 text-[#333333]">
      {/* table filter */}
      {/* table */}
      <div className="flex justify-end p-3">
        <button
          onClick={() => {
            openForm()
          }}
          className="rounded-lg bg-gradient-to-r from-blue-700 to-blue-500 px-6 py-2 font-semibold text-white shadow-md transition-all duration-300 hover:from-blue-800 hover:to-blue-600"
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
            {tableHeader.map((item: any, index: number) => {
              return (
                <TableHead
                  key={index}
                  className={`${item.name != "Stage" ? "w-5" : "w-10"} text-white ${item.sortable && "cursor-pointer"}`}
                >
                  <div className="flex flex-row items-center">
                    <p>{item.name}</p>
                  </div>
                </TableHead>
              )
            })}
          </TableRow>
        </TableHeader>
        <Suspense fallback={<div>Loading...</div>}>
          <TableBody>
            {orgTaskAgents?.length === 0 ? (
              <tr>
                <td colSpan={tableHeader?.length} className="py-3 text-center">
                  No Customer list found
                </td>
              </tr>
            ) : (
              orgTaskAgents?.map((item: any, index: any) => (
                <MemoizedTableRow
                  key={item?._id}
                  item={item}
                  index={index}
                  triggerLoading={loadingItem?.name === item.name} // Only show loading for clicked button
                  handleEdit={() => {
                    console.log("On edit called", item)
                    openForm(item)
                  }}
                  handleManualTrigger={(agentName: string) => {
                    setLoadingItem(item)
                    callTaskAgent(agentName)
                  }}
                />
              ))
            )}
          </TableBody>
        </Suspense>
      </Table>
      {/* Form Modal */}
      {isOpen && (
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
          <DialogContent className="max-h-[80vh] max-w-[90vw] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>
                {formData.name ? "Edit Task" : "Add Task"}
              </DialogTitle>
            </DialogHeader>
            <div className="flex flex-col gap-4">
              <div>
                {" "}
                <label className="block font-medium">Name</label>{" "}
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
                <label className="block font-medium">Action</label>{" "}
                <select
                  defaultValue="Draft Email" // Sets initial default selection
                  value={formData.action}
                  onChange={(e) =>
                    setFormData({ ...formData, action: e.target.value })
                  }
                  className="w-full rounded border p-2"
                >
                  <option value="Draft Email">Draft Email</option>
                  <option value="Send Chat">Send Chat</option>
                  <option value="Create Task">Create Task</option>
                  <option value="Notify">Notify</option>
                </select>
              </div>
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
              <div className="mb-4">
                <label className="block font-medium">Who</label>
                <textarea
                  className="h-20 w-full rounded border p-2"
                  value={formData.who}
                  onChange={(e) => {
                    setFormData({ ...formData, who: e.target.value })
                  }}
                />
              </div>
              <div>
                <label className="block font-medium">Active</label>{" "}
                <select
                  value={formData.active ? "Y" : "N"}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      active: e.target.value == "Y" ? true : false,
                    })
                  }
                  className="w-full rounded border p-2"
                >
                  <option value="Y">Y</option>
                  <option value="N">N</option>
                </select>
              </div>

              <div className="mb-4">
                <label className="block font-medium">Trigger</label>
                <textarea
                  className="h-20 w-full rounded border p-2"
                  value={formData.trigger}
                  onChange={(e) => {
                    setFormData({ ...formData, trigger: e.target.value })
                  }}
                />
              </div>
              <div className="mb-4">
                <label className="block font-medium">Output</label>
                <textarea
                  className="h-20 w-full rounded border p-2"
                  value={formData.output}
                  onChange={(e) => {
                    setFormData({ ...formData, output: e.target.value })
                  }}
                />
              </div>
              <div className="mb-4">
                <label className="block font-medium">Frequency</label>
                <select
                  value={formData.frequency}
                  onChange={(e) =>
                    setFormData({ ...formData, frequency: e.target.value })
                  }
                  className="w-full rounded border p-2"
                >
                  <option value="Daily">Daily</option>
                  <option value="Weekly">Weekly</option>
                  <option value="Monthly">Monthly</option>
                  <option value="Quarterly">Quarterly</option>
                </select>
              </div>
              <div className="flex justify-end gap-2">
                <div>
                  <button
                    onClick={closeForm}
                    className="mr-3 rounded-lg bg-gradient-to-r from-blue-700 to-blue-500 px-6 py-2 font-semibold text-white shadow-md transition-all duration-300 hover:from-blue-800 hover:to-blue-600"
                  >
                    <div className="flex items-center">
                      <MdOutlineCancel />
                      <span className="pl-3">Cancel</span>
                    </div>
                  </button>
                  <button
                    onClick={(e) => {
                      e.preventDefault()
                      console.log("Saving", formData)
                      setIsOpen(() => false)
                      handleTaskAgent(formData)
                    }}
                    className="rounded-lg bg-gradient-to-r from-blue-700 to-blue-500 px-6 py-2 font-semibold text-white shadow-md transition-all duration-300 hover:from-blue-800 hover:to-blue-600"
                  >
                    <div className="flex items-center">
                      <FaRegSave />
                      <span className="pl-3"> Save</span>
                    </div>
                  </button>
                </div>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  )
}
