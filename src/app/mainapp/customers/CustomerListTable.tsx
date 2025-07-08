"use client"
import React, { Suspense, useState, useMemo } from "react"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { CUSTOMER_LIST_STAGES } from "@/app/constants"
import Chip from "@/components/ui/customerlist-ui/chip"
import Score from "@/components/ui/customerlist-ui/Score"
import Dropdown from "../commoncompnents/DropDown"
import { useRouter } from "next/navigation"
import useNavBarStore from "@/store/store"
import useOrgCustomer from "@/store/organization_customer"
import { timeAgo } from "@/utility"
import http from "@/config/http"
import useAuth from "@/store/user"
import { toast } from "react-toastify"
import "react-toastify/dist/ReactToastify.css"

// const tableHeader = [
//   { name: "Name", sortable: false },
//   { name: "Health Score", sortable: false },
//   { name: "CSM Score", sortable: false },
//   { name: "ARR (k)", sortable: false },
//   { name: "Last Seen", sortable: true, sortKey: "last_seen" },
//   { name: "Last Comm", sortable: true, sortKey: "status" },
//   { name: "Stage", sortable: true, sortKey: "createdAt" },
//   // { name: "Analytics", sortable: false },
//   // { name: "Reporting", sortable: false },
// ]
const tableHeader = [
  { name: "Name", sortable: false },
  { name: "Health Score", sortable: false },
  { name: "Churn Risk", sortable: false },
  { name: "Expansion Opp", sortable: true, sortKey: "last_seen" },
  { name: "ARR (k)", sortable: false },
  { name: "Renewal Time", sortable: true, sortKey: "status" },
  { name: "Renewal Duration", sortable: true, sortKey: "status" },
  { name: "Stage", sortable: true, sortKey: "createdAt" },
]
// Color mappings based on score
const getScoreColorClass = (score: number, type: "health" | "risk"): string => {
  const riskLevels = [
    { min: 0, max: 20, className: "bg-red-600" },
    { min: 21, max: 40, className: "bg-orange-500" },
    { min: 41, max: 60, className: "bg-yellow-400" },
    { min: 61, max: 80, className: "bg-blue-500" },
    { min: 81, max: 100, className: "bg-green-600" },
  ]

  const levels = type === "health" ? [...riskLevels].reverse() : riskLevels
  const match = levels.find(({ min, max }) => score >= min && score <= max)
  return match?.className ?? "bg-gray-400"
}
const circleColors = ["bg-yellow-500", "bg-red-500", "bg-green-500"]

const MemoizedTableRow = React.memo(({ item, index }: any) => {
  const { access_token } = useAuth()

  const router = useRouter()
  const [selectStage, setStage] = useState("")
  const { handleSideBar } = useNavBarStore()
  const healthScore = item?.redShiftCustomer?.health_score
  const riskScore = item?.redShiftCustomer?.churn_risk_score
  const oppScore = item?.redShiftCustomer?.expansion_opp_score

  const healthColorClass = useMemo(
    () => getScoreColorClass(healthScore ?? 0, "health"),
    [healthScore]
  )
  const riskColor = useMemo(
    () => getScoreColorClass(riskScore ?? 0, "risk"),
    [riskScore]
  )
  const oppColor = useMemo(
    () => getScoreColorClass(oppScore ?? 0, "health"),
    [oppScore]
  ) // same as health scale
  const color = circleColors[Math.floor(Math.random() * circleColors.length)]
  return (
    <TableRow
      onClick={() => {
        // router.push(`/mainapp/customers/details?name=${item.name}`)
        // handleSideBar(true)
      }}
      key={item._id}
      className={`${index % 2 === 0 ? "bg-white" : "bg-gray-200"} cursor-pointer hover:bg-gray-100`}
    >
      <TableCell className="max-w-20 break-words py-3">{item.name}</TableCell>
      <TableCell className="max-w-20 break-words py-3">
        {healthScore ? (
          <Chip
            value={healthScore}
            otherClasses={`text-white font-bold w-9 h-9  text-white flex items-center justify-center ${healthColorClass}`}
          />
        ) : (
          "N/A"
        )}
      </TableCell>
      <TableCell className="max-w-20 break-words py-3">
        {/* <Score score={item.health_score} otherClasses="" color={color} />
         */}
        {riskScore ? (
          <Chip
            value={riskScore}
            otherClasses={`text-white w-9 h-9  font-bold  text-white flex items-center justify-center ${healthColorClass}`}
          />
        ) : (
          "N/A"
        )}
      </TableCell>

      <TableCell className="max-w-20 break-words py-3">
        {oppScore ? (
          <Chip
            value={oppScore}
            otherClasses={`text-white font-bold w-9 h-9  text-white flex items-center justify-center ${oppColor}`}
          />
        ) : (
          "N/A"
        )}
      </TableCell>
      <TableCell className="max-w-20 break-words py-3">{item.arr}</TableCell>

      <TableCell className="max-w-20 break-words py-3">
        {timeAgo(item.updatedAt)}
      </TableCell>
      <TableCell className="max-w-20 break-words py-3">
        {/* {timeAgo(item.updatedAt)} */}
        12 months
      </TableCell>
      <TableCell className="max-w-21 break-words py-3">
        <Dropdown
          options={CUSTOMER_LIST_STAGES}
          value={selectStage || item?.stage || "Adopted"}
          onChange={async (value) => {
            setStage(value)
            try {
              await http.put(
                `/customer/${item._id}`,
                { stage: value },
                {
                  headers: { Authorization: `Bearer ${access_token}` },
                }
              )
              toast.success("Stage updated successfully")
            } catch (err: any) {
              toast.error(err?.message || "Failed to save stage")
            }
          }}
        />
      </TableCell>
    </TableRow>
  )
})
export default function CustomerListTable() {
  const { orgCustomers } = useOrgCustomer()
  const handleSort = (item: any) => {}
  console.log("OrgCustomers table list", orgCustomers)

  return (
    <div className="relative mb-10 w-full overflow-y-auto rounded-md bg-white p-4 text-[#333333]">
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
            {orgCustomers?.customers.length === 0 ? (
              <tr>
                <td colSpan={tableHeader?.length} className="py-3 text-center">
                  No Customer list found
                </td>
              </tr>
            ) : (
              orgCustomers?.customers?.map((item: any, index) => (
                <MemoizedTableRow key={item?._id} item={item} index={index} />
              ))
            )}
          </TableBody>
        </Suspense>
      </Table>
    </div>
  )
}
