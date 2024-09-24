"use client"
import Score from "@/components/ui/customerlist-ui/Score"
import { RxCross2 } from "react-icons/rx"
import Chip from "@/components/ui/customerlist-ui/chip"

const CustomerDetail = () => {
  return (
    <div className="grid h-screen w-full grid-cols-12">
      <div className="col-span-5 border-r-4 border-transparent p-2 shadow-[2px_0_4px_rgba(0,0,0,0.2)]">
        <div className="flex items-center justify-end">
          <div className="flex h-8 w-8 items-center justify-center rounded-full border border-gray-300 shadow-lg">
            <RxCross2 size={25} color="gray" />
          </div>
        </div>
        {/* customer name */}
        <div className="flex justify-between py-8 text-primaryblue">
          <div>
            Esewa Payment
            <Score score={4} otherClasses="" color={"bg-green-500"} />
          </div>
          <div>
            <Chip
              value={10.0}
              otherClasses="bg-green-500 text-white font-bold"
            />
          </div>
        </div>
      </div>
      <div className="col-span-7 p-2 ">div1</div>
    </div>
  )
}

export default CustomerDetail
