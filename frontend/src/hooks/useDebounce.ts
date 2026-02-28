import { useState, useEffect } from "react"

/**
 * Returns a debounced copy of the provided value that only updates after
 * the specified delay has elapsed with no new changes.
 *
 * @param value - The value to debounce
 * @param delay - Milliseconds to wait before updating the debounced value
 * @returns The debounced value
 *
 * @example
 * const [query, setQuery] = useState("")
 * const debouncedQuery = useDebounce(query, 300)
 * // debouncedQuery updates 300ms after the user stops typing
 */
export function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value)

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedValue(value)
    }, delay)

    return () => {
      clearTimeout(timer)
    }
  }, [value, delay])

  return debouncedValue
}

export default useDebounce

