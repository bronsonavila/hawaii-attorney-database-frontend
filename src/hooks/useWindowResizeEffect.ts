import { useEffect } from 'react'

const useWindowResizeEffect = (
  condition: (width: number, height: number) => boolean,
  callback: () => void,
  debounceDelay: number = 0
) => {
  useEffect(() => {
    let timeoutId: ReturnType<typeof setTimeout> | null = null

    const handleResize = () => {
      if (timeoutId) clearTimeout(timeoutId)

      timeoutId = setTimeout(() => {
        const width = window.innerWidth
        const height = window.innerHeight

        if (condition(width, height)) callback()
      }, debounceDelay)
    }

    window.addEventListener('resize', handleResize)

    handleResize()

    return () => {
      window.removeEventListener('resize', handleResize)

      if (timeoutId) clearTimeout(timeoutId)
    }
  }, [condition, callback, debounceDelay])
}

export default useWindowResizeEffect
