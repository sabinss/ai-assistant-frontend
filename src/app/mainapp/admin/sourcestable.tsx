import React, { useState } from "react"
import {
  Table,
  TableHeader,
  TableRow,
  TableHead,
  TableBody,
  TableCell,
} from "@/components/ui/table"
import { DeleteIcon, Search, Trash2 } from "lucide-react"
import dummyData from "../../../store/data"
import { Button } from "@/components/ui/button"

export default function SourceTable() {
  const [searchQuery, setSearchQuery] = useState("")
  const sources = dummyData.sources.filter((source) =>
    source.name.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const handleSearchChange = (event: any) => {
    setSearchQuery(event.target.value)
  }

  return (
    <div className="DeleteDocuments h-[50vh] p-2">
      <p className="text-lg">Delete Your Documents</p>
      <div>
        <div className="flex w-1/2 items-center rounded-md border p-2">
          <Search />
          <input
            className="border-0 px-2 text-sm outline-none active:outline-none"
            placeholder="Search Your Documents here"
            value={searchQuery}
            onChange={handleSearchChange}
          />
        </div>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Source ID:</TableHead>
              <TableHead>Name</TableHead>
              <TableHead>Date</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {sources.map((source, index) => (
              <TableRow key={index}>
                <TableCell className="font-medium">{source.id}</TableCell>
                <TableCell>{source.name}</TableCell>
                <TableCell>{source.date}</TableCell>
                <TableCell className="text-right">
                  <button>
                    <Trash2 />
                  </button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}
