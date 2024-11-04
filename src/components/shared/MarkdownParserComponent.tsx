"use client"
import React, { useEffect, useState } from "react"
import dynamic from "next/dynamic"
import { marked } from "marked"
const ReactQuill = dynamic(() => import("react-quill"), { ssr: false })
import "react-quill/dist/quill.snow.css" // Import the Quill CSS

const MarkdownParserComponent = ({ value, handleOnChange }: any) => {
  return (
    <ReactQuill
      value={value}
      onChange={(value) => {
        handleOnChange(value)
      }}
      theme="snow" // or 'bubble'
    />
  )
}

export default MarkdownParserComponent
