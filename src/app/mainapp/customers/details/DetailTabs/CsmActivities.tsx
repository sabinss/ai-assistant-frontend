import React, { Suspense, useState } from "react"
import { IoMdAdd } from "react-icons/io"
import { HiMiniPencilSquare } from "react-icons/hi2"
import { GoEye } from "react-icons/go"
import { MdOutlineDeleteOutline } from "react-icons/md"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import moment from "moment"
import { CustomModal } from "@/components/modal/CustomModal"
import { Textarea } from "@/components/ui/textarea"
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { CalendarIcon } from "@radix-ui/react-icons"
import { format } from "date-fns"
import { Calendar } from "@/components/ui/calendar"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { cn } from "@/lib/utils"
import { toast } from "react-toastify"
import "react-toastify/dist/ReactToastify.css"

enum ActionType {
  EDIT = "EDIT",
  ADD = "ADD",
  VIEW = "VIEW",
}

const MemoizedTableRow = React.memo(({ item, index, handleActionKey }: any) => {
  return (
    <TableRow
      key={item._id}
      className={`${index % 2 === 0 ? "bg-white" : "bg-gray-200"} cursor-pointer hover:bg-gray-100`}
    >
      <TableCell className="max-w-20 break-words py-3">
        {item.taskName}
      </TableCell>
      <TableCell className="max-w-20 break-words py-3">
        {item.description}
      </TableCell>
      <TableCell className="max-w-20 break-words py-3">
        {item.channel}
      </TableCell>
      <TableCell className="max-w-20 break-words py-3">{item.status}</TableCell>
      <TableCell className="max-w-20 break-words py-3">
        {item.targetDate}
      </TableCell>
      <TableCell className="max-w-20 break-words py-3">{item.agent}</TableCell>
      <TableCell className="max-w-20 break-words py-3">
        {item.note ?? "N/A"}
      </TableCell>
      <TableCell className="max-w-20 break-words py-3">
        <div className="flex gap-1">
          <HiMiniPencilSquare size={17} onClick={() => {}} />
          <GoEye size={17} />
          <MdOutlineDeleteOutline size={17} />
        </div>
      </TableCell>
    </TableRow>
  )
})

