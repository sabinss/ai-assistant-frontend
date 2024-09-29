import App from "next/app"
import React from "react"

// Score component
const Score = ({ score, color }: any) => {
  // Generate an array of 5 elements, where each element represents a circle
  const circles = Array.from({ length: 5 }, (_, index) => (
    <span
      key={index}
      className={`mr-1 inline-block h-3 w-3 rounded-full ${index < score ? color : "bg-gray-300"}`}
    />
  ))

  return <div>{circles}</div>
}

export default Score
