import React from "react"
import CustomerListTable from "./CustomerListTable"
import { CiUser } from "react-icons/ci"
import GlobalSearch from "@/components/shared/GlobalSearch"

const Customers = () => {
  return (
    <div className="bg-red h-fit w-full">
      <div className="flex items-center py-5">
        <div className="flex">
          <CiUser size={30} />
          <h1 className="px-2 text-2xl	 tracking-widest text-gray-600">
            CUSTOMERS
          </h1>
        </div>
        <GlobalSearch otherClasses="px-10" />
      </div>
      <CustomerListTable />
    </div>
  )
}

export default Customers
