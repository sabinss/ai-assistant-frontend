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
import { CUSTOMER_LIST, CUSTOMER_LIST_STAGES } from "@/app/constants"
import Chip from "@/components/ui/customerlist-ui/chip"
import Score from "@/components/ui/customerlist-ui/Score"
import Dropdown from "../commoncompnents/DropDown"
import { useRouter } from "next/navigation"
import useNavBarStore from "@/store/store"

const tableHeader = [
  { name: "Name", sortable: false },
  { name: "Health Score", sortable: false },
  { name: "CSM Score", sortable: false },
  { name: "ARR (k)", sortable: false },
  { name: "Last Seen", sortable: true, sortKey: "last_seen" },
  { name: "Last Comm", sortable: true, sortKey: "status" },
  { name: "Stage", sortable: true, sortKey: "createdAt" },
  // { name: "Analytics", sortable: false },
  // { name: "Reporting", sortable: false },
]

const circleColors = ["bg-yellow-500", "bg-red-500", "bg-green-500"]
const MemoizedTableRow = React.memo(({ item, index }: any) => {
  const router = useRouter()
  const [selectStage, setStage] = useState("")
  const { handleSideBar } = useNavBarStore()

  const color = circleColors[Math.floor(Math.random() * circleColors.length)]
  return (
    <TableRow
      onClick={async () => {
        await router.push("/mainapp/customers/details", { scroll: false })
        handleSideBar(true)
      }}
      key={item._id}
      className={`${index % 2 === 0 ? "bg-white" : "bg-gray-200"} cursor-pointer hover:bg-gray-100`}
    >
      <TableCell className="max-w-20 break-words py-3">
        {item.customerName}
      </TableCell>
      <TableCell className="max-w-20 break-words py-3">
        <Chip
          value={item.health}
          otherClasses="bg-green-500 text-white font-bold"
        />
      </TableCell>
      <TableCell className="max-w-20 break-words py-3">
        <Score score={item.score} otherClasses="" color={color} />
      </TableCell>
      <TableCell className="max-w-20 break-words py-3">{item.arr}</TableCell>

      <TableCell className="max-w-20 break-words py-3">
        {item.lastSeen}
      </TableCell>
      <TableCell className="max-w-20 break-words py-3">
        {item.lastTouch}
      </TableCell>
      <TableCell className="max-w-21 break-words py-3">
        <Dropdown
          options={CUSTOMER_LIST_STAGES}
          value={item.stage}
          onChange={(value) => setStage(value)}
        />
      </TableCell>
    </TableRow>
  )
})
export default function CustomerListTable() {
  const [customerList, setCustomerList] = useState(CUSTOMER_LIST)
  const handleSort = (item: any) => {}
  return (
    <div className="relative w-full rounded-md bg-white p-4 text-[#333333]">
      {/* table filter */}
      {/* table */}
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
                <td colSpan={tableHeader?.length} className="py-3 text-center">
                  No Customer list found
                </td>
              </tr>
            ) : (
              CUSTOMER_LIST?.map((item, index) => (
                <MemoizedTableRow key={item?.id} item={item} index={index} />
              ))
            )}
          </TableBody>
        </Suspense>
      </Table>
    </div>
  )
}
