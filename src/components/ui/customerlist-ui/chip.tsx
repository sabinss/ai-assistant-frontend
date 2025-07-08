import React from "react"

const Chip = ({
  value,
  otherClasses,
  hideValue = false,
}: {
  value: any
  otherClasses: string
  hideValue?: boolean
}) => {
  return (
    <div className={`${otherClasses} flex w-14 justify-center p-2 text-white`}>
      {hideValue ? "" : value}
    </div>
  )
}

export default Chip
