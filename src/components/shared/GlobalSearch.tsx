import React from "react"
import { Input } from "@/components/ui/input"

const GlobalSearch = ({ otherClasses }: any) => {
  return (
    <div className="relative w-full max-w-[600px]">
      <div className="background-light800_darkgradient relative flex min-h-[56px] grow items-center gap-1 rounded-xl px-4">
        <Input
          type="text"
          placeholder="Search globally"
          value=""
          className="paragraph-regular no-focus placeholder background-light800_darkgradient border-none shadow-none outline-none"
        />
      </div>
    </div>
  )
}

export default GlobalSearch

// <div className="w-2/4">
// <form>
//   <div className="flex min-h-10 w-96 rounded-md border border-gray-500  pl-1  text-sm">
//     <input
//       id="default-search"
//       className="w-full  border-none  border-gray-100 p-1 text-black outline-none"
//       placeholder="Search"
//       required
//     />
//     <button className="inline-flex items-center rounded  px-4 py-2 font-bold text-gray-400">
//       <svg
//         className="h-4 w-4"
//         aria-hidden="true"
//         xmlns="http://www.w3.org/2000/svg"
//         fill="none"
//         viewBox="0 0 20 20"
//       >
//         <path
//           stroke="currentColor"
//           stroke-linecap="round"
//           stroke-linejoin="round"
//           stroke-width="2"
//           d="m19 19-4-4m0-7A7 7 0 1 1 1 8a7 7 0 0 1 14 0Z"
//         />
//       </svg>
//     </button>
//   </div>
// </form>
// </div>
