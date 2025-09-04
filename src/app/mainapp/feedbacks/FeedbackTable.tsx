"use client"
import React, {
  Suspense,
  useEffect,
  useMemo,
  useState,
  useCallback,
} from "react"
import { EditIcon, TrashIcon, MoveDown, MoveUp } from "lucide-react"
import { format as dFormat } from "date-fns"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { Drawer, DrawerContent, DrawerTrigger } from "@/components/ui/drawer"
import http from "@/config/http"
import TableFilter from "../commoncompnents/TableFilter"
import TablePagination from "../commoncompnents/TablePagination"
import EditFeedback from "./edit/[id]/page"
import { CalendarDateRangePicker } from "../commoncompnents/CalendarRange"
import useFormStore from "../../../store/formdata"
import Link from "next/link"
import { FeedbackFilter } from "./FeedbackFilter"
import useAuth from "@/store/user"
import useNavBarStore from "@/store/store"

const tableHeader = [
  { name: "Question", sortable: false, sortKey: "question" },
  { name: "Feedback", sortable: true, sortKey: "feedback" },
  { name: "Original Answer", sortable: false, sortKey: "original_answer" },
  { name: "Modified Answer", sortable: true, sortKey: "modified_answer" },
  { name: "Comment", sortable: false, sortKey: "comment" },
  { name: "Status", sortable: true, sortKey: "status" },
  { name: "Date", sortable: true, sortKey: "createdAt" },
  { name: "Actions", sortable: false },
]

interface Feedback {
  question: string
  feedback: string
  original_answer: string
  modified_answer: string
  comment: string
  status: string
  _id: string
}

function truncateText(text: any, maxLength = 50) {
  if (text?.length <= maxLength) {
    return text
  }
  const truncatedText = text?.slice(0, maxLength) // Get the first maxLength characters
  return `${truncatedText}...` // Return the truncated text with "..." appended
}
const MemoizedTableRow = React.memo(({ item, index }: any) => {
  const { updateFeedbackTable } = useFormStore()
  const { access_token, user_data } = useAuth() // Call useAuth here

  const handleDelete = async (id: string) => {
    try {
      await http.delete(`/feedback/${id}`, {
        headers: {
          Authorization: `Bearer ${access_token}`,
        },
      })
      //remove from third party api
      const res = await http.deleteFeedback(user_data?.organization, [id])
      //setFeedbacks((prevFeedbacks) => prevFeedbacks.filter((feedback) => feedback._id !== id));
      updateFeedbackTable("removeState", Math.random())
    } catch (error) {
      console.log(error)
    }
  }

  let style = ""
  switch (item?.status) {
    case "new":
      style = "bg-green-500"
      break
    case "removed":
      style = "bg-red-500"
      break
    case "updated":
      style = "bg-blue-500"
      break
    default:
      style = "bg-slate-400"
  }

  return (
    <TableRow
      key={item._id}
      className={`${index % 2 === 0 ? "bg-white" : "bg-gray-200"} hover:bg-gray-100`}
    >
      <TableCell className="max-w-20 break-words py-3">
        {truncateText(item.conversation.question, 20)}
      </TableCell>
      <TableCell className="max-w-20 break-words py-3">
        {truncateText(item.feedback)}
      </TableCell>
      <TableCell className="max-w-20 break-words py-3">
        {truncateText(item.conversation.answer)}
      </TableCell>
      <TableCell className="max-w-20 break-words py-3">
        {truncateText(item.modified_answer)}
      </TableCell>
      <TableCell className="py-3">{item.feedbackMsg ?? "N/A"}</TableCell>
      <TableCell className="py-3">
        <div className={`w-fit rounded-sm px-2 text-white ${style}`}>
          {item.status}
        </div>
      </TableCell>
      <TableCell className="py-3">
        {dFormat(item?.createdAt as Date, "yyyy-MM-dd h:m:s")}
      </TableCell>
      <TableCell className="flex items-center justify-center py-3">
        <div className={`w-fit cursor-pointer rounded-sm px-2`}>
          <DrawerEdit id={item?._id} />
        </div>
        <div className={`w-fit cursor-pointer rounded-sm px-2`}>
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <TrashIcon />
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                <AlertDialogDescription>
                  This action cannot be undone. This will permanently delete
                  your feedback and remove its data from our servers.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>
                  <button className="px-3 py-1">Cancel</button>
                </AlertDialogCancel>
                <AlertDialogAction className="rounded-sm bg-red-500 px-5 py-1 hover:bg-red-600">
                  <button
                    className="px-3 py-1 text-red-50"
                    onClick={() => handleDelete(item._id)}
                  >
                    Delete
                  </button>
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </TableCell>
    </TableRow>
  )
})

