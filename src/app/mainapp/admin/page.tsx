import React from "react"
import PopularSources from "./popular"
import Graph from "./graph"
import Cards from "./cards"
import ConvoGraph from "./convograph"

const Admin = () => {
  return (
    <div>
      <Cards />
      <div className="flex flex-col gap-2 p-2 md:flex-row">
        <div className="md:w-1/2">{/* <Graph /> */}</div>
        <div className="md:w-1/2">{/* <PopularSources /> */}</div>
      </div>
      <div className="mb-10 rounded-md bg-white p-4">
        <ConvoGraph />
      </div>
    </div>
  )
}

export default Admin
