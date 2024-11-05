"use client"
import React, { useState, useEffect } from "react"
import { Line } from "react-chartjs-2"
import Chart from "chart.js/auto"
import { CategoryScale } from "chart.js"
import http from "@/config/http"
import { formatISO, subDays, addDays } from "date-fns"
import useAuth from "@/store/user"
import { CalendarDateRangePicker } from "./FeedbackDateRange"

Chart.register(CategoryScale)

const ConvoGraph = ({ customerId }: any) => {
  const [data, setData] = useState(null)
  const [range, setRange] = useState("daily")
  const { access_token, user_data } = useAuth()
  const [fromDate, setFromDate] = useState("2023-1-1")
  const [toDate, setToDate] = useState("2024-12-12")
  console.log("customerId==", fromDate, toDate, customerId)
  useEffect(() => {
    const fetchConversations = async () => {
      try {
        const response = await http.get(
          `/conversations/whole_organization?startDate=${fromDate}&endDate=${toDate}&customer_id=${customerId ? customerId : null}`,
          {
            headers: {
              Authorization: `Bearer ${access_token}`,
            },
          }
        )
        const conversationData = response?.data
        console.log({ conversationData })
        processData(conversationData)
      } catch (error) {
        console.error(error)
      }
    }

    const processData = (conversationData) => {
      const conversations = conversationData
      const startDate = new Date(
        Math.min(
          ...conversations.map(
            (conversation) => new Date(conversation.createdAt)
          )
        )
      )
      const endDate = new Date(
        Math.max(
          ...conversations.map(
            (conversation) => new Date(conversation.createdAt)
          )
        )
      )
      const dateRange = getDatesInRange(startDate, endDate, range)
      const chartData = {
        labels: dateRange.map((date) =>
          formatISO(date, { representation: "date" })
        ),
        datasets: [
          {
            label: "Total",
            data: dateRange.map((date) =>
              countConversationsOnDate(conversations, date)
            ),
            borderColor: "blue",
            backgroundColor: "blue",
          },
          {
            label: "Liked",
            data: dateRange.map((date) =>
              countLikedConversationsOnDate(conversations, date)
            ),
            borderColor: "green",
            backgroundColor: "green",
          },
          {
            label: "Disliked",
            data: dateRange.map((date) =>
              countDislikedConversationsOnDate(conversations, date)
            ),
            borderColor: "red",
            backgroundColor: "red",
          },
          // {
          //     label: 'Neutral',
          //     data: dateRange.map((date) => countNeutralConversationsOnDate(conversations, date)),
          //     borderColor: 'green',
          //     backgroundColor: 'green',
          // },
        ],
      }
      console.log("chartData", chartData)
      const options = {
        scales: {
          x: {
            type: "category",
          },
        },
      }

      setData({ data: chartData, options })
    }

    const getDatesInRange = (startDate, endDate, range) => {
      const dates = []
      let currentDate = startDate
      while (currentDate <= endDate) {
        dates.push(new Date(currentDate))
        if (range === "daily") {
          currentDate = addDays(currentDate, 1)
        } else if (range === "weekly") {
          currentDate = addDays(currentDate, 7)
        } else if (range === "monthly") {
          currentDate = new Date(
            currentDate.getFullYear(),
            currentDate.getMonth() + 1,
            1
          )
        }
      }
      return dates
    }

    const countConversationsOnDate = (conversations, date) => {
      return conversations.filter((conversation) => {
        const conversationDate = new Date(conversation.createdAt)
        return (
          conversationDate.getFullYear() === date.getFullYear() &&
          conversationDate.getMonth() === date.getMonth() &&
          conversationDate.getDate() === date.getDate()
        )
      }).length
    }

    const countLikedConversationsOnDate = (conversations, date) => {
      return conversations.filter((conversation) => {
        const conversationDate = new Date(conversation.createdAt)
        return (
          conversationDate.getFullYear() === date.getFullYear() &&
          conversationDate.getMonth() === date.getMonth() &&
          conversationDate.getDate() === date.getDate() &&
          conversation.liked_disliked === "liked"
        )
      }).length
    }

    const countDislikedConversationsOnDate = (conversations, date) => {
      return conversations.filter((conversation) => {
        const conversationDate = new Date(conversation.createdAt)
        return (
          conversationDate.getFullYear() === date.getFullYear() &&
          conversationDate.getMonth() === date.getMonth() &&
          conversationDate.getDate() === date.getDate() &&
          conversation.liked_disliked === "disliked"
        )
      }).length
    }

    // const countNeutralConversationsOnDate = (conversations, date) => {
    //     return conversations.filter((conversation) => {
    //         const conversationDate = new Date(conversation.createdAt);
    //         return (
    //             conversationDate.getFullYear() === date.getFullYear() &&
    //             conversationDate.getMonth() === date.getMonth() &&
    //             conversationDate.getDate() === date.getDate() &&
    //             !conversation.liked_disliked
    //         );
    //     }).length;
    // };

    fetchConversations()
  }, [range, fromDate, toDate])

  const handleRangeChange = (e) => {
    setRange(e.target.value)
  }

  return (
    <main>
      <div className="flex w-full justify-between">
        <div>
          <label htmlFor="range">View: </label>
          <select id="range" value={range} onChange={handleRangeChange}>
            <option value="daily">Daily</option>
            <option value="weekly">Weekly</option>
            <option value="monthly">Monthly</option>
          </select>
        </div>

        <div className="">
          <CalendarDateRangePicker
            setFromDate={setFromDate}
            setToDate={setToDate}
          />
        </div>
      </div>
      {data && <Line data={data?.data} options={data?.options} />}
    </main>
  )
}

export default ConvoGraph
