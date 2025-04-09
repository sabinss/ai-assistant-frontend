import http from "@/config/http"
import useOrgCustomer from "@/store/organization_customer"
import useAuth from "@/store/user"
import React, { useEffect, useState } from "react"

export const SampleQuerySetup = () => {
  const { user_data, access_token } = useAuth() // Call useAuth here

  useEffect(() => {
    console.log("orgCustomers", user_data)
    async function fetchOrganizationQuery() {
      const res = await http.get("/organization/", {
        headers: { Authorization: `Bearer ${access_token}` },
      })
    }
    fetchOrganizationQuery()
  }, [user_data])
  return <div>SampleQuerySetup</div>
}
