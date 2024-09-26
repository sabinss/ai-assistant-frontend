"use client"
import Score from "@/components/ui/customerlist-ui/Score"
import { RxCross2 } from "react-icons/rx"
import Chip from "@/components/ui/customerlist-ui/chip"
import { MdOutlineModeEdit } from "react-icons/md"
import { LuArrowRightSquare } from "react-icons/lu"

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

const CustomerDetails = () => {
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
      <Row data={{ key: "Name", value: "John doe" }} />
      <Row data={{ key: "Contact", value: "John Felix" }} />
      <Row data={{ key: "Email", value: "john@esewa.com" }} />
      <Row data={{ key: "ARR", value: "34000" }} />
      <Row data={{ key: "Renewal date", value: "12/03/2024" }} />
      <Row data={{ key: "No. of License purchase", value: "1000" }} />
      <Row data={{ key: "No. of License used", value: "800" }} />
      <Row data={{ key: "CSM agents", value: "12,3133,22" }} />
    </div>
  )
}

const TabList = () => {
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
            key={index} // Always include a key prop when rendering lists
            className={`items-cente2 mx-1 mb-2 flex justify-center rounded-md p-2 ${
              index === 0 ? "bg-primaryblue" : "bg-gray-400"
            }`}
          >
            <span className="font-bold text-white"> {tab}</span>
          </div>
        )
      })}
    </div>
  )
}

const Metrics = () => {
  return (
    <div className="mx-2 mt-3 flex w-full justify-between">
      <div className="mx-2 flex  h-24 w-1/2 items-center justify-between rounded-md border border-gray-300 p-2 shadow-lg">
        <div>
          <h1 className="mb-3 text-lg font-bold text-gray-400">Login count</h1>
          <span>12</span>
        </div>
        <div className="w-13 h-13 flex items-center justify-center rounded-md bg-primaryblue p-5">
          <LuArrowRightSquare color="white" size={28} />
        </div>
      </div>
      <div className="mx-2 flex  h-24 w-1/2 items-center justify-between rounded-md border border-gray-300 p-2 shadow-lg">
        <div>
          <h1 className="mb-3 text-lg font-bold text-gray-400">Login count</h1>
          <span>12</span>
        </div>
        <div className="w-13 h-13 flex items-center justify-center rounded-md bg-primaryblue p-5">
          <LuArrowRightSquare color="white" size={28} />
        </div>
      </div>
    </div>
  )
}

const FilterButton = () => {
  const filterList = ["By day", "By Week", "By Month"]
  return (
    <div className="bg-red mt-10 flex w-full flex-wrap px-3">
      {filterList.map((x, index) => {
        return (
          <div
            key={index} // Always include a key prop when rendering lists
            className={`items-cente2 mx-1 mb-2 flex justify-center rounded-md p-2 px-8 py-3 ${
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

const CustomerDetailPage = () => {
  return (
    <div className="grid h-screen w-full grid-cols-12">
      <div className="col-span-4 border-r-4 border-transparent p-2 shadow-[2px_4px_4px_rgba(0,0,0,0.2)]">
        <div className="flex items-center justify-end">
          <div className="flex h-8 w-8 items-center justify-center rounded-full border border-gray-300 shadow-lg">
            <RxCross2 size={25} color="gray" />
          </div>
        </div>
        <CustomerInfo />
        <CustomerDetails />
      </div>
      <div className="col-span-8 p-2 ">
        <TabList />
        <Metrics />
        <FilterButton />
      </div>
    </div>
  )
}

export default CustomerDetailPage
{
  /* <div className="mx-2 flex w-1/2 bg-red-400 p-2 border border-gray-300 shadow-lg rounded-lg"> */
}