const CsmActivities = () => {
  const [actionKey, setActionKey] = useState(null)
  const [date, setDate] = React.useState<Date>()
  const [cmsActivityRecord, SetCsmActivityRecord] = useState({
    taskName: null,
    description: null,
    channel: null,
    status: "Open",
    targetDate: null,
    agent: null,
    note: null,
  })

  const defaultData = [
    {
      taskName: "Call customer for renewal",
      description: "Renewal date is approaching",
      channel: "Email",
      status: "Open",
      targetDate: moment("10/12/2024").format("YYYY/MM/DD"),
      agent: "Sarah@test.com",
      note: null,
    },
    {
      taskName: "Follow up on escalated call",
      description: "Customer has problem checkin group and has been escalated,",
      channel: "Phone",
      status: "Open",
      targetDate: moment("10/12/2024").format("YYYY/MM/DD"),
      agent: "bhattachas@hotmail.com",
      note: null,
    },
  ]

  const [mockData, setMockData] = useState<any>(defaultData)
  const tableHeader = [
    { name: "Task Name", sortable: false },
    { name: "Description", sortable: false },
    { name: "Channel", sortable: false },
    { name: "Status", sortable: false },
    { name: "Target", sortable: false },
    { name: "Agent", sortable: false },
    { name: "Note", sortable: false },
    { name: "Action", sortable: false },
  ]

  const handleActionKey = (action: string) => {
    setActionKey(action)
  }

  const isValidData = (obj: any) => {
    let valid = true
    for (let key in obj) {
      if (key === "targetDate") {
        valid = true
      } else {
        if (obj[key] == null) {
          valid = false
        }
      }
    }
    if (!date) {
      valid = false
    }
    return valid
  }

  const handleSave = () => {
    if (isValidData(cmsActivityRecord)) {
      toast.success("Csm Activities added successfully", { autoClose: 300 })
      setActionKey(null)
      setMockData([
        ...defaultData,
        {
          ...cmsActivityRecord,
          status: "open",
          targetDate: moment(new Date(date)).format("YYYY/MM/DD"),
        },
      ])
    } else {
      toast.error("Please enter all the value", { autoClose: 300 })
    }
  }

  const handleChange = (key, value) => {
    SetCsmActivityRecord((prev) => ({
      ...prev,
      [key]: value,
    }))
  }
  return (
    <div className="relative mb-10 w-full overflow-y-auto rounded-md bg-white p-4 text-[#333333]">
      <Button
        type="submit"
        onClick={() => {
          SetCsmActivityRecord({
            taskName: null,
            description: null,
            channel: null,
            status: "Open",
            targetDate: null,
            agent: null,
            note: null,
          })
          handleActionKey(ActionType.ADD)
        }}
        className="ml-auto flex bg-[#174894] px-4 py-1 font-semibold hover:bg-[#173094]"
      >
        <IoMdAdd size={20} />
        <span className="ml-2"> Add New Task</span>
      </Button>
      <Table className="mt-2">
        <TableHeader>
          <TableRow className="bg-[#174894]">
            {tableHeader.map((item: any, index: number) => {
              return (
                <TableHead
                  key={index}
                  className={`${item.name != "Stage" ? "w-5" : "w-10"} text-white ${item.sortable && "cursor-pointer"}`}
                  onClick={() => {}}
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
            {mockData.length === 0 ? (
              <tr>
                <td colSpan={tableHeader?.length} className="py-3 text-center">
                  No Csm Activities found.
                </td>
              </tr>
            ) : (
              mockData.map((item: any, index: any) => (
                <MemoizedTableRow
                  key={item?._id}
                  item={item}
                  index={index}
                  handleActionKey={handleActionKey}
                />
              ))
            )}
          </TableBody>
        </Suspense>
      </Table>
      {actionKey == ActionType.ADD && (
        <CustomModal
          headerTitle="Add CSM Activities"
          onClose={() => {
            setActionKey(null)
          }}
          onSave={() => {
            handleSave()
          }}
        >
          <div className="px-3">
            <input
              placeholder="Activity Name"
              className="w-full rounded-md bg-gray-200 p-3 py-3"
              onChange={(e) => {
                handleChange("taskName", e.target.value)
              }}
            />
            <div className="my-3 flex justify-between">
              <Select
                onValueChange={(value) => {
                  handleChange("channel", value)
                }}
              >
                <SelectTrigger className="w-[180px] border border-none bg-gray-200 text-gray-400">
                  <SelectValue placeholder="Select channel" />
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    <SelectItem value="email">Email</SelectItem>
                    <SelectItem value="phone">Phone</SelectItem>
                  </SelectGroup>
                </SelectContent>
              </Select>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant={"outline"}
                    className={cn(
                      "w-[240px] justify-start text-left font-normal",
                      !date && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {date ? format(date, "PPP") : <span>Pick a date</span>}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={date}
                    onSelect={(date) => {
                      setDate(date)
                      // handleChange("targetDate", date)
                    }}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
              <Select
                onValueChange={(value) => {
                  handleChange("agent", value)
                }}
              >
                <SelectTrigger className="w-[180px] border border-none  bg-gray-200 text-gray-400">
                  <SelectValue placeholder="Select Agent" />
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    <SelectItem value="bhattachas@hotmail.com">
                      bhattachas@hotmail.com
                    </SelectItem>
                    <SelectItem value="Sarah@test.com">
                      Sarah@test.com
                    </SelectItem>
                  </SelectGroup>
                </SelectContent>
              </Select>
            </div>
            <div className="prompt mt-4">
              <Textarea
                className={`mt-2 bg-gray-200  `}
                rows={10}
                placeholder="Description"
                value={cmsActivityRecord.description ?? ""}
                onChange={(e) => handleChange("description", e.target.value)}
              />
            </div>
            <div className="prompt mt-4">
              <Textarea
                className={`mt-2 bg-gray-200  `}
                rows={10}
                placeholder="Notes"
                value={cmsActivityRecord.note ?? ""}
                onChange={(e) => handleChange("note", e.target.value)}
              />
            </div>
          </div>
        </CustomModal>
      )}
    </div>
  )
}

export default CsmActivities
