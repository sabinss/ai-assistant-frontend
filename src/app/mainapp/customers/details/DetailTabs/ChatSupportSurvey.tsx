"use client"
import { Input } from "@/components/ui/input"
import React, { Suspense, useState } from "react"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { CUSTOMER_LIST, CUSTOMER_LIST_STAGES } from "@/app/constants"
import { CUSTOMER_SURVEY } from "../constants/index"
import Chip from "@/components/ui/customerlist-ui/chip"
import Score from "@/components/ui/customerlist-ui/Score"
import Dropdown from "../../../commoncompnents/DropDown"
import { useRouter } from "next/navigation"
import useNavBarStore from "@/store/store"

const tableHeader = [
  { name: "Date", sortable: true, sortKey: "FILL_IN" },
  { name: "User", sortable: false },
  { name: "Rating", sortable: false },
  { name: "Feedback", sortable: false },
]

interface CustomerSurvey {
  id: number
  date: string
  user: string
  rating: number
  feedback: string
}

const RatingCard = ({ score, color }: { score: number; color: string }) => {
  // Generate circles based on score (out of 10)
  const filledCircles = Array(score).fill(0)
  const emptyCircles = Array(10 - score).fill(0)

  return (
    <div className="mb-4 flex flex-col gap-2">
      {/* Score Rectangle */}
      <div
        className={`flex h-10 w-20 items-center justify-center ${color} self-start rounded text-xl font-bold text-white`}
      >
        {score} / 10
      </div>
      {/* Score Circles */}
      <div className="flex space-x-1">
        {filledCircles.map((_, index) => (
          <div key={index} className={`h-4 w-4 rounded-full ${color}`}></div>
        ))}
        {emptyCircles.map((_, index) => (
          <div key={index} className="h-4 w-4 rounded-full bg-gray-300"></div>
        ))}
      </div>
    </div>
  )
}

const circleColors = ["bg-yellow-500", "bg-red-500", "bg-green-500"]
const MemoizedTableRow = React.memo(({ item, index }: any) => {
  const router = useRouter()
  const [selectStage, setStage] = useState("")
  const { handleSideBar } = useNavBarStore()

  const color = circleColors[Math.floor(Math.random() * circleColors.length)]
  return (
    <TableRow
      onClick={() => {
        router.push("/mainapp/customers/details")
        // handleSideBar(true)
      }}
      key={item.id}
      className={`${index % 2 === 0 ? "bg-white" : "bg-gray-200"} cursor-pointer hover:bg-gray-100`}
    >
      <TableCell className="max-w-20 break-words py-3">{item.date}</TableCell>
      <TableCell className="max-w-20 break-words py-3">{item.user}</TableCell>
      <TableCell className="max-w-20 break-words py-3">
        <RatingCard score={item.rating} color={color} />
      </TableCell>
      <TableCell className="max-w-20 break-words py-3">
        {item.feedback}
      </TableCell>
    </TableRow>
  )
})

const ChatSupportSurvey = () => {
  const [customerList, setCustomerList] = useState(CUSTOMER_SURVEY)
  const [currentFilter, setCurrentFilter] = useState<
    "Today" | "Week" | "3 Months" | "9 Months" | "Custom Date" | string
  >("Today")
  const handleSort = (item: any) => {}

  return (
    <div className="flex w-full flex-col">
      <header className="flex w-3/5 flex-row gap-2 self-end">
        <div className="flex w-full flex-row items-center gap-2">
          <p className="w-full">Filter by date</p>
          <Dropdown
            options={["Today", "Week", "3 Months", "9 Months", "Custom Date"]}
            onChange={(value) => setCurrentFilter(value)}
            value={currentFilter}
          />
        </div>
        <div className="flex flex-row items-center gap-2">
          <p>From</p>
          <Input type="date" />
        </div>
        <div className="flex flex-row items-center gap-2">
          <p>To</p>
          <Input type="date" />
        </div>
      </header>
      <main>
        <div className="relative w-full rounded-md bg-white p-4 text-[#333333]">
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
                {customerList?.length === 0 ? (
                  <tr>
                    <td
                      colSpan={tableHeader?.length}
                      className="py-3 text-center"
                    >
                      No Customer list found
                    </td>
                  </tr>
                ) : (
                  CUSTOMER_SURVEY?.map((item, index) => (
                    <MemoizedTableRow
                      key={item?.id}
                      item={item}
                      index={index}
                    />
                  ))
                )}
              </TableBody>
            </Suspense>
          </Table>
        </div>
      </main>
    </div>
  )
}
export default ChatSupportSurvey
