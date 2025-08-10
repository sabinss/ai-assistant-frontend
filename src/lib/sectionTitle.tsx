import React from "react"
import { cn } from "./utils"

export function renderSectionTitle(title: string, className?: string) {
  return (
    <h3
      className={cn(
        "mb-4 text-left text-xl font-medium text-gray-800",
        className
      )}
    >
      {title}
    </h3>
  )
}
