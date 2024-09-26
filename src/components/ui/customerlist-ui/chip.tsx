import React from "react"

const Chip = ({
  value,
  otherClasses,
}: {
  value: any
  otherClasses: string
}) => {
  return (
    <div className={`${otherClasses} flex w-14 justify-center p-2`}>
      {value}
    </div>
  )
}

export default Chip
