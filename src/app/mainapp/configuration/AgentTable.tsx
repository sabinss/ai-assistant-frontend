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
import e from "express"

const tableHeader = [
  { name: "Name", sortable: false },
  { name: "Objective", sortable: false },
]
const MemoizedTableRow = React.memo(({ item, index, handleEdit }: any) => {
  return (
    <TableRow
      key={item._id}
      className={`${index % 2 === 0 ? "bg-white" : "bg-gray-200"} cursor-pointer hover:bg-gray-100`}
    >
      <TableCell className="max-w-20 break-words py-3">{item.name}</TableCell>

      <TableCell className="max-w-20 break-words py-3">
        {item.objective}
      </TableCell>
    </TableRow>
  )
})
export const AgentTable = () => {
  const agentList = [
    {
      name: "Test",
      objective: "Objective",
    },
  ]
  return (
    <div className="relative mb-10 w-full overflow-y-auto rounded-md bg-white p-4 text-[#333333]">
      <div className="flex justify-end p-3">
        <button
          onClick={() => {}}
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
            {agentList?.length === 0 ? (
              <tr>
                <td colSpan={tableHeader?.length} className="py-3 text-center">
                  No Agent list found
                </td>
              </tr>
            ) : (
              agentList?.map((item: any, index) => (
                <MemoizedTableRow
                  key={item?._id}
                  item={item}
                  index={index}
                  handleEdit={() => {}}
                />
              ))
            )}
          </TableBody>
        </Suspense>
      </Table>
    </div>
  )
}
