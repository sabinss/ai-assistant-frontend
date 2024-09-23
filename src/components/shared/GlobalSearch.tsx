import React from "react"
import { Input } from "@/components/ui/input"

const GlobalSearch = ({ otherClasses }: any) => {
  return (
    <div
      className={` ${otherClasses} background-light800_darkgradient w-full max-w-[600px]`}
    >
      Global search
    </div>
  )
}

export default GlobalSearch
