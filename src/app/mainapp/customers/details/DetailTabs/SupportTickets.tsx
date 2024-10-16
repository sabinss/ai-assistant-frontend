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

const tableHeader = [
  { name: "Ticket No", sortable: false },
  { name: "Title", sortable: false },
  { name: "Reported By", sortable: false },
  { name: "Reported Date", sortable: false },
  { name: "Last Updated", sortable: false },
  { name: "Updated By", sortable: false },
  { name: "Status", sortable: false },
]

interface SupportTicket {
  ticket_no: number
  title: string
  reported_by: string
  reported_date: string
  last_updated: string
  updated_by: string
  status: string
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
        key={item.ticket_no}
        className={`${index % 2 === 0 ? "bg-white" : "bg-gray-200"} w-full cursor-pointer hover:bg-gray-100`}
      >
        <TableCell className="w-2 break-words py-3">
          {item.ticket_no}
        </TableCell>
        <TableCell className="max-w-20 break-words py-3">
          {item.title}
        </TableCell>
        <TableCell className="max-w-20 break-words py-3">
          {item.reported_by}
        </TableCell>
        <TableCell className="w-10 break-words py-3">
          {item.reported_date}
        </TableCell>
        <TableCell className="w-36 break-words py-3">
          {item.last_updated}
        </TableCell>
        <TableCell className="max-w-20 break-words py-3">
          {item.updated_by}
        </TableCell>
        <TableCell className="max-w-10 break-words py-3">
          {item.status}
        </TableCell>
      </TableRow>
    )
  }
)

const SupportTickets = () => {
  const [SupportTickets, setSupportTickets] = useState(SUPPORT_TICKETS)
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
            {SupportTickets?.length === 0 ? (
              <tr>
                <td colSpan={tableHeader?.length} className="py-3 text-center">
                  No Customer list found
                </td>
              </tr>
            ) : (
              SupportTickets?.map((item, index) => (
                <MemoizedTableRow
                  key={item?.ticket_no}
                  item={item}
                  index={index}
                />
              ))
            )}
          </TableBody>
        </Suspense>
      </Table>
    </div>
  )
}

export default SupportTickets