export default function FeedbackTable() {
  const { feedbackTable, updateFeedbackTable } = useFormStore()
  const {
    sortColumn,
    sortOrder,
    search,
    limit,
    page,
    feedbacks,
    endDate,
    startDate,
    status,
    feedbackType,
    removeState,
  } = feedbackTable
  const { access_token } = useAuth() // Call useAuth here
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    console.log("feedback table effect")
    fetchFeedbacks()
  }, [
    page,
    search,
    sortColumn,
    feedbackType,
    startDate,
    endDate,
    sortOrder,
    limit,
    removeState,
    status,
    feedbackType,
  ])

  const fetchFeedbacks = async () => {
    try {
      setIsLoading(true)
      const response = await http.get<{
        feedbacks: Feedback[]
        totalPages: number
      }>(
        `/feedbacks?page=${[page]}&limit=${limit}&search=${search}&sortField=${sortColumn}&sortDirection=${sortOrder}&status=${status}&feedbackType=${feedbackType}&startDate=${startDate}&endDate=${endDate}`,
        { headers: { Authorization: `Bearer ${access_token}` } }
      )
      updateFeedbackTable("feedbacks", response.data.feedbacks)
      updateFeedbackTable("totalPages", response.data.totalPages)
    } catch (error: any) {
      console.error(error)
    } finally {
      setIsLoading(false)
    }
  }
  const handleSort = useCallback(
    (sortKey: string) => {
      if (sortColumn === sortKey) {
        updateFeedbackTable("sortOrder", sortOrder === "asc" ? "desc" : "asc")
      } else {
        updateFeedbackTable("sortColumn", sortKey)
        updateFeedbackTable("sortOrder", "asc")
      }
    },
    [sortColumn, sortOrder, updateFeedbackTable]
  )

  const sortedFeedbacks = useMemo(() => {
    if (!sortColumn) return feedbacks

    return [...feedbacks].sort((a, b) => {
      const aValue = a[sortColumn as keyof Feedback]
      const bValue = b[sortColumn as keyof Feedback]

      if (aValue < bValue) return sortOrder === "asc" ? -1 : 1
      if (aValue > bValue) return sortOrder === "asc" ? 1 : -1
      return 0
    })
  }, [feedbacks, sortColumn, sortOrder])

  const filteredFeedbacks = useMemo(() => {
    if (!search) return sortedFeedbacks
    const lowerCaseSearch = search.toLowerCase()
    return sortedFeedbacks.filter((feedback) =>
      Object.values(feedback).some(
        (value) =>
          typeof value === "string" &&
          value.toLowerCase().includes(lowerCaseSearch)
      )
    )
  }, [search, sortedFeedbacks])

  return (
    <div className="relative w-full rounded-md bg-white p-4 text-[#333333]">
      {isLoading && (
        <div className="absolute left-0 top-0 z-50 flex h-full w-full items-center justify-center bg-gray-200 bg-opacity-50">
          <div className="h-12 w-12 animate-spin rounded-full border-b-2 border-t-2 border-gray-900"></div>
        </div>
      )}
      <div className="flex w-full flex-col gap-2 md:flex-row md:justify-end">
        <div>
          <TableFilter
            parentComponent="feedbacktable"
            FilterComponent={FeedbackFilter}
          />
        </div>
        <div className="">
          <CalendarDateRangePicker />
        </div>
      </div>
      <Table className="mt-2">
        <TableHeader>
          <TableRow className="bg-[#174894]">
            {tableHeader.map((item, index) => (
              <TableHead
                key={index}
                className={`text-white ${item.sortable && "cursor-pointer"}`}
                onClick={() => item.sortable && handleSort(item.sortKey!)}
              >
                <div className="flex flex-row items-center">
                  <p>{item.name}</p>
                  {item.sortable && (
                    <div className="flex items-center justify-center p-0">
                      <MoveUp
                        size={15}
                        className={`${sortColumn === item.sortKey && sortOrder === "asc" ? "text-[#fff]" : "text-gray-400"}`}
                      />
                      <MoveDown
                        size={15}
                        className={`ml-[-6px] ${sortColumn === item.sortKey && sortOrder === "desc" ? "text-[#fff]" : "text-gray-400"}`}
                      />
                    </div>
                  )}
                </div>
              </TableHead>
            ))}
          </TableRow>
        </TableHeader>
        <Suspense fallback={<div>Loading...</div>}>
          <TableBody>
            {filteredFeedbacks?.length === 0 ? (
              <tr>
                <td colSpan={tableHeader?.length} className="py-3 text-center">
                  No Feedbacks found
                </td>
              </tr>
            ) : (
              filteredFeedbacks?.map((item, index) => (
                <MemoizedTableRow key={item?._id} item={item} index={index} />
              ))
            )}
          </TableBody>
        </Suspense>
      </Table>
      <TablePagination parentComponent="feedbacktable" />
    </div>
  )
}
const DrawerEdit = ({ id }: { id: string }) => {
  const { isCollapsed } = useNavBarStore()

  return (
    <>
      {isCollapsed ? (
        <Link href={`/mainapp/feedbacks/edit/${id}`}>
          <EditIcon />
        </Link>
      ) : (
        <Drawer direction="right">
          <DrawerTrigger asChild>
            <EditIcon />
          </DrawerTrigger>
          <DrawerContent>
            <div className="h-screen w-[50vw]">
              <EditFeedback params={{ id }} type="drawer" />
            </div>
          </DrawerContent>
        </Drawer>
      )}
    </>
  )
}
