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
import { SUPPORT_TICKETS } from "../constants/index"
import { useRouter } from "next/navigation"
import useNavBarStore from "@/store/store"

const tableHeader = [
  { name: "Opportunity", sortable: false },
  { name: "Product", sortable: false },
  { name: "Feature", sortable: false },
  { name: "Note", sortable: false },
  { name: "Stage", sortable: false },
  { name: "Recorded Date", sortable: false },
  { name: "Closed Date", sortable: false },
  { name: "Owner", sortable: false },
]

interface SupportTicket {
  id: number
  opportunity: string
  product: string
  feature: string
  notes: string
  stage: string
  recorded_date: string
  closed_date: string
  owner: string
}

const MemoizedTableRow = React.memo(
  ({ item, index }: { item: SupportTicket; index: number }) => {
    const router = useRouter()

    return (
      <TableRow
        onClick={() => {
          router.push("/mainapp/customers/details")
          // handleSideBar(true)
        }}
        key={item.id}
        className={`${index % 2 === 0 ? "bg-white" : "bg-gray-200"} w-full cursor-pointer hover:bg-gray-100`}
      >
        <TableCell className="max-w-20 break-words py-3">
          {item.opportunity}
        </TableCell>
        <TableCell className="max-w-20 break-words py-3">
          {item.product}
        </TableCell>
        <TableCell className="w-10 break-words py-3">
          {item.feature}
        </TableCell>
        <TableCell className="w-36 break-words py-3">
          {item.notes}
        </TableCell>
        <TableCell className="max-w-20 break-words py-3">
          {item.stage}
        </TableCell>
        <TableCell className="max-w-10 break-words py-3">
          {item.closed_date}
        </TableCell>
        <TableCell className="max-w-10 break-words py-3">
          {item.recorded_date}
        </TableCell>
        <TableCell className="max-w-24 break-words py-3">
          {item.owner}
        </TableCell>
      </TableRow>
    )
  }
)

const SupportTickets = () => {
  const [supportTickets, setsupportTickets] = useState(SUPPORT_TICKETS)
  return (
    <div className="w-full">
      <Table className="mt-2 w-full">
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
          <TableBody className="w-full">
            {supportTickets?.length === 0 ? (
              <tr>
                <td colSpan={tableHeader?.length} className="py-3 text-center">
                  No Customer list found
                </td>
              </tr>
            ) : (
              supportTickets?.map((item, index) => (
                <MemoizedTableRow key={item?.id} item={item} index={index} />
              ))
            )}
          </TableBody>
        </Suspense>
      </Table>
    </div>
  )
}

export default SupportTickets
