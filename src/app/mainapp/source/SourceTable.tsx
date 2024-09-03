"use client"
import React, { Suspense, useEffect, useMemo, useCallback, useState } from "react";
import { PlusCircle, TrashIcon, EditIcon, MoveDown, MoveUp } from "lucide-react";
import Link from "next/link"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
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
import http, { HTTPCHAT } from "@/config/http";
import TableFilter from "../commoncompnents/TableFilter";
import TablePagination from "../commoncompnents/TablePagination";
import { toast } from "react-toastify";
import "react-toastify/ReactToastify.min.css"
import useFormStore from "../../../store/formdata"
import useAuth from "@/store/user";

const tableHeader = [
  { name: "Source File", sortable: true, sortKey: "sourceFile" },
  // { name: "Date Processed", sortable: false, sortKey: "dateProcessed" },
  { name: "Actions", sortable: false },
];

interface Source {
  sourceFile: string;
  dataProcessed: string;
  status: string;
  _id: string;
}

const MemoizedTableRow = React.memo(({ item, index }: any) => {
  const { updateSourceTable } = useFormStore();
  const { user_data } = useAuth();
  const handleDelete = async (name: string) => {
    try {
      const res = await http.deletePdf(user_data?.organization, [name]);
      // await http.delete(`/sources/${id}`);
      updateSourceTable('status', 'delete');
      toast.success("Source Deleted Successfully")
      // updateSourceTable('sources', prevSources => prevSources.filter(source => source._id !== id));
    } catch (error: any) {
      console.log("error is ", error)
      toast.error(error?.response?.data?.message)
    }
  };

  let style = "";
  switch (item?.status) {
    case "new":
      style = "bg-green-500";
      break;
    case "removed":
      style = "bg-red-500";
      break;
    default:
      style = "bg-blue-400";
  }

  return (
    <TableRow
      key={item._id}
      className={`${index % 2 === 0 ? "bg-white" : "bg-gray-200"
        } hover:bg-gray-100`}
    >
      <TableCell className="py-3 max-w-40 break-words">{item}</TableCell>
      {/* <TableCell className="py-3">{item?.createdAt}</TableCell> */}
      <TableCell className="py-3 flex items-center justify-center">
        <div className={`w-fit rounded-sm px-2 cursor-pointer`}>
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
                  <button className="px-3 py-1">
                    Cancel
                  </button>
                </AlertDialogCancel>
                <AlertDialogAction className="px-5 py-1 bg-red-500 rounded-sm hover:bg-red-600">
                  <button className="text-red-50  px-3 py-1" onClick={() => handleDelete(item)}>Delete</button>
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </TableCell>
    </TableRow>
  );
});

export default function SourcesTable() {
  const { sourceTable, updateSourceTable } = useFormStore();
  const { sortColumn, sortOrder, search, limit, page, sources, totalPages, status } = sourceTable;
  const { user_data } = useAuth();
  const [isLoading, setIsLoading] = useState(false);

  const handleSort = useCallback((sortKey: string) => {
    if (sortColumn === sortKey) {
      updateSourceTable('sortOrder', sortOrder === "asc" ? "desc" : "asc");
    } else {
      updateSourceTable('sortColumn', sortKey);
      updateSourceTable('sortOrder', "asc");
    }
  }, [sortColumn, sortOrder, updateSourceTable]);

  const sortedSources = useMemo(() => {
    if (!sortColumn) return sources;

    const sortedData = [...sources].sort((a, b) => {
      const aValue = a[sortColumn as keyof Source];
      const bValue = b[sortColumn as keyof Source];

      if (aValue < bValue) return sortOrder === "asc" ? -1 : 1;
      if (aValue > bValue) return sortOrder === "asc" ? 1 : -1;
      return 0;
    });

    return sortedData;
  }, [sources, sortColumn, sortOrder]);

  const filteredSources = useMemo(() => {
    if (!search) return sortedSources;
    const lowerCaseSearch = search.toLowerCase();
    return sortedSources.filter(source =>
      Object.values(source).some(value =>
        value?.toString().toLowerCase().includes(lowerCaseSearch)
      )
    );
  }, [search, sortedSources]);

  useEffect(() => {
    const fetchSources = async () => {
      try {
        setIsLoading(true);
        const response = await http.getPdfList(user_data?.organization, {
          page,
          limit,
          sortColumn,
          sortOrder,
          search,
          status
        });

        updateSourceTable('sources', response?.results?.files);
        updateSourceTable('totalPages', response?.totalPages);
      } catch (error: any) {
        console.error(error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchSources();
  }, [page, search, sortColumn, sortOrder, limit, updateSourceTable, status]);

  return (
    <div className="w-full bg-white rounded-md p-4 text-[#333333] relative">
      {isLoading && (
        <div className="absolute top-0 left-0 w-full h-full flex items-center justify-center bg-gray-200 bg-opacity-50 z-50">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-gray-900"></div>
        </div>
      )}
      <div className="w-full flex flex-col md:flex-row gap-2 md:justify-end">
        <TableFilter parentComponent="sourcestable" />
        <button className="flex gap-2 rounded-md bg-[#174894] max-w-40  px-4 py-2 text-white">
          <PlusCircle strokeWidth="2px" />
          <span className=""> <Link href={"/mainapp/source/add"}>  Add Source </Link> </span>
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
                    <div className="flex justify-center items-center p-0">
                      <MoveUp size={15} className={`${(sortColumn === item.sortKey) && (sortOrder === "asc") ? 'text-[#fff] ' : 'text-gray-400'}`} />
                      <MoveDown size={15} className={`ml-[-6px] ${(sortColumn === item.sortKey) && (sortOrder === "desc") ? 'text-[#fff]' : 'text-gray-400'}`} />
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
  );
}