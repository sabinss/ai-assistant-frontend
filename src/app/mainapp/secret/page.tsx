"use client"
import http from "@/config/http"
import React, { useState } from "react"

const Secret = () => {
  const [sampleText, setSampleText] = useState(
    "Seed the Database with User Roles, User Status, Gpt models and Api key and get the api key"
  )
  const [textAreaValue, setTextAreaValue] = useState("")

  const handleCopy = () => {
    navigator.clipboard.writeText(textAreaValue)
    alert("Text copied to clipboard!")
  }
  const handleClick = async () => {
    const res = await http.get("/seed")
    setSampleText("seeded successfully")
    setTextAreaValue(res?.data?.key)
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gray-100">
      <p className="mb-4 text-lg">{sampleText}</p>
      <button
        className="mb-4 rounded bg-[#174894] px-4 py-2 font-bold text-white hover:bg-blue-700"
        onClick={handleClick}
      >
        Begin Seeding
      </button>

      <div className="w-full max-w-md">
        <p className="w-full rounded-lg border px-3 py-2 text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-400">
          {textAreaValue}
        </p>
        <button
          onClick={handleCopy}
          className="mt-2 rounded bg-[#174894] px-4 py-2 font-bold text-white hover:bg-blue-700"
        >
          Click to Copy
        </button>
      </div>
    </div>
  )
}

export default Secret
