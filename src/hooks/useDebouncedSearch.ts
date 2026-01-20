import { useCallback, useEffect, useRef } from 'react'

export const useDebouncedSearch = <Args extends unknown[]>(
  callback: (...args: Args) => void,
  delayMs = 400,
) => {
  const timeoutRef = useRef<number | null>(null)

  const cancel = useCallback(() => {
    if (timeoutRef.current !== null) {
      window.clearTimeout(timeoutRef.current)
      timeoutRef.current = null
    }
  }, [])

  const run = useCallback(
    (...args: Args) => {
      cancel()
      timeoutRef.current = window.setTimeout(() => {
        callback(...args)
      }, delayMs)
    },
    [callback, cancel, delayMs],
  )

  useEffect(() => cancel, [cancel])

  return { run, cancel }
}
