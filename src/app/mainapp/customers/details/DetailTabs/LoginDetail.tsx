import React, { Suspense, useState } from "react"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import moment from "moment"
import { Button } from "@/components/ui/button"
const MemoizedTableRow = React.memo(({ item, index }: any) => {
  return (
    <TableRow
      key={item._id}
      className={`${index % 2 === 0 ? "bg-white" : "bg-gray-200"} cursor-pointer hover:bg-gray-100`}
    >
      <TableCell className="max-w-20 break-words py-3">{index + 1}</TableCell>
      <TableCell className="max-w-20 break-words py-3">
        {moment(item.date).format("YYYY/MM/DD")}
      </TableCell>

      <TableCell className="max-w-20 break-words py-3">{item.email}</TableCell>
    </TableRow>
  )
})

const LoginDetail = ({ loginDetail = [] }: any) => {
  const tableHeader = [
    { name: "S.N", sortable: false },
    { name: "Date", sortable: false },
    { name: "Email", sortable: false },
  ]

  return (
    <div className="relative mb-10 w-full overflow-y-auto rounded-md bg-white p-4 text-[#333333]">
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
            {loginDetail.length === 0 ? (
              <tr>
                <td colSpan={tableHeader?.length} className="py-3 text-center">
                  No Login Detail Record found.
                </td>
              </tr>
            ) : (
              loginDetail.map((item: any, index: any) => (
                <MemoizedTableRow key={item?._id} item={item} index={index} />
              ))
            )}
          </TableBody>
        </Suspense>
      </Table>
    </div>
  )
}

export default LoginDetail
