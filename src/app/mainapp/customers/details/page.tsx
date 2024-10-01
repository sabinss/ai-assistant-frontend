"use client"
import Score from "@/components/ui/customerlist-ui/Score"
import { RxCross2 } from "react-icons/rx"
import Chip from "@/components/ui/customerlist-ui/chip"
import { MdOutlineModeEdit } from "react-icons/md"
import { LuArrowRightSquare } from "react-icons/lu"
import useNavBarStore from "@/store/store"
import { useEffect, useState } from "react"
import { VscGraphLine } from "react-icons/vsc"
import { AiOutlineAccountBook } from "react-icons/ai"
import { FaArrowUpRightFromSquare } from "react-icons/fa6"
import { useSearchParams } from "next/navigation"

import { Line } from "react-chartjs-2"
import {
  Chart as ChartJS,
  LinearScale,
  CategoryScale,
  LineElement,
  PointElement,
  Legend,
  Title,
} from "chart.js"
import { TbDevicesSearch } from "react-icons/tb"
import useOrgCustomer from "@/store/organization_customer"
import useAuth from "@/store/user"
import useFetchOrgCustomers from "@/hooks/useFetchOrgCustomers"
import ChatConversation from "./DetailTabs/ChatConversation"

ChartJS.register(
  LinearScale,
  CategoryScale,
  LineElement,
  PointElement,
  Legend,
  Title
)

const CustomerInfo = () => {
  return (
    <>
      {/* customer name */}
      <div>
        <div className="flex justify-between py-8 text-primaryblue">
          <div>
            <span className="text-xl font-bold text-primaryblue">
              Esewa Payment
            </span>
            <Score score={4} otherClasses="" color={"bg-green-500"} />
          </div>
          <div>
            <Chip
              value={10.0}
              otherClasses="bg-green-500 text-white font-bold"
            />
          </div>
        </div>
        <div>
          <span className="text-gray-400">
            Provide users with a seamless, secure payment experience, enabling
            quick transactions, easy bill splitting, and hassle-free money
            management on the go
          </span>
        </div>
      </div>
    </>
  )
}

const Row = ({ data }: any) => {
  return (
    <>
      <div className="mt-10 flex justify-between">
        <span className="text-lg text-gray-500">{data.key}</span>
        <span className="text-lg text-gray-400">{data.value}</span>
      </div>
      <div className="mt-3 h-px w-full bg-gray-300 "></div>
    </>
  )
}

const CustomerDetails = ({ customerInfo }: any) => {
  return (
    <div className="mt-10">
      <div className="flex justify-between">
        <h1 className="text-lg  font-bold text-primaryblue ">
          Customer Details
        </h1>
        <div className="flex items-center">
          <MdOutlineModeEdit color="#1230AE" size={20} />
          <span className="ml-1  text-lg font-bold text-primaryblue">Edit</span>
        </div>
      </div>
      <Row data={{ key: "Name", value: customerInfo.name }} />
      <Row data={{ key: "Contact", value: "John Felix" }} />
      <Row data={{ key: "Email", value: customerInfo.email }} />
      <Row data={{ key: "ARR", value: customerInfo.arr }} />
      <Row data={{ key: "Renewal date", value: customerInfo.updatedAt }} />
      <Row
        data={{
          key: "No. of License purchase",
          value: customerInfo.licenses_purchased,
        }}
      />
      <Row
        data={{ key: "No. of License used", value: customerInfo.licenses_used }}
      />
      <Row data={{ key: "CSM agents", value: customerInfo.csm_agent }} />
    </div>
  )
}

const TabList = ({ showDetail, handleChange }: any) => {
  const [activeTab, setActiveTab] = useState("Overview")

  const tabList = [
    "Overview",
    "Chat conversation",
    "User sentiment",
    "CHat Support Surveys",
    "CSM activities",
    "Support tickets",
    "Login Details",
    "Feature Usage",
    "Upsell Oppurtunities",
  ]

  return (
    <div className="flex flex-wrap">
      {tabList.map((tab, index) => {
        return (
          <div
            onClick={() => {
              setActiveTab(tab)
              handleChange(tab)
            }}
            key={index} // Always include a key prop when rendering lists
            className={`items-cente2 mx-1 mb-2 flex cursor-pointer justify-center rounded-md p-2 ${
              tab === activeTab ? "bg-primaryblue" : "bg-gray-400"
            }`}
          >
            <span className="font-bold text-white"> {tab}</span>
          </div>
        )
      })}
    </div>
  )
}

