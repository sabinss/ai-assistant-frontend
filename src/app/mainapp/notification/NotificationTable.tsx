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
import { useRouter } from "next/navigation"
import useNavBarStore from "@/store/store"
import { format } from "date-fns"
import { Checkbox } from "@/components/ui/checkbox"
import initialEmails from "./notification-data"

// Sample data - replace with your actual data source

const tableHeader = [
  { name: "Email From", sortable: false },
  { name: "Email To", sortable: false },
  { name: "Subject", sortable: false },
  { name: "Date/time", sortable: false },
  { name: "Status", sortable: true, sortKey: "last_seen" },
  { name: "Action" },
]

const circleColors = ["bg-yellow-500", "bg-red-500", "bg-green-500"]

const MemoizedTableRow = React.memo(
  ({ item, index, handleInProgress, handleDone }: any) => {
    const router = useRouter()
    const [selectStage, setStage] = useState("")
    const { handleSideBar } = useNavBarStore()

    const color = circleColors[Math.floor(Math.random() * circleColors.length)]
    return (
      <TableRow
        onClick={() => {
          // router.push(`/mainapp/customers/details?name=${item.name}`)
          // handleSideBar(true)
        }}
        key={item._id}
        className={`${index % 2 === 0 ? "bg-white" : "bg-gray-200"} cursor-pointer hover:bg-gray-100 ${item.status === "open" ? "font-bold" : ""}`}
      >
        <TableCell className="max-w-20 break-words py-3">{item.from}</TableCell>
        <TableCell className="max-w-20 break-words py-3">{item.to}</TableCell>
        <TableCell className="max-w-20 break-words py-3">
          {item.subject}
        </TableCell>
        <TableCell className="max-w-20 break-words py-3">
          {format(item.datetime, "MMM d, yyyy h:mm a")}
        </TableCell>

        <TableCell className="max-w-20 break-words py-3">
          <span
            className={`text-xm rounded-full px-3 py-1 font-semibold uppercase ${
              item.status === "open"
                ? "bg-green-100 text-green-800"
                : "bg-gray-100 text-gray-800"
            }`}
          >
            {item.status}
          </span>
        </TableCell>
        <TableCell className="max-w-20 break-words py-3">
          <label className="flex items-center space-x-1">
            <input
              type="checkbox"
              checked={item.status === "open"}
              onChange={() => {
                handleInProgress("open", item._id)
              }}
            />
            <span>In Progress</span>
          </label>
          <label className="flex items-center space-x-1">
            <input
              type="checkbox"
              checked={item.status === "done"}
              onChange={() => {
                handleDone("done", item._id)
              }}
            />
            <span>Done</span>
          </label>
        </TableCell>
      </TableRow>
    )
  }
)
export default function NotificationListTable() {
  const handleSort = (item: any) => {}
  const [showOpenOnly, setShowOpenOnly] = useState(false)
  const [notificationList, setNotificationList] = useState(initialEmails)
  const [currentPage, setCurrentPage] = useState(1)
  //pagination logic
  const itemsPerPage = 7
  const totalPages = Math.ceil(notificationList.length / itemsPerPage)
  const paginatedData = notificationList.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  )

  const handlePageChange = (newPage) => {
    setCurrentPage(newPage)
  }
  return (
    <div className="relative mb-10 w-full overflow-y-auto rounded-md bg-white p-4 text-[#333333]">
      <div className="flex justify-end space-x-2">
        <Checkbox
          id="terms"
          checked={showOpenOnly}
          onCheckedChange={(checked) => {
            console.log("checked unchedked", checked)
            if (checked) {
              const filteredEmails = notificationList.filter(
                (email) => email.status === "open"
              )

              setNotificationList(() => filteredEmails)
            } else {
              setNotificationList(initialEmails)
            }

            setShowOpenOnly(checked)
          }}
        />

        <label
          htmlFor="showOpen"
          className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
        >
          Show Open Only
        </label>
      </div>
      <Table className="mt-2">
        <TableHeader>
          <TableRow className="bg-[#174894]">
            {tableHeader.map((item: any, index: number) => {
              return (
                <TableHead
                  key={index}
                  className={`${item.name != "Stage" ? "w-5" : "w-10"} text-white ${item.sortable && "cursor-pointer"}`}
                  onClick={() => item.sortable && handleSort(item.sortKey!)}
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
            {paginatedData.length === 0 ? (
              <tr>
                <td colSpan={tableHeader?.length} className="py-3 text-center">
                  No notification found
                </td>
              </tr>
            ) : (
              paginatedData?.map((item: any, index) => (
                <MemoizedTableRow
                  key={item?._id}
                  item={item}
                  index={index}
                  handleInProgress={(value: string, id: number) => {
                    setNotificationList((prevList) =>
                      prevList.map((item) =>
                        item._id == id ? { ...item, status: "open" } : item
                      )
                    )
                  }}
                  handleDone={(value: string, id: number) => {
                    setNotificationList((prevList) =>
                      prevList.map((item) =>
                        item._id == id ? { ...item, status: "done" } : item
                      )
                    )
                  }}
                />
              ))
            )}
          </TableBody>
          <div className="mt-4 flex items-center justify-between">
            <button
              disabled={currentPage === 1}
              onClick={() => handlePageChange(currentPage - 1)}
              className={`rounded-md px-4 py-2 ${
                currentPage === 1 ? "bg-gray-200" : "bg-blue-500 text-white"
              }`}
            >
              Previous
            </button>
            <p>
              Page {currentPage} of {totalPages}
            </p>
            <button
              disabled={currentPage === totalPages}
              onClick={() => handlePageChange(currentPage + 1)}
              className={`rounded-md px-4 py-2 ${
                currentPage === totalPages
                  ? "bg-gray-200"
                  : "bg-blue-500 text-white"
              }`}
            >
              Next
            </button>
          </div>
        </Suspense>
      </Table>
    </div>
  )
}
