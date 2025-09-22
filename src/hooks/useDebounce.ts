import { useState, useEffect } from "react"

export function useDebounce(value: string, delay: 500) {
  const [debounceValue, setDebounceValue] = useState(value)

  useEffect(() => {
    const handler = setTimeout(() => setDebounceValue(value), delay)
    return () => clearTimeout(handler)
  }, [value, delay])

  return debounceValue
}