const Metrics = ({
  showDetail,
  customerInfo,
}: {
  showDetail?: boolean
  customerInfo: any
}) => {
  const metricsRecords = [
    {
      name: "Login count",
      icon: <LuArrowRightSquare color="white" size={30} />,
      count: customerInfo?.login_count,
    },
    {
      name: "Main feature usage count",
      icon: <TbDevicesSearch color="white" size={30} />,
      count: customerInfo?.main_feature_usage_count,
    },
    {
      name: "Ticket count",
      icon: <AiOutlineAccountBook color="white" size={30} />,
      count: customerInfo?.total_ticket_count,
    },
    {
      name: "Open Ticket count",
      icon: <FaArrowUpRightFromSquare color="white" size={30} />,
      count: customerInfo?.open_ticket_count,
    },
    {
      name: "Close Ticket count",
      icon: <LuArrowRightSquare color="white" size={30} />,
      count: customerInfo?.closed_ticket_count,
    },
    {
      name: "Escalated Ticket",
      icon: <VscGraphLine color="white" size={30} />,
      count: customerInfo?.escalated_ticket,
    },
  ]
  return (
    <div className="mt-3 flex w-full flex-wrap">
      {metricsRecords.map((record, index) => {
        return (
          <div
            key={index}
            className={`mx-2 mb-4 flex h-24 ${showDetail ? " w-[43%]" : " w-[23%]"} items-center justify-between rounded-md border border-gray-300 p-2 shadow-lg`}
          >
            <div className="flex flex-col">
              <span className="mb-3  mb-4 font-bold text-gray-400">
                {record.name}
              </span>
              <span>{record.count}</span>
            </div>
            <div className="flex items-center justify-center rounded-md bg-primaryblue p-2 py-2">
              {record.icon}
            </div>
          </div>
        )
      })}

      {/* <div className="mx-2 flex  h-24 w-1/2 items-center justify-between rounded-md border border-gray-300 p-2 shadow-lg">
        <div>
          <h1 className="mb-3 text-lg font-bold text-gray-400">Login count</h1>
          <span>12</span>
        </div>
        <div className="w-13 h-13 flex items-center justify-center rounded-md bg-primaryblue p-5">
          <LuArrowRightSquare color="white" size={28} />
        </div>
      </div> */}
    </div>
  )
}

const FilterButton = () => {
  const filterList = ["By day", "By Week", "By Month"]
  return (
    <div className=" mt-5 flex w-full flex-wrap px-3">
      {filterList.map((x, index) => {
        return (
          <div
            key={index} // Always include a key prop when rendering lists
            className={`items-cente2 mx-1 mb-2 flex cursor-pointer justify-center rounded-md p-2 px-8 py-2 ${
              index === 0 ? "bg-primaryblue" : "bg-gray-400"
            }`}
          >
            <span className="font-bold text-white"> {x}</span>
          </div>
        )
      })}
    </div>
  )
}

const CutomerNameInfo = ({ handleShowDetail, customerInfo }: any) => {
  return (
    <div>
      <div>
        <span className="text-xl font-bold text-primaryblue">
          {customerInfo?.name}
        </span>
        <Score score={4} otherClasses="" color={"bg-green-500"} />
      </div>
      <span
        className="cursor-pointer font-bold text-primaryblue underline underline-offset-4"
        onClick={() => {
          handleShowDetail()
        }}
      >
        View details
      </span>
    </div>
  )
}
const DetailInformation = ({ handleShowDetail, customerInfo }: any) => {
  return (
    <div className="col-span-4 border-r-4 border-transparent p-2 shadow-[2px_4px_4px_rgba(0,0,0,0.2)]">
      <div className="flex items-center justify-end">
        <div
          className="flex h-8 w-8 cursor-pointer items-center justify-center rounded-full border border-gray-300 shadow-lg"
          onClick={() => handleShowDetail()}
        >
          <RxCross2 size={25} color="gray" />
        </div>
      </div>
      {/* <CustomerInfo /> */}
      <CustomerDetails customerInfo={customerInfo} />
    </div>
  )
}

