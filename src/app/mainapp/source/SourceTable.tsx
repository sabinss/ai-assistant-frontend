"use client"
import React, {
  Suspense,
  useEffect,
  useMemo,
  useCallback,
  useState,
} from "react"
import { PlusCircle, TrashIcon, EditIcon, MoveDown, MoveUp } from "lucide-react"
import Link from "next/link"
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
import http, { HTTPCHAT } from "@/config/http"
import TableFilter from "../commoncompnents/TableFilter"
import TablePagination from "../commoncompnents/TablePagination"
import { toast } from "react-toastify"
import "react-toastify/ReactToastify.min.css"
import useFormStore from "../../../store/formdata"
import useAuth from "@/store/user"

const tableHeader = [
  { name: "Source File", sortable: true, sortKey: "sourceFile" },
  // { name: "Date Processed", sortable: false, sortKey: "dateProcessed" },
  { name: "Actions", sortable: false },
]

interface Source {
  sourceFile: string
  dataProcessed: string
  status: string
  _id: string
}

const MemoizedTableRow = React.memo(({ item, index }: any) => {
  const { updateSourceTable } = useFormStore()
  const { user_data } = useAuth()
  const handleDelete = async (name: string) => {
    try {
      const res = await http.deletePdf(user_data?.organization, [name])
      // await http.delete(`/sources/${id}`);
      updateSourceTable("status", "delete")
      toast.success("Source Deleted Successfully")
      // updateSourceTable('sources', prevSources => prevSources.filter(source => source._id !== id));
    } catch (error: any) {
      console.log("error is ", error)
      toast.error(error?.response?.data?.message)
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
    default:
      style = "bg-blue-400"
  }

  return (
    <TableRow
      key={item._id}
      className={`${
        index % 2 === 0 ? "bg-white" : "bg-gray-200"
      } hover:bg-gray-100`}
    >
      <TableCell className="max-w-40 break-words py-3">{item}</TableCell>
      {/* <TableCell className="py-3">{item?.createdAt}</TableCell> */}
      <TableCell className="flex items-center justify-center py-3">
        <div className={`w-fit cursor-pointer rounded-sm px-2`}>
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <TrashIcon />
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                <AlertDialogDescription>
                  This action cannot be undone. This will permanently delete the
                  source and remove its data from our servers.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>
                  <button className="px-3 py-1">Cancel</button>
                </AlertDialogCancel>
                <AlertDialogAction className="rounded-sm bg-red-500 px-5 py-1 hover:bg-red-600">
                  <button
                    className="px-3  py-1 text-red-50"
                    onClick={() => handleDelete(item)}
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

export default function SourcesTable() {
  const { sourceTable, updateSourceTable } = useFormStore()
  const {
    sortColumn,
    sortOrder,
    search,
    limit,
    page,
    sources,
    totalPages,
    status,
  } = sourceTable
  const { user_data, access_token } = useAuth()
  const [isLoading, setIsLoading] = useState(false)

  const handleSort = useCallback(
    (sortKey: string) => {
      if (sortColumn === sortKey) {
        updateSourceTable("sortOrder", sortOrder === "asc" ? "desc" : "asc")
      } else {
        updateSourceTable("sortColumn", sortKey)
        updateSourceTable("sortOrder", "asc")
      }
    },
    [sortColumn, sortOrder, updateSourceTable]
  )

  const sortedSources = useMemo(() => {
    if (!sortColumn) return sources

    const sortedData = [...sources].sort((a, b) => {
      const aValue = a[sortColumn as keyof Source]
      const bValue = b[sortColumn as keyof Source]

      if (aValue < bValue) return sortOrder === "asc" ? -1 : 1
      if (aValue > bValue) return sortOrder === "asc" ? 1 : -1
      return 0
    })

    return sortedData
  }, [sources, sortColumn, sortOrder])

  const filteredSources = useMemo(() => {
    if (!search) return sortedSources
    const lowerCaseSearch = search.toLowerCase()
    return sortedSources.filter((source) =>
      Object.values(source).some((value) =>
        value?.toString().toLowerCase().includes(lowerCaseSearch)
      )
    )
  }, [search, sortedSources])

  useEffect(() => {
    const fetchSources = async () => {
      try {
        setIsLoading(true)

        const params = {
          company_id: user_data?.organization || 0,
          page: page || 1,
          search: search || "",
          sortField: sortColumn || "",
          sortDirection: sortOrder || "",
          limit: limit || 10,
        }
        // const response = await http.getPdfList(user_data?.organization, {
        //   page,
        //   limit,
        //   sortColumn,
        //   sortOrder,
        //   search,
        //   status,
        // })

        const result = await http.get(
          `/organization/source/file/list?company_id=${params.company_id}&page=${params.page}&search=${params.search}&sortField=${params.sortField}&sortDirection=${params.sortDirection}&limit=${params.limit}`,
          {
            headers: { Authorization: `Bearer ${access_token}` },
          }
        )

        const response = result?.data

        updateSourceTable("sources", response?.results?.files)
        updateSourceTable("totalPages", response?.totalPages)
      } catch (error: any) {
        console.error(error)
      } finally {
        setIsLoading(false)
      }
    }
    fetchSources()
  }, [page, search, sortColumn, sortOrder, limit, updateSourceTable, status])

  return (
    <div className="relative w-full rounded-md bg-white p-4 text-[#333333]">
      {isLoading && (
        <div className="absolute left-0 top-0 z-50 flex h-full w-full items-center justify-center bg-gray-200 bg-opacity-50">
          <div className="h-12 w-12 animate-spin rounded-full border-b-2 border-t-2 border-gray-900"></div>
        </div>
      )}
      <div className="flex w-full flex-col gap-2 md:flex-row md:justify-end">
        <TableFilter parentComponent="sourcestable" />
        <button className="flex max-w-40 gap-2 rounded-md bg-[#174894]  px-4 py-2 text-white">
          <PlusCircle strokeWidth="2px" />
          <span className="">
            {" "}
            <Link href={"/mainapp/source/add"}> Add Source </Link>{" "}
          </span>
        </button>
      </div>
      <Table className="mt-2">
        <TableHeader>
          <TableRow className="bg-[#174894]">
            {tableHeader?.map((item, index) => (
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
                        className={`${sortColumn === item.sortKey && sortOrder === "asc" ? "text-[#fff] " : "text-gray-400"}`}
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
            {filteredSources?.length === 0 ? (
              <tr>
                <td colSpan={tableHeader?.length} className="py-3 text-center">
                  No sources found
                </td>
              </tr>
            ) : (
              filteredSources?.map((item, index) => (
                <MemoizedTableRow key={item._id} item={item} index={index} />
              ))
            )}
          </TableBody>
        </Suspense>
      </Table>
      <TablePagination parentComponent="sourcestable" />
    </div>
  )
}
