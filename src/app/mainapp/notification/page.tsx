"use client"
import React, { useEffect, useState } from "react"
import { CiUser } from "react-icons/ci"
import NotificationListTable from "./NotificationTable"
import { Bell } from "lucide-react"
import http from "@/config/http"
import { toast } from "react-toastify"
import "react-toastify/dist/ReactToastify.css"
import useAuth from "@/store/user"
const Notification = () => {
  const [loading, setLoading] = useState(false)
  const { access_token } = useAuth()
  const [notifications, setNotifications] = useState([])

  const fetchOrgNotifications = async () => {
    try {
      const res = await http.get("/notification/", {
        headers: { Authorization: `Bearer ${access_token}` },
      })
      console.log("res", res.data)
      setNotifications(res?.data ?? [])
    } catch (err) {
      toast.error("Failed to fetch notifications")
    }
  }

  useEffect(() => {
    async function getNotifications() {
      await fetchOrgNotifications()
    }
    getNotifications()
  }, [])

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
        <NotificationListTable notifications={notifications} />
      )}
    </div>
  )
}

export default Notification
