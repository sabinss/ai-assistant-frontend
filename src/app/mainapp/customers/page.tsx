"use client"
import React, { useEffect } from "react"
import CustomerListTable from "./CustomerListTable"
import { CiUser } from "react-icons/ci"
import GlobalSearch from "@/components/shared/GlobalSearch"
import http from "@/config/http"
import useAuth from "@/store/user"
import useOrgCustomer from "@/store/organization_customer"

const Customers = () => {
  const { user_data, access_token } = useAuth()
  const { setLoading, loading, setOrgCustomers } = useOrgCustomer()

  useEffect(() => {
    async function getOrgCustomers() {
      try {
        setLoading(true)
        let res = await http.get(
          `/organization/${user_data?.organization}/customers`,
          {
            headers: { Authorization: `Bearer ${access_token}` },
          }
        )
        setOrgCustomers(res.data)
      } catch (err) {
      } finally {
        setLoading(false)
      }
    }
    getOrgCustomers()
  }, [])
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
      {loading ? (
        <div className="absolute left-0 top-0 z-50 flex h-full w-full items-center justify-center bg-gray-200 bg-opacity-50">
          <div className="h-12 w-12 animate-spin rounded-full border-b-2 border-t-2 border-gray-900"></div>
        </div>
      ) : (
        <CustomerListTable />
      )}
    </div>
  )
}

export default Customers
