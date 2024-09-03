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
import http from "@/config/http";
import TableFilter from "../commoncompnents/TableFilter";
import TablePagination from "../commoncompnents/TablePagination";
import { toast } from "react-toastify";
import "react-toastify/ReactToastify.min.css"
import useFormStore from "../../../store/formdata"
import useAuth from "@/store/user";

const tableHeader = [
  { name: "Email", sortable: true, sortKey: "email" },
  { name: "First Name", sortable: true, sortKey: "first_name" },
  { name: "Last Name", sortable: true, sortKey: "last_name" },
  { name: "Role", sortable: false },
  { name: "Created Date", sortable: true, sortKey: "createdAt" },
  { name: "Status", sortable: false },
  { name: 'Actions', sortable: false }
];

interface User {
  email: string;
  first_name: string;
  last_name: string;
  role: { name: string };
  createdAt: string;
  status: { name: string };
  _id: string;
}

const MemoizedTableRow = React.memo(({ item, index }: any) => {
  const { updateUserTable } = useFormStore();
  const { access_token } = useAuth(); // Call useAuth here

  const handleDelete = async (id: string) => {
    try {
      let res = await http.delete(`/user/${id}`, {
        headers: {
          Authorization: `Bearer ${access_token}`,
        }
      });
      if (res?.status === 201) {
        toast.error(res?.data.message);
      }
      else {
        toast.success(res?.data.message);
      }
      updateUserTable('deleteStatus', "deleted");
    } catch (error: any) {
      toast.error(error?.response.data.message)
    }
  };

  let style = "";
  switch (item?.status?.name) {
    case "active":
      style = "bg-green-500";
      break;
    case "deleted":
      style = "bg-red-500";
      break;
    case "pending":
      style = "bg-blue-500";
      break;
    default:
      style = "bg-slate-400";
  }

  return (
    <TableRow
      key={item._id}
      className={`${index % 2 === 0 ? "bg-white" : "bg-gray-200"
        } hover:bg-gray-100`}
    >
      <TableCell className="py-3 max-w-40 break-words">{item?.email}</TableCell>
      <TableCell className="py-3">{item?.first_name}</TableCell>
      <TableCell className="py-3">{item?.last_name}</TableCell>
      <TableCell className="py-3">{item?.role?.name}</TableCell>
      <TableCell className="py-3">{item?.createdAt}</TableCell>
      <TableCell className="py-3">
        <div
          className={`w-fit rounded-sm px-2 text-white ${style}`}
        >
          {item?.status?.name}
        </div>
      </TableCell>
      <TableCell className="py-3 flex items-center justify-center">
        <div className={`w-fit rounded-sm px-2 cursor-pointer`}>
          <Link href={`/mainapp/users/edit/${item._id}`}><EditIcon /></Link>
        </div>
        <div className={`w-fit rounded-sm px-2 cursor-pointer`}>
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <TrashIcon />
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                <AlertDialogDescription>
                  This action cannot be undone. This will permanently delete your
                  account and remove your data from our servers.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>
                  <button className="px-3 py-1">
                    Cancel
                  </button>
                </AlertDialogCancel>
                <AlertDialogAction className="px-5 py-1 bg-red-500 rounded-sm hover:bg-red-600">
                  <button className="text-red-50  px-3 py-1" onClick={() => handleDelete(item?._id)}>Delete</button>
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </TableCell>
    </TableRow>
  );
});

export default function UsersTable() {
  const { userTable, updateUserTable } = useFormStore();
  const { sortColumn, sortOrder, search, limit, page, users, totalPages, deleteStatus } = userTable;
  const { access_token } = useAuth(); // Call useAuth here
  const [isLoading, setIsLoading] = useState(false);

  const handleSort = useCallback((sortKey: string) => {
    if (sortColumn === sortKey) {
      updateUserTable('sortOrder', sortOrder === "asc" ? "desc" : "asc");
    } else {
      updateUserTable('sortColumn', sortKey);
      updateUserTable('sortOrder', "asc");
    }
  }, [sortColumn, sortOrder, updateUserTable]);

  const sortedUsers = useMemo(() => {
    if (!sortColumn) return users;

    const sortedData = [...users].sort((a, b) => {
      const aValue = a[sortColumn as keyof User];
      const bValue = b[sortColumn as keyof User];

      if (aValue < bValue) return sortOrder === "asc" ? -1 : 1;
      if (aValue > bValue) return sortOrder === "asc" ? 1 : -1;
      return 0;
    });

    return sortedData;
  }, [users, sortColumn, sortOrder]);

  const filteredUsers = useMemo(() => {
    if (!search) return sortedUsers;
    const lowerCaseSearch = search.toLowerCase();
    return sortedUsers.filter(user =>
      Object.values(user).some(value =>
        value?.toString().toLowerCase().includes(lowerCaseSearch)
      )
    );
  }, [search, sortedUsers]);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        setIsLoading(true);
        const response = await http.get<{ users: User[]; totalPages: number }>(`/users?page=${page}&search=${search}&sortField=${sortColumn}&sortDirection=${sortOrder}&limit=${limit}`, {
          headers: { Authorization: `Bearer ${access_token}` }
        });
        updateUserTable('users', response.data.users);
        updateUserTable('totalPages', response.data.totalPages);
      } catch (error: any) {
        console.error(error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchUsers();
  }, [page, search, sortColumn, sortOrder, limit, deleteStatus]);

  return (
    <div className="w-full bg-white rounded-md p-4 text-[#333333] relative">
      {isLoading && (
        <div className="absolute top-0 left-0 w-full h-full flex items-center justify-center bg-gray-200 bg-opacity-50 z-50">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-gray-900"></div>
        </div>
      )}
      <div className="w-full flex flex-col md:flex-row md:justify-end gap-2">
        <TableFilter parentComponent="userstable" />
        <button className="flex gap-2 rounded-md bg-[#174894] px-4 py-2 max-w-36 text-white">
          <PlusCircle strokeWidth="2px" />
          <span className="mt-0.5"> <Link href={"/mainapp/users/add"}>  Add User </Link> </span>
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
            {filteredUsers?.length === 0 ? (
              <tr>
                <td colSpan={tableHeader?.length} className="py-3 text-center">
                  No users found
                </td>
              </tr>
            ) : (
              filteredUsers?.map((item, index) => (
                <MemoizedTableRow key={item._id} item={item} index={index} />
              ))
            )}
          </TableBody>
        </Suspense>
      </Table>
      <TablePagination parentComponent="userstable" />
    </div>
  );
}