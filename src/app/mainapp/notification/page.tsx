"use client"
import React, { useState } from "react"
import { CiUser } from "react-icons/ci"
import NotificationListTable from "./NotificationTable"
import { Bell } from "lucide-react"

const Notification = () => {
  const [loading, setLoading] = useState(false)
  return (
    <div className="bg-red h-fit w-full">
      <div className="flex items-center py-5">
        <div className="flex items-center">
          <Bell />
          <h1 className="px-2 text-2xl	 tracking-widest text-gray-600">
            Notifications
          </h1>
        </div>
      </div>
      {loading ? (
        <div className="absolute left-0 top-0 z-50 flex h-full w-full items-center justify-center bg-gray-200 bg-opacity-50">
          <div className="h-12 w-12 animate-spin rounded-full border-b-2 border-t-2 border-gray-900"></div>
        </div>
      ) : (
        <NotificationListTable />
      )}
    </div>
  )
}

export default Notification