const ActivityChart = () => {
  // Sample data for the chart
  const data = {
    labels: ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday"],
    datasets: [
      {
        label: "Login Activities",
        data: [30, 45, 20, 35, 50, 40], // Sample data
        borderColor: "rgb(252, 205, 42)",
        backgroundColor: "rgb(252, 205, 42)",
        fill: true,
      },
      {
        label: "Feature 1",
        data: [15, 30, 45, 20, 15, 25], // Sample data
        borderColor: "rgb(52, 121, 40)",
        backgroundColor: "rgb(52, 121, 40)",
        fill: true,
      },
      {
        label: "Feature 2",
        data: [0, 15, 30, 45, 60, 30], // Sample data
        borderColor: "rgb(33, 51, 99)",
        backgroundColor: "rgb(33, 51, 99)",
        fill: true,
      },
    ],
  }

  // Options for the chart
  const options: any = {
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          stepSize: 15,
        },
      },
    },
    // plugins: {
    //   legend: {
    //     position: "right",
    //   },
    // },
  }

  return (
    <div className="h-[300px] w-[900px] ">
      <Line data={data} options={options} />
    </div>
  )
}

export default function CustomerDetailPage() {
  const param = useSearchParams()
  const { orgCustomers } = useOrgCustomer()

  const customerName = param.get("name")
  const { user_data, access_token } = useAuth()

  const [customerInfo, setCustomerInfo] = useState<any>(null)
  const [showDetail, setShowDetail] = useState(false)

  const [activeTab, setActiveTab] = useState("Overview")

  const {
    orgCustomers: refetchRecord,
    loading,
    error,
    refetch,
  } = useFetchOrgCustomers(user_data?.organization, access_token)

  useEffect(() => {
    const customer = orgCustomers.customers.find(
      (x: any) => x.name === customerName
    )
    setCustomerInfo(customer)
  }, [customerName])

  useEffect(() => {
    refetch()
  }, [orgCustomers?.customers.length == 0])

  useEffect(() => {
    const customer = refetchRecord?.customers?.find(
      (x: any) => x.name === customerName
    )
    setCustomerInfo(customer)
  }, [refetchRecord?.customers?.length > 0])

  const handleShowDetail = () => {
    setShowDetail(!showDetail)
  }

  const OverViewDisplay = (
    <>
      <Metrics showDetail={showDetail} customerInfo={customerInfo} />
      <FilterButton />
      <ActivityChart />
    </>
  )

  let SelectedTabView = null
  if (activeTab === "Overview") {
    SelectedTabView = OverViewDisplay
  } else if (activeTab === "Chat conversation") {
    SelectedTabView = <ChatConversation />
  }

  if (showDetail) {
    return (
      <div className="mx-4 h-screen ">
        <div className="grid  w-full grid-cols-12">
          <DetailInformation
            customerInfo={customerInfo}
            handleShowDetail={() => {
              handleShowDetail()
            }}
          />
          <div className={`col-span-8 mx-4 mt-1 `}>
            <TabList
              showDetail={showDetail}
              handleChange={(tabName: string) => {
                setActiveTab(tabName)
              }}
            />
            {SelectedTabView}
          </div>
        </div>
      </div>
    )
  } else {
    return (
      <div className="mx-4 flex h-screen flex-col">
        {/* <div className="grid w-full grid-cols-12"> */}
        <CutomerNameInfo
          handleShowDetail={handleShowDetail}
          customerInfo={customerInfo}
        />
        <div className={`col-span-12 mt-4`}>
          <TabList
            handleChange={(tabName: string) => {
              console.log("tabname", tabName)
              setActiveTab(tabName)
            }}
          />
          {SelectedTabView}
        </div>
      </div>
    )
  }
}

{
  /* <div className="mx-2 flex w-1/2 bg-red-400 p-2 border border-gray-300 shadow-lg rounded-lg"> */
}
