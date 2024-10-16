import React from "react"
import { RxCross2 } from "react-icons/rx"
import { Button } from "../ui/button"

export const CustomModal = ({
  children,
  headerTitle,
  onClose,
  onSave,
}: any) => {
  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-25 backdrop-blur-sm ">
      <div className="flex w-[700px] flex-col bg-white">
        <div className="rounded-md">
          <div className="font-md flex w-full justify-between bg-[#174894] p-2 text-lg font-bold text-white">
            {headerTitle}
            <div
              className="flex h-8 w-8 cursor-pointer items-center justify-center rounded-md bg-white"
              onClick={onClose}
            >
              <RxCross2 color="black" size={27} />
            </div>
          </div>
          <div className="p-2">{children}</div>
          <div className="mb-4 flex justify-end gap-3 pr-4">
            <Button
              onClick={onSave}
              className=" bg-[#174894] px-4 py-1 font-semibold hover:bg-[#173094]"
            >
              <span className="ml-2">Save</span>
            </Button>
            <Button
              onClick={onClose}
              className=" bg-[#174894] px-4 py-1 font-semibold hover:bg-[#173094]"
            >
              <span className="ml-2">Cancel</span>
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
